'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface Verse {
  n: number
  t: string
}

export function ChapterContent({ verses }: { verses: Verse[] }) {
  const pathname = usePathname()
  const [activeVerse, setActiveVerse] = useState<number | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    function read() {
      const m = window.location.hash.match(/^#v(\d+)/)
      const n = m ? parseInt(m[1], 10) : null
      setActiveVerse(n)
      if (n != null) {
        requestAnimationFrame(() => {
          document
            .getElementById(`v${n}`)
            ?.scrollIntoView({ block: 'start', behavior: 'auto' })
        })
      }
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [pathname])

  // 同步侧栏搜索词,对正文做高亮
  useEffect(() => {
    function readQuery() {
      try {
        setQuery(sessionStorage.getItem('cunps-sidebar-q') ?? '')
      } catch {
        setQuery('')
      }
    }
    readQuery()
    window.addEventListener('cunps-query-change', readQuery)
    return () => window.removeEventListener('cunps-query-change', readQuery)
  }, [])

  return (
    <div className="space-y-4 text-lg leading-[2] text-ink dark:text-[#e5e5e0]">
      {verses.map((v) => (
        <p
          key={v.n}
          id={`v${v.n}`}
          className={`verse${activeVerse === v.n ? ' verse-active' : ''}`}
        >
          <a
            href={`#v${v.n}`}
            className="verse-num hover:text-indigo-500"
            aria-label={`第 ${v.n} 节`}
          >
            {v.n}
          </a>
          {highlight(v.t, query)}
        </p>
      ))}
    </div>
  )
}

function highlight(text: string, query: string) {
  const q = query.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped, 'gi')
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index === re.lastIndex) {
      re.lastIndex++
      continue
    }
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <mark
        key={i++}
        className="rounded-sm bg-yellow-200/70 px-0.5 dark:bg-yellow-400/30"
      >
        {m[0]}
      </mark>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
