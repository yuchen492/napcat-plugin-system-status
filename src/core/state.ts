import fs from 'fs';
import path from 'path';
import type { NapCatPluginContext } from 'napcat-types/napcat-onebot/network/plugin/types';
import { DEFAULT_CONFIG, type PluginConfig, type PluginStats } from '../types';

class PluginState {
    private ctx: NapCatPluginContext | null = null;
    public config: PluginConfig = { ...DEFAULT_CONFIG };
    public stats: PluginStats = {
        requestCount: 0,
        lastRequestedTime: '从未',
        lastRequestedUser: '无',
    };
    public startTime: number = Date.now();
    public onConfigChange?: () => void;

    private getStatsFilePath(): string {
        if (!this.ctx?.configPath) {
            return path.resolve(process.cwd(), 'stats.json');
        }
        if (this.ctx.configPath.endsWith('.json')) {
            return path.resolve(path.dirname(this.ctx.configPath), 'stats.json');
        }
        return path.resolve(this.ctx.configPath, 'stats.json');
    }

    public loadStats(): void {
        try {
            const statsFile = this.getStatsFilePath();
            if (fs.existsSync(statsFile)) {
                const data = JSON.parse(fs.readFileSync(statsFile, 'utf-8'));
                this.stats = { ...this.stats, ...data };
            }
        } catch (e) {
            this.ctx?.logger.warn('加载统计数据失败:', e);
        }
    }

    public saveStats(): void {
        try {
            const statsFile = this.getStatsFilePath();
            const dir = path.dirname(statsFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(statsFile, JSON.stringify(this.stats, null, 2), 'utf-8');
        } catch (e) {
            this.ctx?.logger.warn('保存统计数据失败:', e);
        }
    }

    public init(ctx: NapCatPluginContext): void {
        this.ctx = ctx;
        this.startTime = Date.now();
        this.loadConfig();
        this.loadStats();
    }

    private getConfigFilePath(): string {
        if (!this.ctx?.configPath) {
            return path.resolve(process.cwd(), 'config.json');
        }
        // 如果 configPath 已经以 .json 结尾，直接作为文件路径
        if (this.ctx.configPath.endsWith('.json')) {
            return this.ctx.configPath;
        }
        return path.resolve(this.ctx.configPath, 'config.json');
    }

    public loadConfig(): void {
        try {
            const cfgFile = this.getConfigFilePath();
            if (fs.existsSync(cfgFile)) {
                const data = JSON.parse(fs.readFileSync(cfgFile, 'utf-8'));
                this.config = { ...DEFAULT_CONFIG, ...data };
                this.ctx?.logger.info('配置加载成功');
            } else {
                this.saveConfig();
            }
        } catch (e) {
            this.ctx?.logger.error('加载配置文件失败，使用默认配置:', e);
            this.config = { ...DEFAULT_CONFIG };
        }
    }

    public saveConfig(): void {
        try {
            const cfgFile = this.getConfigFilePath();
            const dir = path.dirname(cfgFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(cfgFile, JSON.stringify(this.config, null, 2), 'utf-8');
            this.ctx?.logger.info('配置文件已保存');
        } catch (e) {
            this.ctx?.logger.error('保存配置文件失败:', e);
        }
    }

    public updateConfig(updates: Partial<PluginConfig>): void {
        this.config = { ...this.config, ...updates };
        this.saveConfig();
        this.onConfigChange?.();
    }

    public replaceConfig(newConfig: PluginConfig): void {
        this.config = { ...DEFAULT_CONFIG, ...newConfig };
        this.saveConfig();
        this.onConfigChange?.();
    }

    public recordRequest(userId: string): void {
        this.stats.requestCount++;
        const now = new Date();
        const timeStr = now.toLocaleDateString('zh-CN', { hour12: false }) + ' ' + now.toLocaleTimeString('zh-CN', { hour12: false });
        this.stats.lastRequestedTime = timeStr;
        this.stats.lastRequestedUser = userId;
        this.saveStats();
    }

    public getUptime(): number {
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    public getUptimeFormatted(): string {
        const seconds = this.getUptime();
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

    public cleanup(): void {
        this.ctx = null;
    }
}

export const pluginState = new PluginState();
