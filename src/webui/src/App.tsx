import { useState, useEffect, useCallback } from 'react'
import { useTheme } from './hooks/useTheme'
import { useStatus } from './hooks/useStatus'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ToastContainer from './components/ToastContainer'
import StatusPage from './pages/StatusPage'
import SettingsPage from './pages/SettingsPage'

export type PageId = 'status' | 'settings'

interface PageMeta {
    title: string
    description: string
}

const pageMeta: Record<PageId, PageMeta> = {
    status: { title: '状态概览', description: '查看服务器实时资源占用、硬件架构与网络归属' },
    settings: { title: '插件设置', description: '配置触发命令、白名单用户与卡片展示选项' },
}

export default function App() {
    useTheme()

    const [currentPage, setCurrentPage] = useState<PageId>('status')
    const [isScrolled, setIsScrolled] = useState(false)
    const { status, fetchStatus } = useStatus()

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 5000)
        return () => clearInterval(interval)
    }, [fetchStatus])

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setIsScrolled(e.currentTarget.scrollTop > 0)
    }, [])

    const meta = pageMeta[currentPage]

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#18191C] text-gray-900 dark:text-gray-100">
            <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <Header
                    title={meta.title}
                    description={meta.description}
                    isScrolled={isScrolled}
                    status={status}
                    currentPage={currentPage}
                />
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8" onScroll={handleScroll}>
                    {currentPage === 'status' && <StatusPage status={status} onRefresh={fetchStatus} />}
                    {currentPage === 'settings' && <SettingsPage />}
                </div>
            </main>
            <ToastContainer />
        </div>
    )
}
