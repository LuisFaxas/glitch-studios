import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.122",
    "glitch-studios.codebox.local",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },
}

export default nextConfig
