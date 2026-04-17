import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Glitch Tech",
  description: "Product reviews, benchmarks, and comparisons from Glitch Studios.",
}

export default function TechHomePage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="font-mono text-5xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-[64px]">
          GLITCH TECH
        </h1>
        <p className="mt-4 font-sans text-sm text-[#888]">
          Landing page skeleton — full content arrives in Plan 04.
        </p>
      </section>
    </main>
  )
}
