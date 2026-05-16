const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl py-12 text-center">
      <div className="mb-2 text-xs font-semibold tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
        CUNP
      </div>
      <h1 className="mb-4 text-4xl font-semibold tracking-wide">和合本新标点</h1>
      <p className="mb-8 text-sm text-ink-muted">
        66 卷 · 1,189 章 · 31,103 节 · 离线可用 · 全文搜索
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
        <a
          href={`${basePath}/read/GEN/1/`}
          className="rounded-md border border-emerald-500/40 bg-emerald-50/60 px-4 py-2 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300"
        >
          从创世记开始
        </a>
        <a
          href={`${basePath}/read/MAT/1/`}
          className="rounded-md border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
        >
          打开马太福音
        </a>
        <a
          href={`${basePath}/read/PSA/23/`}
          className="rounded-md border border-black/10 px-4 py-2 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
        >
          诗篇 23
        </a>
      </div>
      <p className="mt-10 text-xs text-ink-muted">
        左侧边栏可输入关键词或经文引用(如 <code>约 3:16</code>)
      </p>
    </div>
  )
}
