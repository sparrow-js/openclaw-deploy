import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  eslint: {
    // 完全禁用 ESLint 检查
    ignoreDuringBuilds: true,
  },
  // 路由重写：兼容 OpenAI API 格式
  async rewrites() {
    return [
      {
        source: '/v1/chat/completions',
        destination: '/api/v1/chat/completions',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'app.trickle.so',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default nextConfig
