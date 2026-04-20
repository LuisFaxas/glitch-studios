import type { Metadata } from "next"
import { GlitchLogo } from "@/components/layout/glitch-logo"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { NewsletterForm } from "@/components/forms/newsletter-form"

export const metadata: Metadata = {
  title: "Glitch Apparel — Coming Soon",
  description:
    "Glitch Apparel is almost live. Drop your email to be the first to know when the store opens.",
  openGraph: {
    title: "Glitch Apparel — Coming Soon",
    description:
      "Glitch Apparel is almost live. Drop your email to be the first to know when the store opens.",
    type: "website",
  },
}

export default function ApparelComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f0]">
      <section className="mx-auto max-w-[960px] px-6 pt-16 pb-12 flex flex-col items-start gap-8">
        <GlitchLogo size="lg" animate={false} text="GLITCH" />
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.5em] text-[#888888]">
          APPAREL
        </span>
        <h1
          className="font-mono font-bold uppercase tracking-[0.05em] leading-[1.1] md:leading-[1.2]"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          <GlitchHeading text="GLITCH APPAREL. DROPPING SOON.">
            {"GLITCH APPAREL. DROPPING SOON."}
          </GlitchHeading>
        </h1>
        <p className="font-sans text-[14px] leading-[1.5] max-w-[640px] text-[#f5f5f0]">
          Studio-grade clothing for producers, engineers, and the heads who
          make the sound. First drop is coming. Limited runs, one-of-one
          colorways, no restock promises.
        </p>
      </section>

      <section className="mx-auto max-w-[960px] px-6 pb-12">
        <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-4">
          {"WHAT'S DROPPING"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <div className="bg-[#111111] border border-[#222222] p-4 min-h-[120px]">
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
              TEES
            </h3>
            <p className="font-sans text-[14px] leading-[1.5] text-[#888888]">
              Heavyweight studio tees with original graphics.
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] p-4 min-h-[120px]">
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
              HOODIES
            </h3>
            <p className="font-sans text-[14px] leading-[1.5] text-[#888888]">
              Cold-room certified. For beat-making sessions and street runs.
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] p-4 min-h-[120px]">
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
              ACCESSORIES
            </h3>
            <p className="font-sans text-[14px] leading-[1.5] text-[#888888]">
              Caps, patches, and one-off pieces from the studio archive.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-6 pb-16 flex flex-col gap-4">
        <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          <GlitchHeading text="FIRST IN, FIRST DRESSED">
            FIRST IN, FIRST DRESSED
          </GlitchHeading>
        </h2>
        <p className="font-sans text-[14px] leading-[1.5] max-w-[480px] text-[#888888]">
          {
            "Drop your email. We'll send you the launch link before we post anywhere else. No spam, no filler."
          }
        </p>
        <div className="max-w-[480px] w-full">
          <NewsletterForm source="apparel" />
        </div>
      </section>
    </div>
  )
}
