/** WebUI 前端类型定义 */

export interface SystemMetrics {
    osName: string
    arch: string
    virt: string
    uptimeFormatted: string
    loadAvg: string
    cpuModel: string
    cpuCores: number
    cpuUsage: number
    memTotal: string
    memUsed: string
    memUsage: number
    diskTotal: string
    diskUsed: string
    diskUsage: number
    ipMasked: string
    location: string
    isp: string
}

export interface PluginConfig {
    enabled: boolean
    command_prefix: string
    respond_self: boolean
    whitelist_only: boolean
    whitelist_users: string[]
    whitelist_groups: string[]
    show_load: boolean
    show_uptime: boolean
    show_ip: boolean
    show_location: boolean
    show_virt: boolean
    debug: boolean
}

export interface PluginStatus {
    pluginName: string
    uptime: number
    uptimeFormatted: string
    config: PluginConfig
    stats: {
        requestCount: number
        lastRequestedTime: string
        lastRequestedUser: string
    }
    metrics: SystemMetrics
}

export interface ApiResponse<T = unknown> {
    code: number
    data?: T
    message?: string
}
