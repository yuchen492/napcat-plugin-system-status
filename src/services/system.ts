import os from 'os';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { SystemMetrics } from '../types';

const execAsync = promisify(exec);

// 缓存网络与地理位置数据（6 小时更新一次）
let cachedIpMasked = '';
let cachedLocation = '';
let cachedCity = '';
let cachedIsp = '';
let lastNetFetchTime = 0;
const NET_CACHE_TTL = 6 * 60 * 60 * 1000;

// CPU 采样计算
let lastCpuIdle = 0;
let lastCpuTotal = 0;

function getCpuTimes() {
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (const cpu of cpus) {
        for (const type in cpu.times) {
            total += (cpu.times as any)[type];
        }
        idle += cpu.times.idle;
    }
    return { idle, total };
}

// 启动时采样一次
const initTimes = getCpuTimes();
lastCpuIdle = initTimes.idle;
lastCpuTotal = initTimes.total;

async function getCpuUsagePercent(): Promise<number> {
    const current = getCpuTimes();
    const idleDiff = current.idle - lastCpuIdle;
    const totalDiff = current.total - lastCpuTotal;

    lastCpuIdle = current.idle;
    lastCpuTotal = current.total;

    if (totalDiff <= 0) return 0;
    const usage = 100 - (idleDiff / totalDiff) * 100;
    return Math.max(0, Math.min(100, parseFloat(usage.toFixed(1))));
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number, decimals = 1): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * 格式化系统运行时长
 */
function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d > 0) parts.push(`${d}天`);
    if (h > 0 || d > 0) parts.push(`${h}小时`);
    if (m > 0 || h > 0 || d > 0) parts.push(`${m}分`);
    parts.push(`${s}秒`);
    return parts.join(' ');
}

/**
 * 识别虚拟化架构 (KVM / LXC / Docker / 物理机等)
 */
async function detectVirtualization(): Promise<string> {
    try {
        const { stdout } = await execAsync('systemd-detect-virt');
        const virt = stdout.trim();
        if (virt === 'none') return '物理机 (Bare Metal)';
        if (virt === 'container-other' || virt === 'docker') return 'Docker (容器化)';
        if (virt) return `${virt.toUpperCase()} (虚拟化)`;
    } catch {
        // 命令不存在或出错时尝试检测容器环境
    }

    try {
        if (fs.existsSync('/.dockerenv')) return 'Docker (容器化)';
        if (fs.existsSync('/proc/1/environ')) {
            const env = fs.readFileSync('/proc/1/environ', 'utf-8');
            if (env.includes('container=lxc')) return 'LXC (虚拟化)';
        }
    } catch {}

    return '未知/物理机';
}

/**
 * 模糊化 IP 地址 (保留前2段，后2段变成 xxx.xxx)
 * 例如 192.168.1.100 -> 192.168.xxx.xxx
 * 例如 31.42.12.34 -> 31.42.xxx.xxx
 */
export function maskIp(ip: string): string {
    if (!ip) return '未知';
    // IPv4
    if (ip.includes('.')) {
        const parts = ip.split('.');
        if (parts.length === 4) {
            return `${parts[0]}.${parts[1]}.xxx.xxx`;
        }
    }
    // IPv6
    if (ip.includes(':')) {
        const parts = ip.split(':');
        if (parts.length >= 4) {
            return `${parts[0]}:${parts[1]}:xxxx:xxxx::`;
        }
    }
    return ip;
}

/**
 * 获取外网 IP、城市、归属地及机房信息
 */
async function fetchNetworkInfo(): Promise<{ ip: string; location: string; city: string; isp: string }> {
    const now = Date.now();
    if (cachedIpMasked && now - lastNetFetchTime < NET_CACHE_TTL) {
        return {
            ip: cachedIpMasked,
            location: cachedLocation,
            city: cachedCity,
            isp: cachedIsp,
        };
    }

    // 优先尝试 ip-api.com
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch('http://ip-api.com/json/?lang=zh-CN', {
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
            const data: any = await res.json();
            if (data.status === 'success') {
                cachedIpMasked = maskIp(data.query || '');
                const country = data.country || '';
                const region = data.regionName || '';
                const city = data.city || '';
                
                // 拼接详细城市或默认位置
                if (city) {
                    cachedCity = region && region !== city ? `${country} ${region} ${city}` : `${country} ${city}`;
                } else if (region) {
                    cachedCity = `${country} ${region}`;
                } else {
                    cachedCity = country || '未知城市';
                }

                const locParts = [country, region].filter(Boolean);
                cachedLocation = locParts.join(' ') || '未知位置';
                cachedIsp = data.org || data.isp || data.as || '未知机房';
                lastNetFetchTime = now;

                return {
                    ip: cachedIpMasked,
                    location: cachedLocation,
                    city: cachedCity,
                    isp: cachedIsp,
                };
            }
        }
    } catch {}

    // 备用接口 ipwho.is
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch('https://ipwho.is/?lang=zh-CN', {
            signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
            const data: any = await res.json();
            if (data.success) {
                cachedIpMasked = maskIp(data.ip || '');
                const country = data.country || '';
                const region = data.region || '';
                const city = data.city || '';

                if (city) {
                    cachedCity = region && region !== city ? `${country} ${region} ${city}` : `${country} ${city}`;
                } else {
                    cachedCity = country || '未知城市';
                }

                cachedLocation = [country, region].filter(Boolean).join(' ') || '未知位置';
                cachedIsp = data.connection?.org || data.connection?.isp || '未知机房';
                lastNetFetchTime = now;

                return {
                    ip: cachedIpMasked,
                    location: cachedLocation,
                    city: cachedCity,
                    isp: cachedIsp,
                };
            }
        }
    } catch {}

    return {
        ip: cachedIpMasked || '127.0.xxx.xxx',
        location: cachedLocation || '未知机房节点',
        city: cachedCity || '未知城市',
        isp: cachedIsp || '本地回环',
    };
}

/**
 * 获取磁盘占用 (Linux df -k /)
 */
async function getDiskUsage(): Promise<{ total: string; used: string; usage: number }> {
    try {
        const { stdout } = await execAsync('df -k /');
        const lines = stdout.trim().split('\n');
        if (lines.length >= 2) {
            const parts = lines[1].split(/\s+/);
            const totalKb = parseInt(parts[1], 10);
            const usedKb = parseInt(parts[2], 10);
            if (!isNaN(totalKb) && !isNaN(usedKb) && totalKb > 0) {
                const totalBytes = totalKb * 1024;
                const usedBytes = usedKb * 1024;
                const percent = Math.min(100, parseFloat(((usedBytes / totalBytes) * 100).toFixed(1)));
                return {
                    total: formatBytes(totalBytes),
                    used: formatBytes(usedBytes),
                    usage: percent,
                };
            }
        }
    } catch {}

    return { total: '未知', used: '未知', usage: 0 };
}

/**
 * 获取系统整体状态指标
 */
export async function collectSystemMetrics(): Promise<SystemMetrics> {
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || '未知 CPU';
    const cpuCores = cpus.length;
    const cpuUsage = await getCpuUsagePercent();

    // 内存
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = parseFloat(((usedMem / totalMem) * 100).toFixed(1));

    // 负载
    const loads = os.loadavg();
    const loadAvg = loads.map(l => l.toFixed(2)).join(', ');

    // 运行时长
    const uptimeFormatted = formatUptime(os.uptime());

    // 虚拟化
    const virt = await detectVirtualization();

    // 磁盘
    const disk = await getDiskUsage();

    // 网络、机房与城市
    const net = await fetchNetworkInfo();

    return {
        osName: `${os.type()} ${os.release()}`,
        arch: os.arch(),
        virt,
        uptimeFormatted,
        loadAvg,
        cpuModel,
        cpuCores,
        cpuUsage,
        memTotal: formatBytes(totalMem),
        memUsed: formatBytes(usedMem),
        memUsage,
        diskTotal: disk.total,
        diskUsed: disk.used,
        diskUsage: disk.usage,
        ipMasked: net.ip,
        location: net.location,
        city: net.city,
        isp: net.isp,
    };
}
