import type { Metadata } from "next"
import { TechHero } from "@/components/tech/tech-hero"

export const metadata: Metadata = {
  title: "Blog — GlitchTech",
  description:
    "Hardware deep-dives, benchmark breakdowns, and buying guides from the GlitchTech team.",
}

// D-09 (Phase 16.1): stub page, now upgraded with TechHero (Phase 29.2-10).
// Real content ships when the editorial pipeline is live.
// Empty-state copy matches UI-SPEC Copywriting Contract.
export default function TechBlogPage() {
  return (
    <main className="min-h-screen bg-black">
      <TechHero
        eyebrow="GLITCHTECH BLOG"
        title="Blog"
        subhead="Hardware deep-dives, benchmark breakdowns, and buying guides from the GlitchTech team."
        ctaLabel="Read latest"
        ctaHref="#latest"
        tone="amber"
      />

      <span id="latest" />

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          No posts yet
        </h2>
        <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#888]">
          The first GlitchTech posts are in draft. Check back soon.
        </p>
      </section>
    </main>
  )
}
