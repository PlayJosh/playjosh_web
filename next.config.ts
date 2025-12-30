import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hyhonizosrkcvjeitset.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/profile-photos/**',
      },
    ],
    domains: ['hyhonizosrkcvjeitset.supabase.co'],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  reactCompiler: true,
};

export default nextConfig;
