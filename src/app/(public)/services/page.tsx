import { db } from "@/lib/db"
import { services, serviceBookingConfig } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ServiceGrid } from "@/components/services/service-grid"
import { ComingSoonManifesto } from "@/components/services/coming-soon-manifesto"
import { getBookingLive } from "@/lib/get-booking-live"
import { getPortfolioForService } from "@/lib/services/portfolio-for-service"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Services",
  description:
    "Studio sessions, mixing & mastering, video production, SFX design, and graphic design services from Glitch Studios.",
  openGraph: {
    title: "Services | Glitch Studios",
    description:
      "Studio sessions, mixing & mastering, video production, SFX design, and graphic design services from Glitch Studios.",
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

  const portfolioEntries = await Promise.all(
    servicesList.map(async (s) => {
      const items = await getPortfolioForService({
        slug: s.slug,
        type: s.type,
      })
      return [s.id, items] as const
    })
  )
  const portfolioByServiceId = Object.fromEntries(portfolioEntries)

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
    <div className="px-6 py-12 md:py-16">
      <h1 className="font-mono font-bold text-[40px] md:text-5xl uppercase tracking-[0.05em] mb-8 text-[#f5f5f0]">
        Services
      </h1>
      <ServiceGrid
        services={enrichedServices}
        portfolioByServiceId={portfolioByServiceId}
      />
    </div>
  )
}
