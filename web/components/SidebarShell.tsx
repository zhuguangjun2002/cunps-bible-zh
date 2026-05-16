'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

export function SidebarShell() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // 路由变化时自动收起抽屉
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // 抽屉打开时锁定 body 滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* 桌面侧栏(固定) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:border-r lg:border-black/5 lg:dark:border-white/10">
        <Sidebar />
      </div>

      {/* 移动端顶部小条 */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-paper/85 px-3 py-2 backdrop-blur dark:border-white/10 dark:bg-paper-dark/85 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="打开菜单"
          className="rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/5"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <span className="text-sm font-semibold tracking-wide">和合本新标点</span>
        <span className="w-9" />
      </div>

      {/* 移动端抽屉 */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] border-r border-black/5 shadow-xl dark:border-white/10">
            <Sidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
