'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

interface Props {
  prev: { book: string; chapter: number } | null
  next: { book: string; chapter: number } | null
}

export function KeyboardShortcuts({ prev, next }: Props) {
  const router = useRouter()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'ArrowLeft' || e.key === 'h') {
        if (prev) router.push(`${basePath}/read/${prev.book}/${prev.chapter}/`)
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        if (next) router.push(`${basePath}/read/${next.book}/${next.chapter}/`)
      } else if (e.key === '/') {
        e.preventDefault()
        const input = document.querySelector<HTMLInputElement>('input[type="search"]')
        input?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, router])
  return null
}
