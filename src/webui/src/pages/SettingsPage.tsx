import { useState, useEffect } from 'react'
import type { PluginConfig } from '../types'
import { showToast } from '../hooks/useToast'
import { noAuthFetch } from '../utils/api'

export default function SettingsPage() {
    const [config, setConfig] = useState<PluginConfig | null>(null)
    const [saving, setSaving] = useState(false)
    const [userWhiteInput, setUserWhiteInput] = useState('')
    const [groupWhiteInput, setGroupWhiteInput] = useState('')

    useEffect(() => {
        noAuthFetch<PluginConfig>('/config')
            .then(res => {
                if (res.code === 0 && res.data) {
                    setConfig(res.data)
                    setUserWhiteInput((res.data.whitelist_users || []).join('\n'))
                    setGroupWhiteInput((res.data.whitelist_groups || []).join('\n'))
                }
            })
            .catch(() => showToast('获取配置失败', 'error'))
    }, [])

    const handleSave = async () => {
        if (!config) return
        setSaving(true)
        try {
            const updatedUsers = userWhiteInput.split('\n').map(s => s.trim()).filter(Boolean)
            const updatedGroups = groupWhiteInput.split('\n').map(s => s.trim()).filter(Boolean)

            const payload: PluginConfig = {
                ...config,
                whitelist_users: updatedUsers,
                whitelist_groups: updatedGroups,
            }

            const data = await noAuthFetch('/config', {
                method: 'POST',
                body: JSON.stringify(payload),
            })
            if (data.code === 0) {
                setConfig(payload)
                showToast('配置保存成功！', 'success')
            } else {
                showToast(data.message || '保存配置失败', 'error')
            }
        } catch (e) {
            showToast('保存配置网络异常', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (!config) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-400">加载配置中...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in-up max-w-4xl">
            {/* 基础运行设置 */}
            <div className="bg-white dark:bg-[#25262B] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">基本交互设置</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">启用插件功能</div>
                            <div className="text-xs text-gray-400">开启或关闭本插件的所有指令响应</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.enabled}
                            onChange={e => setConfig({ ...config, enabled: e.target.checked })}
                            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">响应自身上报消息 (message_sent)</div>
                            <div className="text-xs text-gray-400">允许当前登录账号自己（如手机 QQ 客户端）发送指令并获得回复</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.respond_self}
                            onChange={e => setConfig({ ...config, respond_self: e.target.checked })}
                            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                        />
                    </div>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                            触发命令前缀 (多个指令请使用英文逗号分隔)
                        </label>
                        <input
                            type="text"
                            value={config.command_prefix}
                            onChange={e => setConfig({ ...config, command_prefix: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="/系统状态,#系统状态,系统状态"
                        />
                    </div>
                </div>
            </div>

            {/* 白名单权限控制 */}
            <div className="bg-white dark:bg-[#25262B] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">白名单鉴权控制</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">仅允许白名单触发</div>
                            <div className="text-xs text-gray-400">未授权用户发送指令时将静默忽略，不泄露服务器信息</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={config.whitelist_only}
                            onChange={e => setConfig({ ...config, whitelist_only: e.target.checked })}
                            className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                用户 QQ 白名单 (每行一个 QQ 号)
                            </label>
                            <textarea
                                rows={4}
                                value={userWhiteInput}
                                onChange={e => setUserWhiteInput(e.target.value)}
                                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="2171129194"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                                群聊白名单 (可选，留空代表不限制群)
                            </label>
                            <textarea
                                rows={4}
                                value={groupWhiteInput}
                                onChange={e => setGroupWhiteInput(e.target.value)}
                                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="群号，每行一个。留空代表所有群只要白名单用户触发均可响应"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 展示内容定制 */}
            <div className="bg-white dark:bg-[#25262B] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">展示卡片内容控制</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.show_ip}
                            onChange={e => setConfig({ ...config, show_ip: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">展示外网 IP (xxx.xxx 模糊脱敏)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.show_location}
                            onChange={e => setConfig({ ...config, show_location: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">展示地理位置与机房运营商</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.show_city}
                            onChange={e => setConfig({ ...config, show_city: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">展示当前城市 (详细到市/回退到节点)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.show_cpu_model !== false}
                            onChange={e => setConfig({ ...config, show_cpu_model: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">展示处理器型号 (紧随系统环境)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.show_virt}
                            onChange={e => setConfig({ ...config, show_virt: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">展示 VPS 虚拟化类型 (KVM/LXC等)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.show_load}
                            onChange={e => setConfig({ ...config, show_load: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">展示系统平均负载 (Load Average)</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.show_uptime}
                            onChange={e => setConfig({ ...config, show_uptime: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">展示系统持续运行时长</span>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={config.debug}
                            onChange={e => setConfig({ ...config, debug: e.target.checked })}
                            className="w-4 h-4 rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">输出详细调试日志</span>
                    </label>
                </div>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                    {saving ? '保存中...' : '保存全部设置'}
                </button>
            </div>
        </div>
    )
}
