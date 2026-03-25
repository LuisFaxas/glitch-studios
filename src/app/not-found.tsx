import Link from "next/link"
import { GlitchLogo } from "@/components/layout/glitch-logo"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
      <GlitchLogo size="lg" />
      <h1 className="font-mono font-bold text-6xl md:text-8xl uppercase mt-8 text-white">
        404
      </h1>
      <h2 className="font-mono font-bold text-2xl uppercase mt-4 text-white">
        Page not found
      </h2>
      <p className="text-gray-400 text-lg mt-4 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 bg-gray-800 text-white border border-gray-600 px-8 py-3 rounded-lg hover:bg-gray-700 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all font-mono"
      >
        Back to Home
      </Link>
    </div>
  )
}
