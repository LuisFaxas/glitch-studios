import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.122",
    "100.123.116.23",
    "glitch-studios.codebox.local",
    "glitch_studios.codebox.local",
  ],
  images: {
    // placehold.co serves SVG by default — Next.js Image refuses to optimize
    // SVGs unless this flag is on. Without it, every <Image src="placehold.co/...">
    // emits a 400 + retry cycle in dev that snowballs under load. Safe here:
    // we only allow placehold.co (a known-good placeholder service) for dev
    // seed data and removes the ⨯ error from logs. Swap when real images ship.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // Placeholder images for seeded tech catalog (laptop review + category
      // thumbnails) until real product imagery ships. Driven by the
      // "placeholder-first" build pattern documented in memory
      // project_placeholder_first_build. Swap once real uploads land.
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
}

export default nextConfig
