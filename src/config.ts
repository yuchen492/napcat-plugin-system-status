import type { PluginConfigSchema, NapCatPluginContext } from 'napcat-types/napcat-onebot/network/plugin/types';
import { DEFAULT_CONFIG } from './types';

export { DEFAULT_CONFIG };

/**
 * 构建 NapCat 官方简易 WebUI 配置 Schema
 */
export function buildConfigSchema(ctx: NapCatPluginContext): PluginConfigSchema {
    const { NapCatConfig } = ctx;

    return NapCatConfig.combine(
        NapCatConfig.html('<div style="padding:10px; border-bottom:1px solid #ccc;"><h3>🖥️ 系统状态监控</h3><p style="font-size:12px; color:#888;">支持通过指令查询服务器运行状态，并支持白名单与自身上报</p></div>'),
        NapCatConfig.boolean('enabled', '启用插件', DEFAULT_CONFIG.enabled, '全局功能开关'),
        NapCatConfig.text('command_prefix', '触发指令', DEFAULT_CONFIG.command_prefix, '多个指令用英文逗号隔开，如：/系统状态,#系统状态,系统状态'),
        NapCatConfig.boolean('respond_self', '响应自身外发消息', DEFAULT_CONFIG.respond_self, '是否响应当前账号自己（如手机端QQ）发出的指令'),
        NapCatConfig.boolean('whitelist_only', '仅限白名单查询', DEFAULT_CONFIG.whitelist_only, '开启后非白名单用户查询将静默忽略'),
        NapCatConfig.boolean('show_ip', '显示外网IP(脱敏)', DEFAULT_CONFIG.show_ip, '是否在状态卡片中展示脱敏IP'),
        NapCatConfig.boolean('show_location', '显示所属节点与机房', DEFAULT_CONFIG.show_location, '是否在状态卡片中展示节点归属与机房'),
        NapCatConfig.boolean('show_city', '显示当前城市', DEFAULT_CONFIG.show_city, '是否展示详细城市信息（获取不到时自动回退为节点位置）'),
        NapCatConfig.boolean('show_virt', '显示虚拟化架构', DEFAULT_CONFIG.show_virt, '是否显示 VPS 虚拟化类型 (KVM/LXC等)'),
        NapCatConfig.boolean('show_load', '显示系统负载', DEFAULT_CONFIG.show_load, '是否展示 1/5/15 分钟 Load Average'),
        NapCatConfig.boolean('show_uptime', '显示运行时长', DEFAULT_CONFIG.show_uptime, '是否展示系统持续运行时间'),
        NapCatConfig.boolean('debug', '调试日志', DEFAULT_CONFIG.debug, '是否输出详细日志'),
    );
}
