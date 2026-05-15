import { notFound } from 'next/navigation'
import { getAllBooks, getBook } from '@/lib/books'
import { getChapter } from '@/lib/bible'
import { ChapterNav } from '@/components/ChapterNav'
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
      <h1 className="mb-6 text-2xl font-semibold tracking-wide">
        {book.name} <span className="text-ink-muted">第 {chapter} 章</span>
      </h1>
      <div className="space-y-3 text-lg leading-[2] text-ink dark:text-[#e5e5e0]">
        {verses.map((v) => (
          <p key={v.n} id={`v${v.n}`} className="verse">
            <a
              href={`#v${v.n}`}
              className="verse-num hover:text-indigo-500"
              aria-label={`第 ${v.n} 节`}
            >
              {v.n}
            </a>
            {v.t}
          </p>
        ))}
      </div>
      <nav className="mt-10 flex items-center justify-between border-t border-black/5 pt-4 text-sm dark:border-white/5">
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
