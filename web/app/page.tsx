import { BookGrid } from '@/components/BookGrid'
import { getOldTestament, getNewTestament } from '@/lib/books'

export default function HomePage() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="text-2xl font-semibold">新标点和合本（简体）</h1>
        <p className="mt-1 text-sm text-ink-muted">
          66 卷 · 1,189 章 · 31,103 节 · 顶部输入框可跳转或搜索
        </p>
      </div>
      <BookGrid title="旧约" books={getOldTestament()} />
      <BookGrid title="新约" books={getNewTestament()} />
    </div>
  )
}
