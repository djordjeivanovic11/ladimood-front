const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['ladimood.com', 'cdn.ladimood.com'],
    },
    i18n: {
      locales: ['en', 'sr'], 
      defaultLocale: 'en',
    },
    async redirects() {
      return [
        {
          source: '/old-route',
          destination: '/new-route',
          permanent: true, 
        },
      ];
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.ladimood.com/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;
  