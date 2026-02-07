import type { NextConfig } from 'next'

const nextConfig = {
  turbopack:{},
  eslint: { ignoreDuringBuilds: true },
  webpack(config: any) {
    config.module.rules.push({
      test: /\.worker\.js$/,
      type: 'asset/resource',
    });
    return config;
  }

};

export default nextConfig as unknown as NextConfig;
