import { notFound } from 'next/navigation'
import { getAllBooks, getBook } from '@/lib/books'
import { getChapter } from '@/lib/bible'
import { ChapterNav } from '@/components/ChapterNav'
import { ChapterContent } from '@/components/ChapterContent'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'

interface Params {
  book: string
  chapter: string
}

export function generateStaticParams() {
  const out: Params[] = []
  for (const b of getAllBooks()) {
    for (let c = 1; c <= b.chapters; c++) {
      out.push({ book: b.code, chapter: String(c) })
    }
  }
  return out
}

export const dynamicParams = false

export function generateMetadata({ params }: { params: Params }) {
  const book = getBook(params.book)
  if (!book) return { title: '和合本圣经' }
  return {
    title: `${book.name} ${params.chapter} · 和合本圣经`,
  }
}

function neighbor(bookCode: string, chapter: number, dir: -1 | 1) {
  const books = getAllBooks()
  const idx = books.findIndex((b) => b.code === bookCode)
  if (idx < 0) return null
  const book = books[idx]
  const targetCh = chapter + dir
  if (targetCh >= 1 && targetCh <= book.chapters) {
    return { book: book.code, chapter: targetCh }
  }
  const neighborIdx = idx + dir
  if (neighborIdx < 0 || neighborIdx >= books.length) return null
  const n = books[neighborIdx]
  return { book: n.code, chapter: dir === 1 ? 1 : n.chapters }
}

export default function ChapterPage({ params }: { params: Params }) {
  const book = getBook(params.book)
  const chapter = parseInt(params.chapter, 10)
  if (!book || isNaN(chapter) || chapter < 1 || chapter > book.chapters) notFound()

  const verses = getChapter(book.code, chapter)
  const prev = neighbor(book.code, chapter, -1)
  const next = neighbor(book.code, chapter, 1)

  return (
    <article>
      <ChapterNav book={book} chapter={chapter} allBooks={getAllBooks()} prev={prev} next={next} />
      <header className="mb-8 border-b border-black/5 pb-6 dark:border-white/10">
        <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          新标点和合本
        </div>
        <h1 className="text-4xl font-semibold tracking-wide sm:text-5xl">
          {book.name} <span className="ml-1 font-normal">{chapter}</span>
        </h1>
      </header>
      <ChapterContent verses={verses} />
      <nav className="mt-12 flex items-center justify-between border-t border-black/5 pt-4 text-sm dark:border-white/10">
        {prev ? (
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/read/${prev.book}/${prev.chapter}/`}
            className="text-ink-muted hover:text-indigo-500"
          >
            ← 上一章
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a
            href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/read/${next.book}/${next.chapter}/`}
            className="text-ink-muted hover:text-indigo-500"
          >
            下一章 →
          </a>
        ) : (
          <span />
        )}
      </nav>
      <KeyboardShortcuts prev={prev} next={next} />
    </article>
  )
}
