export const metadata = {
  title: '离线 · 和合本圣经',
}

export default function OfflinePage() {
  return (
    <div className="py-12 text-center">
      <h1 className="mb-2 text-xl font-semibold">当前离线</h1>
      <p className="text-ink-muted">
        网络暂时不可用。已经访问过的章节仍可阅读，未缓存的章节请稍后再来。
      </p>
    </div>
  )
}
