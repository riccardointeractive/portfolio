import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(process.env.R2_PUBLIC_URL
        ? [
            {
              protocol: 'https' as const,
              hostname: new URL(process.env.R2_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
