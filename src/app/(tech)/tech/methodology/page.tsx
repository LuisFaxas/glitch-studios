import type { Metadata } from "next"
import Link from "next/link"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { MethodologyChangelog } from "@/components/tech/methodology-changelog"
import { MethodologyDisciplineTable } from "@/components/tech/methodology-discipline-table"
import { MethodologyExclusionPolicy } from "@/components/tech/methodology-exclusion-policy"
import { MethodologyFormula } from "@/components/tech/methodology-formula"
import { MethodologyMedalTable } from "@/components/tech/methodology-medal-table"
import { MethodologyGlitchmark } from "@/components/tech/methodology-glitchmark"
import { TechNewsletter } from "@/components/home/tech-newsletter"
import { getMethodologyData, getGlitchmarkBaselines } from "@/lib/tech/methodology"

export const dynamic = "force-static"
export const revalidate = 3600

export const metadata: Metadata = {
  title: "Methodology — Glitch Tech",
  description:
    "How we score, grade, and compare tech reviews. BPR formula, 7 eligible disciplines, medal thresholds, exclusion policy.",
}

const JUMP_LINKS = [
  { href: "#bpr", label: "BPR Formula" },
  { href: "#disciplines", label: "Disciplines" },
  { href: "#thresholds", label: "Thresholds" },
  { href: "#glitchmark", label: "GlitchMark" },
  { href: "#exclusion-policy", label: "Exclusions" },
  { href: "#rubric-changelog", label: "Rubric Changelog" },
]

export default async function MethodologyPage() {
  const data = getMethodologyData()
  const glitchmarkBaselines = await getGlitchmarkBaselines()

  return (
    <main className="min-h-screen bg-black text-[#f5f5f0]">
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-12">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/tech">Tech</Link>} />
            </BreadcrumbItem>
            <BreadcrumbItem>Methodology</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="mt-8 font-mono text-[44px] font-bold uppercase leading-none md:text-[64px]">
          <GlitchHeading text="METHODOLOGY">METHODOLOGY</GlitchHeading>
        </h1>
        <p className="mt-4 font-sans text-[15px] text-[#888]">
          How we score, grade, and compare tech reviews.
        </p>
        <nav className="mt-8 flex flex-wrap items-center gap-2">
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

      <MethodologyFormula formula={data.bprFormula} />
      <MethodologyDisciplineTable disciplines={data.disciplines} />
      <MethodologyMedalTable thresholds={data.medalThresholds} />
      <MethodologyGlitchmark baselines={glitchmarkBaselines} />
      <MethodologyExclusionPolicy />
      <MethodologyChangelog entries={data.rubricChangelog} />

      <section className="mx-auto max-w-5xl px-6 py-12 text-center">
        <Link
          href="/tech/reviews"
          aria-label="Back to tech reviews list"
          className="group inline-flex items-center gap-3 border border-[#f5f5f0] bg-[#f5f5f0] px-8 py-4 font-mono text-sm font-bold uppercase tracking-[0.05em] text-black transition-colors hover:bg-transparent hover:text-[#f5f5f0]"
        >
          <span>← Back to Reviews</span>
        </Link>
      </section>

      <TechNewsletter />
    </main>
  )
}
