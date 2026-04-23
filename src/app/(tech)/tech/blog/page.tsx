import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Long-form writing on benchmarks, hardware, and review methodology from GlitchTech.",
}

// D-09 (Phase 16.1): stub page so the tech sidebar Blog entry resolves
// instead of 404-ing. Real content ships when the tech editorial pipeline
// is built out (Phase 17+). Keep copy honest — no "coming soon in phase X"
// phrasing; once reviews publish, the blog will have something to say.
export default function TechBlogPage() {
  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-3xl px-4 py-24">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-4xl">
          Blog
        </h1>
        <p className="mt-6 font-sans text-sm leading-relaxed text-[#888]">
          No posts yet. Long-form writing lives here — deep-dives on hardware
          we&apos;ve reviewed, benchmark methodology, and editorial
          perspective pieces that don&apos;t fit the review format.
        </p>
        <p className="mt-4 font-sans text-sm leading-relaxed text-[#888]">
          Start with the{" "}
          <Link
            href="/tech/reviews"
            className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
          >
            latest reviews
          </Link>{" "}
          or the{" "}
          <Link
            href="/tech/about"
            className="border-b border-[#555] text-[#ccc] transition-colors hover:border-[#f5f5f0] hover:text-[#f5f5f0]"
          >
            methodology page
          </Link>
          .
        </p>
      </section>
    </main>
  )
}
