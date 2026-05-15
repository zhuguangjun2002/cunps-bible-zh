'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { parseReference } from '@/lib/reference'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function SearchBox() {
  const router = useRouter()
  const [value, setValue] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (!q) return
    const ref = parseReference(q)
    if (ref) {
      const anchor = ref.verseStart ? `#v${ref.verseStart}` : ''
      // 用整页导航,确保浏览器解析 hash 并触发 :target 高亮
      // (Next.js App Router 的 router.push 带 hash 时不会重算 :target)
      window.location.assign(`${basePath}/read/${ref.book}/${ref.chapter}/${anchor}`)
      return
    }
    router.push(`/search/?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={submit} className="flex-1">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="跳转 诗 23:1，或搜索关键词"
        className="w-full rounded-md border border-black/10 bg-white/60 px-3 py-1.5 text-sm placeholder:text-ink-muted focus:border-indigo-400 focus:outline-none dark:border-white/10 dark:bg-white/5"
      />
    </form>
  )
}
