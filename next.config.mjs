import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;
const apiProxyUrl = process.env.API_PROXY_URL;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo has a parent yarn.lock; keep tracing scoped to this app.
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ladimood.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ladimood.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      ...(supabaseHostname
        ? [
            {
              protocol: 'https',
              hostname: supabaseHostname,
            },
          ]
        : []),
    ],
  },
  async rewrites() {
    if (!apiProxyUrl) return [];
    return [{ source: '/api/:path*', destination: `${apiProxyUrl}/:path*` }];
  },
};

export default nextConfig;
