import type { NextConfig } from 'next'

const nextConfig = {
  experimental: { esmExternals: true },
  eslint: { ignoreDuringBuilds: true },
  webpack(config: any) {
    config.module.rules.push({
      test: /\.worker\.js$/,
      type: 'asset/resource',
    });
    return config;
  },
  env: { BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL }
};

export default nextConfig as unknown as NextConfig;
