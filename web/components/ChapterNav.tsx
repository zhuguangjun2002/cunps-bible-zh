'use client'
import { useRouter } from 'next/navigation'
import type { BookMeta } from '@/lib/books'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

interface Props {
  book: BookMeta
  chapter: number
  allBooks: BookMeta[]
  prev: { book: string; chapter: number } | null
  next: { book: string; chapter: number } | null
}

export function ChapterNav({ book, chapter, allBooks, prev, next }: Props) {
  const router = useRouter()
  return (
    <nav className="mb-4 flex items-center justify-between gap-2 border-b border-black/5 pb-3 text-sm dark:border-white/5">
      <div className="flex items-center gap-2">
        <select
          value={book.code}
          onChange={(e) => router.push(`/read/${e.target.value}/1/`)}
          className="rounded-md border border-black/10 bg-white/60 px-2 py-1 text-sm dark:border-white/10 dark:bg-white/5"
          aria-label="切换书卷"
        >
          {allBooks.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={chapter}
          onChange={(e) =>
            router.push(`/read/${book.code}/${e.target.value}/`)
          }
          className="rounded-md border border-black/10 bg-white/60 px-2 py-1 text-sm dark:border-white/10 dark:bg-white/5"
          aria-label="切换章节"
        >
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        {prev ? (
          <a
            href={`${basePath}/read/${prev.book}/${prev.chapter}/`}
            className="rounded-md px-3 py-1 text-ink-muted hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="上一章"
          >
            ← 上一章
          </a>
        ) : (
          <span className="px-3 py-1 text-ink-muted/50">← 上一章</span>
        )}
        {next ? (
          <a
            href={`${basePath}/read/${next.book}/${next.chapter}/`}
            className="rounded-md px-3 py-1 text-ink-muted hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="下一章"
          >
            下一章 →
          </a>
        ) : (
          <span className="px-3 py-1 text-ink-muted/50">下一章 →</span>
        )}
      </div>
    </nav>
  )
}
