import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    esmExternals: true,
    
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.worker\.js$/,
      type: 'asset/resource',
    });
    return config;
  },
}

export default nextConfig
