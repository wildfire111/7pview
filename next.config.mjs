/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cards.scryfall.io",
                port: "",
                pathname: "/**",
            },
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 3600, // Cache images for 1 hour
    },
    
    // Production optimizations
    compress: true,
    poweredByHeader: false, // Security: hide Next.js version
    
    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    }
                ]
            }
        ]
    },

    // Environment validation
    env: {
        DATABASE_URL: process.env.DATABASE_URL,
    }
};

export default nextConfig;
