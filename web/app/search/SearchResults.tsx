'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { search, type SearchHit } from '@/lib/search'
import { BOOKS_BY_CODE } from '@/lib/generated/books'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

function highlight(text: string, query: string) {
  const q = query.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(escaped, 'gi')
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = pattern.exec(text))) {
    if (m.index === pattern.lastIndex) {
      pattern.lastIndex++
      continue
    }
    if (m.index > last) parts.push(text.slice(last, m.index))
    parts.push(
      <mark key={i++} className="rounded-sm bg-yellow-200/70 px-0.5 dark:bg-yellow-400/30">
        {m[0]}
      </mark>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export function SearchResults() {
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const [hits, setHits] = useState<SearchHit[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!q) {
      setHits([])
      return
    }
    setLoading(true)
    setError(null)
    search(q, 100)
      .then((r) => setHits(r))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [q])

  if (!q) return <p className="text-ink-muted">在顶部输入关键词或经文引用。</p>
  if (loading) return <p className="text-ink-muted">搜索 “{q}” 中…（首次会加载索引）</p>
  if (error) return <p className="text-red-500">出错：{error}</p>
  if (!hits || hits.length === 0)
    return <p className="text-ink-muted">没有匹配 “{q}” 的结果。</p>

  return (
    <div>
      <p className="mb-4 text-sm text-ink-muted">
        共 {hits.length} 条 · 关键词 “{q}”
      </p>
      <ul className="space-y-3">
        {hits.map((h) => {
          const book = BOOKS_BY_CODE[h.b]
          return (
            <li
              key={h.id}
              className="rounded-md border border-black/5 p-3 hover:border-indigo-300 dark:border-white/5"
            >
              <a
                href={`${basePath}/read/${h.b}/${h.c}/#v${h.n}`}
                className="block"
              >
                <div className="mb-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  {book?.name ?? h.b} {h.c}:{h.n}
                </div>
                <div className="text-base leading-relaxed">{highlight(h.t, q)}</div>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
