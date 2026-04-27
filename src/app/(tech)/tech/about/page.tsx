import type { Metadata } from "next"
import Link from "next/link"
import { TechHero } from "@/components/tech/tech-hero"
import { MethodologyChangelog } from "@/components/tech/methodology-changelog"
import { MethodologyDisciplineCards } from "@/components/tech/methodology-discipline-cards"
import { MethodologyExclusionPolicy } from "@/components/tech/methodology-exclusion-policy"
import { MethodologyFormula } from "@/components/tech/methodology-formula"
import { MethodologyMedalLadder } from "@/components/tech/methodology-medal-ladder"
import { MethodologyGlitchmark } from "@/components/tech/methodology-glitchmark"
import { getMethodologyData, getGlitchmarkBaselines } from "@/lib/tech/methodology"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = {
  title: "About GlitchTech",
  description:
    "About GlitchTech — methodology, BPR formula, GlitchMark scoring, disciplines, exclusion policy.",
}

const JUMP_LINKS = [
  { href: "#story", label: "About" },
  { href: "#methodology", label: "Methodology" },
  { href: "#bpr", label: "BPR Formula" },
  { href: "#glitchmark", label: "GlitchMark" },
  { href: "#disciplines", label: "Disciplines" },
  { href: "#thresholds", label: "Thresholds" },
  { href: "#exclusion-policy", label: "Exclusions" },
  { href: "#rubric-changelog", label: "Changelog" },
]

export default async function TechAboutPage() {
  const data = getMethodologyData()
  const glitchmarkBaselines = await getGlitchmarkBaselines()

  return (
    <main className="min-h-screen bg-black text-[#f5f5f0]">
      <TechHero
        eyebrow="METHODOLOGY HUB"
        title="About GlitchTech"
        subhead="43 tests across 13 disciplines. One score. Built to cut through the noise."
        ctaLabel="Read methodology"
        ctaHref="#methodology"
        tone="amber"
        size="tall"
      />

      {/* Stat cards row — 29.2-02 */}
      <section className="mx-auto max-w-5xl px-6 py-8" aria-label="Methodology statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { value: "43", label: "TESTS IN RUBRIC V1.1" },
            { value: "13", label: "DISCIPLINES" },
            { value: "7", label: "BPR-ELIGIBLE DISCIPLINES" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border border-[#222] bg-[#111] p-6"
            >
              <p className="font-mono text-[28px] font-bold text-[#f5f5f0] md:text-[40px]">
                {stat.value}
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.1em] text-[#888]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-8">
        <nav className="flex flex-wrap items-center gap-2" aria-label="Jump to section">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#888]">
            Jump to:
          </span>
          {JUMP_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center border border-[#222] bg-[#111] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:border-[#444] hover:bg-[#1a1a1a]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </section>

      <section id="story" className="mx-auto max-w-5xl px-6 pb-12">
        <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.05em]">
          About GlitchTech
        </h2>
        <p className="mt-4 font-sans text-sm text-[#888]">
          GlitchTech is the product review vertical of Glitch Studios.
          Detailed copy to be written in a future phase.
        </p>
      </section>

      <section
        id="methodology"
        className="mx-auto max-w-5xl px-6 py-12 border-t border-[#222]"
      >
        <h2 className="font-mono text-2xl font-bold uppercase tracking-[0.05em]">
          Methodology
        </h2>
        <p className="mt-4 font-sans text-sm text-[#888]">
          How we score, grade, and compare tech reviews. We compute two
          scores per device: <strong>BPR</strong> (editorial quality grade,
          medal tiers) and <strong>GlitchMark</strong> (raw aggregate
          performance score, base 1000).
        </p>
      </section>

      <MethodologyFormula formula={data.bprFormula} />
      <MethodologyDisciplineCards disciplines={data.disciplines} />
      <MethodologyMedalLadder thresholds={data.medalThresholds} />
      <MethodologyGlitchmark baselines={glitchmarkBaselines} />
      <MethodologyExclusionPolicy />
      <MethodologyChangelog entries={data.rubricChangelog} />
    </main>
  )
}
