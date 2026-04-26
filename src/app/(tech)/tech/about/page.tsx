import type { Metadata } from "next"
import Link from "next/link"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { MethodologyChangelog } from "@/components/tech/methodology-changelog"
import { MethodologyDisciplineTable } from "@/components/tech/methodology-discipline-table"
import { MethodologyExclusionPolicy } from "@/components/tech/methodology-exclusion-policy"
import { MethodologyFormula } from "@/components/tech/methodology-formula"
import { MethodologyMedalTable } from "@/components/tech/methodology-medal-table"
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
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-12">
        <h1 className="font-mono text-[44px] font-bold uppercase leading-none md:text-[64px]">
          <GlitchHeading text="ABOUT">ABOUT</GlitchHeading>
        </h1>
        <nav className="mt-8 flex flex-wrap items-center gap-2" aria-label="Jump to section">
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
      <MethodologyDisciplineTable disciplines={data.disciplines} />
      <MethodologyMedalTable thresholds={data.medalThresholds} />
      <MethodologyGlitchmark baselines={glitchmarkBaselines} />
      <MethodologyExclusionPolicy />
      <MethodologyChangelog entries={data.rubricChangelog} />
    </main>
  )
}
