import type { NapCatPluginContext } from 'napcat-types/napcat-onebot/network/plugin/types';
import type { OB11Message, OB11PostSendMsg } from 'napcat-types/napcat-onebot/event/index';
import { pluginState } from '../core/state';
import { collectSystemMetrics } from '../services/system';
import { formatSystemStatusMessage } from '../utils/formatter';

/**
 * 提取并校验指令是否匹配
 */
function isMatchedCommand(rawMessage: string, commandListStr: string): boolean {
    const trimmed = rawMessage.trim();
    const commands = commandListStr.split(',').map(c => c.trim()).filter(Boolean);
    for (const cmd of commands) {
        if (trimmed === cmd) return true;
        // 允许带参数前缀匹配
        if (trimmed.startsWith(cmd + ' ')) return true;
    }
    return false;
}

/**
 * 消息处理主入口
 */
export async function handleMessage(ctx: NapCatPluginContext, event: any): Promise<void> {
    const config = pluginState.config;
    if (!config.enabled) return;

    const rawMessage = (event.raw_message || '').trim();
    if (!rawMessage) return;

    // 判断指令是否匹配
    if (!isMatchedCommand(rawMessage, config.command_prefix)) {
        return;
    }

    const senderId = String(event.user_id || event.sender?.user_id || '');
    const isSentBySelf = event.post_type === 'message_sent';

    if (config.debug) {
        ctx.logger.info(`收到潜在指令: "${rawMessage}", 发送者: ${senderId}, 是否自身发送: ${isSentBySelf}`);
    }

    // 如果是自己发出的消息，但配置未开启响应自身
    if (isSentBySelf && !config.respond_self) {
        if (config.debug) ctx.logger.info('已忽略自身发出的消息 (respond_self 为 false)');
        return;
    }

    // 白名单鉴权检查
    if (config.whitelist_only) {
        const isSelfAllowed = isSentBySelf && config.respond_self;
        const isUserWhitelisted = config.whitelist_users.some(u => String(u).trim() === senderId);

        if (!isSelfAllowed && !isUserWhitelisted) {
            if (config.debug) {
                ctx.logger.warn(`用户 ${senderId} 未在白名单中，拒绝响应`);
            }
            return; // 静默忽略
        }

        // 如果在群聊中，且配置了群白名单
        if (event.message_type === 'group' && config.whitelist_groups && config.whitelist_groups.length > 0) {
            const groupId = String(event.group_id || '');
            const isGroupWhitelisted = config.whitelist_groups.some(g => String(g).trim() === groupId);
            if (!isGroupWhitelisted) {
                if (config.debug) {
                    ctx.logger.warn(`群组 ${groupId} 未在白名单群列表中，拒绝响应`);
                }
                return;
            }
        }
    }

    // 记录统计
    pluginState.recordRequest(senderId);

    try {
        ctx.logger.info(`正在采集系统状态以响应用户 ${senderId}...`);
        const metrics = await collectSystemMetrics();
        const replyText = formatSystemStatusMessage(metrics, config);

        // 构造发送参数
        const params: OB11PostSendMsg = {
            message: replyText,
            message_type: event.message_type === 'group' ? 'group' : 'private',
        };

        if (event.message_type === 'group' && event.group_id) {
            params.group_id = String(event.group_id);
        } else {
            // 私聊场景：若为自身发送的 message_sent，target_id 可能在 target_id 或 user_id
            const targetUser = event.target_id ? String(event.target_id) : senderId;
            params.user_id = targetUser;
        }

        await ctx.actions.call('send_msg', params, ctx.adapterName, ctx.pluginManager.config);
        ctx.logger.info(`系统状态已成功发送至 ${params.message_type}: ${params.group_id || params.user_id}`);
    } catch (error) {
        ctx.logger.error('获取或发送系统状态失败:', error);
    }
}
