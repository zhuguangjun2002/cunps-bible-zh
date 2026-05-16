'use client'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'
import { search, type SearchHit } from '@/lib/search'
import { parseReference } from '@/lib/reference'
import { BOOKS, type BookMeta } from '@/lib/generated/books'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

type Filter = 'all' | 'OT' | 'NT'

interface RefHit {
  book: string
  bookName: string
  chapter: number
  verse?: number
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const { currentBook, currentChapter } = useMemo(() => {
    const m = pathname.match(/\/read\/([^/]+)\/(\d+)/i)
    return {
      currentBook: m ? m[1].toUpperCase() : null,
      currentChapter: m ? parseInt(m[2], 10) : null,
    }
  }, [pathname])

  const [currentVerse, setCurrentVerse] = useState<number | null>(null)
  useEffect(() => {
    const read = () => {
      const m = window.location.hash.match(/^#v(\d+)/)
      setCurrentVerse(m ? parseInt(m[1], 10) : null)
    }
    read()
    window.addEventListener('hashchange', read)
    return () => window.removeEventListener('hashchange', read)
  }, [pathname])

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [refHit, setRefHit] = useState<RefHit | null>(null)
  const [searching, setSearching] = useState(false)

  // 挂载时从 sessionStorage 恢复(跨整页导航保留)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cunps-sidebar-q')
      if (saved) setQuery(saved)
    } catch {}
  }, [])

  // 把写入与用户动作绑定,避免 effect 在首次渲染时误清空
  function updateQuery(v: string) {
    setQuery(v)
    try {
      if (v) sessionStorage.setItem('cunps-sidebar-q', v)
      else sessionStorage.removeItem('cunps-sidebar-q')
    } catch {}
    // 通知 ChapterContent 同步高亮
    window.dispatchEvent(new Event('cunps-query-change'))
  }

  // 客户端导航 + 通知监听者(hashchange 在 pushState 同路径同 hash 时不会重发)
  function navigate(path: string) {
    router.push(path)
    // 让下一帧的事件循环里 ChapterContent / Sidebar 自身能感知到 hash 变化
    requestAnimationFrame(() => {
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
  }

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setHits([])
      setRefHit(null)
      setSearching(false)
      return
    }
    const ref = parseReference(q)
    if (ref) {
      const meta = BOOKS.find((b) => b.code === ref.book)
      setRefHit({
        book: ref.book,
        bookName: meta?.name ?? ref.book,
        chapter: ref.chapter,
        verse: ref.verseStart,
      })
    } else {
      setRefHit(null)
    }
    setSearching(true)
    const t = setTimeout(() => {
      search(q, 50)
        .then((r) => setHits(r))
        .catch(() => setHits([]))
        .finally(() => setSearching(false))
    }, 200)
    return () => clearTimeout(t)
  }, [query])

  const filteredBooks = useMemo(() => {
    if (filter === 'all') return BOOKS
    return BOOKS.filter((b) => b.testament === filter)
  }, [filter])

  function handleNavigate() {
    onNavigate?.()
  }

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto bg-paper px-5 py-5 dark:bg-paper-dark">
      <div className="mb-5 flex items-start justify-between gap-2">
        <ClickLink
          path="/"
          onClickItem={(p) => {
            navigate(p)
            handleNavigate()
          }}
          className="block"
        >
          <div className="text-xs font-semibold tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            CUNP
          </div>
          <div className="text-2xl font-semibold tracking-wide">
            和合本新标点
          </div>
        </ClickLink>
        <ThemeToggle />
      </div>

      <ScriptToggle />

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const q = query.trim()
          if (!q) return
          if (refHit) {
            navigate(
              `/read/${refHit.book}/${refHit.chapter}/${
                refHit.verse ? `#v${refHit.verse}` : ''
              }`,
            )
          } else {
            navigate(`/search/?q=${encodeURIComponent(q)}`)
          }
          handleNavigate()
        }}
        className="mb-2"
      >
        <label className="mb-1.5 block text-xs text-ink-muted">搜索</label>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="关键词,或 约 3:16"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none dark:border-white/10 dark:bg-white/5"
          />
          {query && (
            <button
              type="button"
              onClick={() => updateQuery('')}
              aria-label="清除"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-muted hover:bg-black/5 dark:hover:bg-white/5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {query.trim() && (
        <SearchPanel
          query={query.trim()}
          refHit={refHit}
          hits={hits}
          searching={searching}
          onClickItem={(path) => {
            navigate(path)
            handleNavigate()
          }}
          activeBook={currentBook}
          activeChapter={currentChapter}
          activeVerse={currentVerse}
        />
      )}

      <div className="mb-3 mt-5 grid grid-cols-3 gap-2">
        {(
          [
            ['all', '全部'],
            ['OT', '旧约'],
            ['NT', '新约'],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-md border px-3 py-2 text-sm transition ${
              filter === key
                ? 'border-emerald-500/60 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300'
                : 'border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="grid grid-cols-2 gap-2">
        {filteredBooks.map((b) => (
          <li key={b.code}>
            <BookButton
              book={b}
              active={b.code === currentBook}
              onClickItem={(p) => {
                navigate(p)
                handleNavigate()
              }}
            />
          </li>
        ))}
      </ul>
    </aside>
  )
}

function ScriptToggle() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2">
      <button
        type="button"
        aria-pressed
        className="rounded-md border border-emerald-500/60 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300"
      >
        简体
      </button>
      <button
        type="button"
        aria-disabled
        title="繁體版暂未提供"
        className="cursor-not-allowed rounded-md border border-black/10 px-3 py-2 text-sm text-ink-muted/60 dark:border-white/10"
      >
        繁體
      </button>
    </div>
  )
}

function BookButton({
  book,
  active,
  onClickItem,
}: {
  book: BookMeta
  active: boolean
  onClickItem: (path: string) => void
}) {
  return (
    <ClickLink
      path={`/read/${book.code}/1/`}
      onClickItem={onClickItem}
      className={`block rounded-md border px-2.5 py-2 text-center text-sm transition ${
        active
          ? 'border-emerald-500/60 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300'
          : 'border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5'
      }`}
    >
      {book.name}
    </ClickLink>
  )
}

function SearchPanel({
  query,
  refHit,
  hits,
  searching,
  onClickItem,
  activeBook,
  activeChapter,
  activeVerse,
}: {
  query: string
  refHit: RefHit | null
  hits: SearchHit[]
  searching: boolean
  onClickItem: (path: string) => void
  activeBook: string | null
  activeChapter: number | null
  activeVerse: number | null
}) {
  const display = hits.slice(0, 30)
  const showAllLink = hits.length > display.length
  return (
    <div className="mb-2">
      {refHit && (
        <ClickLink
          path={`/read/${refHit.book}/${refHit.chapter}/${
            refHit.verse ? `#v${refHit.verse}` : ''
          }`}
          onClickItem={onClickItem}
          className="mb-2 block rounded-md border border-emerald-500/40 bg-emerald-50/60 px-3 py-2 hover:bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/5 dark:hover:bg-emerald-400/10"
        >
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            {refHit.bookName} {refHit.chapter}
            {refHit.verse ? `:${refHit.verse}` : ''}
          </div>
          <div className="text-xs text-ink-muted">打开这一处经文</div>
        </ClickLink>
      )}
      {searching && hits.length === 0 && !refHit && (
        <p className="text-xs text-ink-muted">搜索中…</p>
      )}
      {!searching && hits.length === 0 && !refHit && (
        <p className="text-xs text-ink-muted">没有匹配的结果</p>
      )}
      {hits.length > 0 && (
        <>
          <p className="mb-2 text-xs text-ink-muted">
            {showAllLink
              ? `显示前 ${display.length} 条 / 共 ${hits.length} 条`
              : `共 ${hits.length} 条结果`}
          </p>
          <div className="max-h-[40vh] overflow-y-auto pr-1">
            <ul className="space-y-2">
              {display.map((h) => {
                const active =
                  h.b === activeBook && h.c === activeChapter && h.n === activeVerse
                return (
                  <li key={h.id}>
                    <HitCard
                      hit={h}
                      query={query}
                      active={active}
                      onClickItem={onClickItem}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
          {showAllLink && (
            <ClickLink
              path={`/search/?q=${encodeURIComponent(query)}`}
              onClickItem={onClickItem}
              className="mt-2 block rounded-md border border-black/10 px-3 py-1.5 text-center text-xs text-ink-muted hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              查看全部 →
            </ClickLink>
          )}
        </>
      )}
    </div>
  )
}

function ClickLink({
  path,
  onClickItem,
  className,
  children,
}: {
  path: string
  onClickItem: (path: string) => void
  className?: string
  children: React.ReactNode
}) {
  // 仍渲染 <a href> 以便右键"在新标签打开",主点击拦截走 router
  return (
    <a
      href={`${basePath}${path}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
        e.preventDefault()
        onClickItem(path)
      }}
      className={className}
    >
      {children}
    </a>
  )
}

function HitCard({
  hit,
  query,
  active,
  onClickItem,
}: {
  hit: SearchHit
  query: string
  active: boolean
  onClickItem: (path: string) => void
}) {
  const meta = BOOKS.find((b) => b.code === hit.b)
  const bookName = meta?.name ?? hit.b
  const path = `/read/${hit.b}/${hit.c}/#v${hit.n}`
  return (
    <ClickLink
      path={path}
      onClickItem={onClickItem}
      className={`block rounded-md border px-3 py-2 transition ${
        active
          ? 'border-emerald-500/60 bg-emerald-50/60 dark:border-emerald-400/40 dark:bg-emerald-400/10'
          : 'border-black/10 bg-white/40 hover:border-indigo-300 dark:border-white/10 dark:bg-white/5'
      }`}
    >
      <div
        className={`mb-1 text-xs font-medium ${
          active
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-indigo-600 dark:text-indigo-400'
        }`}
      >
        {bookName} {hit.c}:{hit.n}
      </div>
      <div className="text-sm leading-snug text-ink dark:text-[#e5e5e0]">
        {highlight(hit.t, query)}
      </div>
    </ClickLink>
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
      <mark key={i++} className="rounded-sm bg-yellow-200/70 px-0.5 dark:bg-yellow-400/30">
        {m[0]}
      </mark>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
