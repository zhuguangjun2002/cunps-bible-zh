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
    <nav className="mb-8 flex flex-wrap items-end justify-between gap-4 text-sm">
      <div className="flex items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-muted">书卷</span>
          <select
            value={book.code}
            onChange={(e) => router.push(`/read/${e.target.value}/1/`)}
            className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
            aria-label="切换书卷"
          >
            {allBooks.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-ink-muted">章节</span>
          <select
            value={chapter}
            onChange={(e) =>
              router.push(`/read/${book.code}/${e.target.value}/`)
            }
            className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
            aria-label="切换章节"
          >
            {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2">
        {prev ? (
          <a
            href={`${basePath}/read/${prev.book}/${prev.chapter}/`}
            className="rounded-md border border-black/10 px-3 py-1.5 text-ink-muted hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            aria-label="上一章"
          >
            上一章
          </a>
        ) : (
          <span className="rounded-md border border-black/5 px-3 py-1.5 text-ink-muted/40 dark:border-white/5">
            上一章
          </span>
        )}
        {next ? (
          <a
            href={`${basePath}/read/${next.book}/${next.chapter}/`}
            className="rounded-md border border-black/10 px-3 py-1.5 text-ink-muted hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            aria-label="下一章"
          >
            下一章
          </a>
        ) : (
          <span className="rounded-md border border-black/5 px-3 py-1.5 text-ink-muted/40 dark:border-white/5">
            下一章
          </span>
        )}
      </div>
    </nav>
  )
}
