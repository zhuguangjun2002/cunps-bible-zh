const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="mb-2 text-xl font-semibold">页面未找到</h1>
      <p className="mb-6 text-ink-muted">链接可能有误，或章节不存在。</p>
      <a href={`${basePath}/`} className="text-indigo-600 hover:underline dark:text-indigo-400">
        回到首页 →
      </a>
    </div>
  )
}
