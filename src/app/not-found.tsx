import Link from "next/link"
import { GlitchLogo } from "@/components/layout/glitch-logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
      <GlitchLogo size="lg" />
      <h1 className="font-mono font-bold text-6xl md:text-8xl uppercase mt-8 text-[#f5f5f0]">
        404
      </h1>
      <h2 className="font-mono font-bold text-2xl uppercase mt-4 text-[#f5f5f0]">
        Page not found
      </h2>
      <p className="text-[#888888] text-lg mt-4 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 bg-[#f5f5f0] text-[#000000] border border-[#f5f5f0] px-8 py-3 rounded-none font-mono font-bold text-sm uppercase tracking-[0.05em] hover:bg-[#000000] hover:text-[#f5f5f0] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
