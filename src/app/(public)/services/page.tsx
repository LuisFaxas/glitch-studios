import { db } from "@/lib/db"
import { services, serviceBookingConfig } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ServiceGrid } from "@/components/services/service-grid"
import { ServicesHeroCarousel } from "@/components/services/services-hero-carousel"
import { ComingSoonManifesto } from "@/components/services/coming-soon-manifesto"
import { getBookingLive } from "@/lib/get-booking-live"
import Link from "next/link"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Services",
  description:
    "Studio sessions, mixing & mastering, SFX design, video production, photography, and graphic design services from Glitch Studios.",
  openGraph: {
    title: "Services | Glitch Studios",
    description:
      "Studio sessions, mixing & mastering, SFX design, video production, photography, and graphic design services from Glitch Studios.",
    type: "website",
  },
}

function deliverablesFor(type: string): string[] {
  switch (type) {
    case "mixing":
    case "mastering":
      return ["Session stems", "Final master (WAV + MP3)", "Revision pass"]
    case "studio_session":
    case "tracking":
      return ["Recorded stems", "Session notes", "Rough reference mix"]
    case "video":
    case "video_production":
      return ["Raw footage", "Edited master cut", "One revision round"]
    case "graphic_design":
      return [
        "Working files (AI/PSD)",
        "Export bundle (PNG/JPG/PDF)",
        "One revision round",
      ]
    case "sfx":
    case "sound_design":
      return ["Source SFX bundle", "Mixed stems", "Revision pass"]
    case "photography":
      return [
        "Studio or location shoot",
        "Lit and retouched",
        "Press + cover-ready exports",
      ]
    default:
      return ["Service deliverables per your brief", "One revision round"]
  }
}

export default async function ServicesPage() {
  const bookingLive = await getBookingLive()
  if (!bookingLive) {
    return <ComingSoonManifesto />
  }

  const bookableConfigs = await db.select().from(serviceBookingConfig)

  if (bookableConfigs.length === 0) {
    return <ComingSoonManifesto />
  }

  const servicesList = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder))

  const configByServiceId = new Map(
    bookableConfigs.map((c) => [c.serviceId, c])
  )

  const enrichedServices = servicesList.map((s) => {
    const cfg = configByServiceId.get(s.id)
    return {
      ...s,
      isBookable: Boolean(cfg),
      durationMinutes: cfg?.durationMinutes ?? null,
      depositType: (cfg?.depositType ?? null) as
        | "flat"
        | "percentage"
        | null,
      depositValue:
        cfg?.depositValue != null ? Number(cfg.depositValue) : null,
      cancellationWindowHours: cfg?.cancellationWindowHours ?? null,
      refundPolicy: cfg?.refundPolicy ?? null,
      deliverables: deliverablesFor(s.type),
    }
  })

  return (
    <div className="px-4 py-6 md:px-6 md:py-12">
      <ServicesHeroCarousel />

      <div className="sticky top-0 z-10 -mx-4 md:-mx-6 mb-6 border-y border-[#222] bg-[#0a0a0a] px-4 md:px-6 py-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#888]">SERVICES</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.05em] text-[#555]">
            <span className="md:hidden">{enrichedServices.length === 0 ? "0 OPTIONS · CHECK BACK SOON" : `${enrichedServices.length + 1} OPTIONS · TAP TO VIEW`}</span>
            <span className="hidden md:inline">{enrichedServices.length === 0 ? "0 OPTIONS · CHECK BACK SOON" : `${enrichedServices.length + 1} OPTIONS · CLICK TO VIEW`}</span>
          </span>
        </div>
      </div>

      <ServiceGrid services={enrichedServices} />

      <section className="mt-12 md:mt-16 border border-[#222] bg-[#111] p-6 md:p-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 max-w-[600px]">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#555]">NOT SURE WHICH FITS?</span>
            <h2 className="font-mono font-bold uppercase tracking-[0.05em] text-[#f5f5f0] text-[20px] md:text-[28px] leading-[1.15]">
              TALK TO US. WE&apos;LL SCOPE IT.
            </h2>
            <p className="font-sans text-[#888] text-[13px] md:text-[15px] leading-[1.5]">
              Tell us what you&apos;re making and we&apos;ll put together a session plan, a quote, or both.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center justify-center border border-[#f5f5f0] px-6 py-3 font-mono text-[13px] uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors duration-150 hover:bg-[#f5f5f0] hover:text-[#000]"
          >
            START A CONVERSATION
          </Link>
        </div>
      </section>
    </div>
  )
}
