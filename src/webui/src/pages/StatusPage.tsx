import type { PluginStatus } from '../types'
import { IconRefresh } from '../components/icons'

interface StatusPageProps {
    status: PluginStatus | null
    onRefresh: () => void
}

export default function StatusPage({ status, onRefresh }: StatusPageProps) {
    if (!status) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400 dark:text-gray-500">正在采集服务器运行状态...</div>
            </div>
        )
    }

    const m = status.metrics
    const cards = [
        { label: 'CPU 占用率', value: `${m?.cpuUsage ?? 0}%`, sub: `${m?.cpuCores ?? 0} 核心`, icon: '⚡' },
        { label: '内存占用率', value: `${m?.memUsage ?? 0}%`, sub: `${m?.memUsed ?? '0'} / ${m?.memTotal ?? '0'}`, icon: '🧠' },
        { label: '磁盘占用率', value: `${m?.diskUsage ?? 0}%`, sub: `${m?.diskUsed ?? '0'} / ${m?.diskTotal ?? '0'}`, icon: '💾' },
        { label: '指令触发次数', value: String(status.stats?.requestCount ?? 0), sub: `最近: ${status.stats?.lastRequestedUser || '无'}`, icon: '📊' },
    ]

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* 顶栏操作区 */}
            <div className="flex justify-between items-center bg-white dark:bg-[#25262B] rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    运行节点：<span className="font-semibold text-gray-900 dark:text-white">{m?.location || '未知'}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    外网IP (脱敏)：<code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 font-mono text-xs">{m?.ipMasked || '未知'}</code>
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
                >
                    <IconRefresh size={14} />
                    <span>刷新状态</span>
                </button>
            </div>

            {/* 统计指标卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white dark:bg-[#25262B] rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{card.icon}</span>
                            <span className="text-xs text-gray-400">{card.sub}</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{card.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</div>
                    </div>
                ))}
            </div>

            {/* 系统硬件与节点明细 */}
            <div className="bg-white dark:bg-[#25262B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">服务器环境与节点明细</h2>
                    <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium">
                        {m?.virt || '未知架构'}
                    </span>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">操作系统</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1">{m?.osName} ({m?.arch})</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">CPU 处理器型号</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">{m?.cpuModel}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">所属机房 / 运营商 (ISP)</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1">{m?.isp || '未知'}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">系统平均负载 (1/5/15分)</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1">{m?.loadAvg || '无'}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">系统持续运行时间</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1">{m?.uptimeFormatted || '0秒'}</div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">最近触发时间</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1">{status.stats?.lastRequestedTime || '从未'}</div>
                    </div>
                </div>
            </div>

            {/* 插件状态 */}
            <div className="bg-white dark:bg-[#25262B] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">插件运行状态</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">插件开关</span>
                        <div className={`font-medium mt-1 ${status.config.enabled ? 'text-emerald-600' : 'text-red-500'}`}>
                            {status.config.enabled ? '● 运行中' : '○ 已停用'}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">自身上报响应</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                            {status.config.respond_self ? '已启用 (支持同号)' : '已禁用'}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">白名单鉴权</span>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mt-1">
                            {status.config.whitelist_only ? '仅白名单用户' : '允许所有人'}
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 dark:text-gray-400">触发指令</span>
                        <div className="font-medium text-blue-600 dark:text-blue-400 mt-1 text-xs truncate">
                            {status.config.command_prefix}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
