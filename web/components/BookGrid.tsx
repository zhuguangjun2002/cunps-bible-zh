import type { BookMeta } from '@/lib/books'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function BookGrid({ title, books }: { title: string; books: BookMeta[] }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold tracking-widest text-ink-muted">{title}</h2>
      <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4">
        {books.map((b) => (
          <li key={b.code}>
            <a
              href={`${basePath}/read/${b.code}/1/`}
              className="flex items-baseline justify-between rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="font-medium">{b.name}</span>
              <span className="text-xs text-ink-muted">{b.chapters}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
