/**
 * 系统状态插件类型定义
 */

export interface PluginConfig {
    /** 全局开关 */
    enabled: boolean;
    /** 触发指令（逗号分隔或单个，如 /系统状态,#系统状态,系统状态） */
    command_prefix: string;
    /** 是否响应自己发出的消息 (如手机 QQ 发送) */
    respond_self: boolean;
    /** 是否仅限白名单触发 */
    whitelist_only: boolean;
    /** 白名单用户 QQ 号列表 */
    whitelist_users: string[];
    /** 白名单群号列表 */
    whitelist_groups: string[];
    /** 是否包含 CPU 负载 */
    show_load: boolean;
    /** 是否包含运行时间 */
    show_uptime: boolean;
    /** 是否包含外网 IP (脱敏) */
    show_ip: boolean;
    /** 是否包含所属节点/机房 */
    show_location: boolean;
    /** 是否包含当前城市 */
    show_city: boolean;
    /** 是否包含虚拟化信息 */
    show_virt: boolean;
    /** 调试模式 */
    debug: boolean;
}

export const DEFAULT_CONFIG: PluginConfig = {
    enabled: true,
    command_prefix: '/系统状态,#系统状态,系统状态',
    respond_self: true,
    whitelist_only: true,
    whitelist_users: ['2171129194'],
    whitelist_groups: [],
    show_load: true,
    show_uptime: true,
    show_ip: true,
    show_location: true,
    show_city: true,
    show_virt: true,
    debug: false,
};

export interface SystemMetrics {
    osName: string;
    arch: string;
    virt: string;
    uptimeFormatted: string;
    loadAvg: string;
    cpuModel: string;
    cpuCores: number;
    cpuUsage: number;
    memTotal: string;
    memUsed: string;
    memUsage: number;
    diskTotal: string;
    diskUsed: string;
    diskUsage: number;
    ipMasked: string;
    location: string;
    city: string;
    isp: string;
}

export interface PluginStats {
    requestCount: number;
    lastRequestedTime: string;
    lastRequestedUser: string;
}
