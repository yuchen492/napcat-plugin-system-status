import type { SystemMetrics, PluginConfig } from '../types';

/**
 * 将系统指标转化为用户友好的消息文本（严格还原云白指定的排版结构）
 */
export function formatSystemStatusMessage(metrics: SystemMetrics, config: PluginConfig): string {
    const lines: string[] = [];

    lines.push('🖥️ 【服务器运行状态】');
    lines.push('━━━━━━━━━━━━━━');

    // ⚙️ 系统环境
    lines.push(`⚙️ 系统环境：${metrics.osName} (${metrics.arch})`);

    // 🧩 虚拟化架构
    if (config.show_virt) {
        lines.push(`🧩 虚拟化架构：${metrics.virt}`);
    }

    // 🌐 所属节点
    if (config.show_location) {
        lines.push(`🌐 所属节点：${metrics.location} / ${metrics.isp}`);
    }

    // 🏙️ 当前城市 (若有具体市显示具体市，无法获取或缺失则自动回退到节点位置)
    if (config.show_city) {
        const cityDisplay = metrics.city || metrics.location || '未知位置';
        lines.push(`🏙️ 当前城市：${cityDisplay}`);
    }

    // 📌 节点外网 (脱敏)
    if (config.show_ip) {
        lines.push(`📌 节点外网：${metrics.ipMasked}`);
    }

    lines.push('');
    lines.push('📊 资源占用：');

    // • CPU 占用
    lines.push(`• CPU 占用：${metrics.cpuUsage}% (${metrics.cpuCores} 核心)`);

    // • 内存占用
    lines.push(`• 内存占用：${metrics.memUsed} / ${metrics.memTotal} (${metrics.memUsage}%)`);

    // • 磁盘占用
    if (metrics.diskTotal !== '未知') {
        lines.push(`• 磁盘占用：${metrics.diskUsed} / ${metrics.diskTotal} (${metrics.diskUsage}%)`);
    }

    // • 系统负载
    if (config.show_load) {
        lines.push(`• 系统负载：${metrics.loadAvg}`);
    }

    // • 运行时长
    if (config.show_uptime) {
        lines.push(`• 运行时长：${metrics.uptimeFormatted}`);
    }

    lines.push('━━━━━━━━━━━━━━');

    return lines.join('\n');
}
