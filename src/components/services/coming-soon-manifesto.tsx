import { GlitchLogo } from "@/components/layout/glitch-logo"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { NewsletterForm } from "@/components/forms/newsletter-form"

export function ComingSoonManifesto() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f0]">
      <section className="mx-auto max-w-[960px] px-6 pt-16 pb-12 flex flex-col items-start gap-8">
        <GlitchLogo size="lg" animate={false} />
        <h1
          className="font-mono font-bold uppercase tracking-[0.05em] leading-[1.1] md:leading-[1.2]"
          style={{ fontSize: "clamp(28px, 5vw, 48px)" }}
        >
          <GlitchHeading text="WE'RE BUILDING GLITCH STUDIOS.">
            {"WE'RE BUILDING GLITCH STUDIOS."}
          </GlitchHeading>
        </h1>
        <p className="font-sans text-[14px] leading-[1.5] max-w-[640px] text-[#f5f5f0]">
          A full-service music, video, and creative studio is almost online.
          Rooms are wiring up, sessions are locking in. Bookings open soon.
        </p>
      </section>

      <section className="mx-auto max-w-[960px] px-6 pb-12">
        <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#888888] mb-4">
          {"WHAT WE'RE BUILDING"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <div className="bg-[#111111] border border-[#222222] p-4 min-h-[120px]">
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
              MUSIC PRODUCTION
            </h3>
            <p className="font-sans text-[14px] leading-[1.5] text-[#888888]">
              Beats, mixing, mastering, and full-session studio time.
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] p-4 min-h-[120px]">
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
              VIDEO PRODUCTION
            </h3>
            <p className="font-sans text-[14px] leading-[1.5] text-[#888888]">
              Music videos, performance capture, and narrative shoots.
            </p>
          </div>
          <div className="bg-[#111111] border border-[#222222] p-4 min-h-[120px]">
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-2">
              CREATIVE SERVICES
            </h3>
            <p className="font-sans text-[14px] leading-[1.5] text-[#888888]">
              Graphic design, SFX, and brand-building for artists.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[960px] px-6 pb-16 flex flex-col gap-4">
        <h2 className="font-mono text-[20px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
          <GlitchHeading text="BE FIRST IN THE DOOR">
            BE FIRST IN THE DOOR
          </GlitchHeading>
        </h2>
        <p className="font-sans text-[14px] leading-[1.5] max-w-[480px] text-[#888888]">
          {"Drop your email. We'll let you know the day bookings open. No spam, no filler."}
        </p>
        <div className="max-w-[480px] w-full">
          <NewsletterForm source="launch-notify" />
        </div>
      </section>
    </div>
  )
}
