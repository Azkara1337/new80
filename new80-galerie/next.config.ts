import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  // Les images sont déjà redimensionnées à l'upload (600 px WebP / 2000 px JPEG) et servies par R2.
  images: { unoptimized: true },
};

export default nextConfig;

initOpenNextCloudflareForDev();
