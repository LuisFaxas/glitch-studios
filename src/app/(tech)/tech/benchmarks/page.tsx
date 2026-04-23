import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Benchmarks",
  description: "Performance benchmarks across tech products.",
}

// D-10 (Phase 16.1): honest empty state — benchmarks populate as reviews
// are published; methodology link explains how numbers are produced so the
// page has something to say before data exists.
export default function TechBenchmarksPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-3xl px-4 py-24">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-4xl">
          Benchmarks
        </h1>
        <p className="mt-6 font-sans text-sm leading-relaxed text-[#888]">
          No benchmarks published yet. Data lands on this page as new reviews
          are scored — every product we test contributes one row to a
          cross-category leaderboard.
        </p>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[#888]">
          Until then, read{" "}
          <Link
            href="/tech/about"
            className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
          >
            how the GlitchTech scoring methodology works
          </Link>{" "}
          — the metric definitions, weighting, and reproducibility rules that
          every benchmark run will follow.
        </p>
      </section>
    </main>
  )
}
