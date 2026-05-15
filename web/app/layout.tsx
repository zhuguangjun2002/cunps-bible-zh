import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SearchBox } from '@/components/SearchBox'
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
        <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/85 backdrop-blur dark:border-white/5 dark:bg-paper-dark/85">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <a href={`${basePath}/`} className="shrink-0 text-base font-semibold tracking-wide">
              和合本
            </a>
            <SearchBox />
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-3xl px-4 py-8 text-center text-xs text-ink-muted">
          新标点和合本（简体） · 数据源 fhl.net · 仅供个人研究
        </footer>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
