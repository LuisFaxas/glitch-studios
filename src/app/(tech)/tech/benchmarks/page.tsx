import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Benchmarks",
  description: "Performance benchmarks across tech products.",
}

export default function TechBenchmarksPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-7xl px-4 py-24">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-4xl">
          Benchmarks
        </h1>
        <p className="mt-4 font-sans text-sm text-[#888]">
          Placeholder — benchmark visualizations land in Phase 07.6.
        </p>
      </section>
    </main>
  )
}
