import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SidebarShell } from '@/components/SidebarShell'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export const metadata: Metadata = {
  title: '和合本圣经',
  description: '新标点和合本（简体）在线阅读器 · 离线可用 · 全文搜索',
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: `${basePath}/icons/icon-192.svg`,
    apple: `${basePath}/icons/icon-192.svg`,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#15151a' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// 提前注入主题 class，避免刷新时白屏闪烁
const themeInitScript = `
(function(){
  try {
    var k = 'cunps-theme';
    var v = localStorage.getItem(k);
    var dark = v === 'dark' || (!v && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch(e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <SidebarShell />
        <div className="lg:pl-72">
          <main className="mx-auto max-w-3xl px-4 py-8 lg:px-8">{children}</main>
          <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-ink-muted lg:px-8">
            新标点和合本（简体） · 数据源 fhl.net · 仅供个人研究
          </footer>
        </div>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
