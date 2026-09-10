import type { NapCatPluginContext } from 'napcat-types/napcat-onebot/network/plugin/types';
import { pluginState } from '../core/state';
import { collectSystemMetrics } from '../services/system';
import type { PluginConfig } from '../types';

export function registerApiRoutes(ctx: NapCatPluginContext): void {
    const router = ctx.router;

    // 获取当前状态与硬件数据
    router.getNoAuth('/status', async (_req, res) => {
        try {
            const metrics = await collectSystemMetrics();
            res.json({
                code: 0,
                data: {
                    pluginName: ctx.pluginName,
                    uptime: pluginState.getUptime(),
                    uptimeFormatted: pluginState.getUptimeFormatted(),
                    config: pluginState.config,
                    stats: pluginState.stats,
                    metrics,
                },
            });
        } catch (err) {
            res.status(500).json({ code: -1, message: String(err) });
        }
    });

    // 获取配置
    router.getNoAuth('/config', (_req, res) => {
        res.json({ code: 0, data: pluginState.config });
    });

    // 保存配置
    router.postNoAuth('/config', async (req, res) => {
        try {
            const body = req.body as Record<string, unknown> | undefined;
            if (!body) {
                return res.status(400).json({ code: -1, message: '请求体为空' });
            }
            pluginState.updateConfig(body as Partial<PluginConfig>);
            ctx.logger.info('配置已通过 WebUI 更新');
            res.json({ code: 0, message: 'ok' });
        } catch (err) {
            ctx.logger.error('保存配置失败:', err);
            res.status(500).json({ code: -1, message: String(err) });
        }
    });
}
