import { Suspense } from 'react'
import { SearchResults } from './SearchResults'

export const metadata = {
  title: '搜索 · 和合本圣经',
}

export default function SearchPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">全文搜索</h1>
      <Suspense fallback={<p className="text-ink-muted">加载中…</p>}>
        <SearchResults />
      </Suspense>
    </div>
  )
}
