import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { ScrollSection } from "@/components/home/scroll-section"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { BenchmarkSpotlight } from "@/lib/tech/queries"
import { BPRMedal, BPRMedalPlaceholder } from "@/components/tech/bpr-medal"

interface TechBenchmarkSpotlightProps {
  spotlight: BenchmarkSpotlight | null
}

export function TechBenchmarkSpotlight({ spotlight }: TechBenchmarkSpotlightProps) {
  if (!spotlight) return null

  return (
    <ScrollSection variant="clip-reveal" className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="font-mono text-3xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-4xl">
          <GlitchHeading text="Top-Benchmarked">Top-Benchmarked</GlitchHeading>
        </h2>
        <p className="mt-1 font-sans text-sm text-[#888]">
          Highest scores across Geekbench, 3DMark, and real-world workflows
        </p>

        <div className="mt-8 border-2 border-[#f5f5f0] bg-[#111] p-6 md:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#888]">
                Editor&apos;s Choice
              </span>
              <div className="mt-2">
                {spotlight.bprScore !== null && spotlight.bprTier !== null ? (
                  <BPRMedal
                    tier={spotlight.bprTier}
                    score={spotlight.bprScore}
                    disciplineCount={spotlight.bprDisciplineCount}
                  />
                ) : (
                  <BPRMedalPlaceholder disciplineCount={spotlight.bprDisciplineCount} />
                )}
              </div>
              <h3 className="font-mono text-2xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-3xl">
                {spotlight.productName}
              </h3>
              {spotlight.summary && (
                <p className="font-sans text-[15px] leading-relaxed text-[#888]">
                  {spotlight.summary}
                </p>
              )}

              {spotlight.topScores.length > 0 && (
                <dl className="mt-2 grid grid-cols-2 gap-4">
                  {spotlight.topScores.map((s) => (
                    <div key={s.testName}>
                      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#888]">
                        {s.testName}
                      </dt>
                      <dd className="font-mono text-2xl font-bold text-[#f5f5f0]">
                        {s.score.toLocaleString()}
                        {s.unit && (
                          <span className="ml-1 font-mono text-[11px] font-normal uppercase text-[#888]">
                            {s.unit}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}

              <Link
                href={`/tech/compare?products=${spotlight.productSlug}`}
                className="group mt-2 inline-flex w-fit items-center gap-2 border border-[#f5f5f0] bg-[#f5f5f0] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.05em] text-[#000000] transition-colors duration-200 hover:bg-transparent hover:text-[#f5f5f0]"
              >
                <span>Compare</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="relative aspect-square w-full overflow-hidden border border-[#222] bg-[#0a0a0a] md:w-64">
              {spotlight.heroImageUrl ? (
                <Image
                  src={spotlight.heroImageUrl}
                  alt={spotlight.productName}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#444]">Product</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScrollSection>
  )
}
