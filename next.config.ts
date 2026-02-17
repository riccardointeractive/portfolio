import type { NextConfig } from "next";
import { ENV_SERVER } from "./src/config/env";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(ENV_SERVER.r2PublicUrl
        ? [
            {
              protocol: 'https' as const,
              hostname: new URL(ENV_SERVER.r2PublicUrl).hostname,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
