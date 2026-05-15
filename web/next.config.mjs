const isProd = process.env.NODE_ENV === 'production'
const basePath = isProd ? '/cunps-bible-zh' : ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 仅在 production 构建时启用静态导出；dev 模式留作常规 dev server，
  // 避免 Next.js 14 在 dev 下对动态路由的 generateStaticParams 早期校验出错。
  ...(isProd ? { output: 'export' } : {}),
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
