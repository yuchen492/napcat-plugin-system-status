import type {
    PluginModule,
    PluginConfigSchema,
    NapCatPluginContext,
} from 'napcat-types/napcat-onebot/network/plugin/types';
import { EventType } from 'napcat-types/napcat-onebot/event/index';

import { buildConfigSchema } from './config';
import { pluginState } from './core/state';
import { handleMessage } from './handlers/message-handler';
import { registerApiRoutes } from './services/api-service';
import type { PluginConfig } from './types';

// ==================== 配置 UI Schema ====================

export let plugin_config_ui: PluginConfigSchema = [];

// ==================== 生命周期函数 ====================

/**
 * 插件初始化
 */
export const plugin_init: PluginModule['plugin_init'] = async (ctx) => {
    try {
        pluginState.init(ctx);
        ctx.logger.info('🛠️ 系统状态监控插件初始化中...');

        // 生成简易配置 Schema
        plugin_config_ui = buildConfigSchema(ctx);

        // 注册 WebUI 页面和静态资源
        registerWebUI(ctx);

        // 注册 API 路由
        registerApiRoutes(ctx);

        ctx.logger.info('✅ 系统状态监控插件已就绪');
    } catch (error) {
        ctx.logger.error('系统状态插件初始化失败:', error);
    }
};

/**
 * 消息处理（普通接收到的消息）
 */
export const plugin_onmessage: PluginModule['plugin_onmessage'] = async (ctx, event) => {
    if (event.post_type !== EventType.MESSAGE) return;
    if (!pluginState.config.enabled) return;
    await handleMessage(ctx, event);
};

/**
 * 综合事件处理（用于捕获客户端自己发出的 message_sent 事件）
 */
export const plugin_onevent: PluginModule['plugin_onevent'] = async (ctx, event) => {
    // 监听自己发送出去的消息
    if ((event as any).post_type === 'message_sent') {
        if (!pluginState.config.enabled) return;
        await handleMessage(ctx, event);
    }
};

/**
 * 插件卸载/重载
 */
export const plugin_cleanup: PluginModule['plugin_cleanup'] = async (ctx) => {
    try {
        pluginState.cleanup();
        ctx.logger.info('🛑 系统状态监控插件已卸载');
    } catch (e) {
        ctx.logger.warn('插件卸载时出错:', e);
    }
};

// ==================== 配置管理钩子 ====================

export const plugin_get_config: PluginModule['plugin_get_config'] = async (_ctx) => {
    return pluginState.config;
};

export const plugin_set_config: PluginModule['plugin_set_config'] = async (ctx, config) => {
    pluginState.replaceConfig(config as PluginConfig);
    ctx.logger.info('配置已通过 WebUI 更新');
};

export const plugin_on_config_change: PluginModule['plugin_on_config_change'] = async (
    ctx, _ui, key, value, _currentConfig
) => {
    try {
        pluginState.updateConfig({ [key]: value });
        ctx.logger.info(`⚙️ 配置项 ${key} 已更新`);
    } catch (err) {
        ctx.logger.error(`更新配置项 ${key} 失败:`, err);
    }
};

// ==================== 内部函数 ====================

function registerWebUI(ctx: NapCatPluginContext): void {
    const router = ctx.router;

    // 托管前端静态资源
    router.static('/static', 'webui');

    // 注册控制台页面
    router.page({
        path: 'dashboard',
        title: '系统状态',
        htmlFile: 'webui/index.html',
        description: '系统状态监控与白名单管理控制台',
    });

    ctx.logger.debug('WebUI 路由注册完成');
}
