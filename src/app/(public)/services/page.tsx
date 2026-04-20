import { db } from "@/lib/db"
import { services, serviceBookingConfig } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ServiceGrid } from "@/components/services/service-grid"
import { ComingSoonManifesto } from "@/components/services/coming-soon-manifesto"
import { getBookingLive } from "@/lib/get-booking-live"
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

export default async function ServicesPage() {
  const bookingLive = await getBookingLive()
  if (!bookingLive) {
    return <ComingSoonManifesto />
  }

  const bookableConfigs = await db
    .select({ serviceId: serviceBookingConfig.serviceId })
    .from(serviceBookingConfig)

  if (bookableConfigs.length === 0) {
    return <ComingSoonManifesto />
  }

  const servicesList = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder))

  const bookableServiceIds = new Set(bookableConfigs.map((c) => c.serviceId))

  const servicesWithBookable = servicesList.map((s) => ({
    ...s,
    isBookable: bookableServiceIds.has(s.id),
  }))

  return (
    <div className="px-6 py-12 md:py-16">
      <h1 className="font-mono font-bold text-[40px] md:text-5xl uppercase tracking-[0.05em] mb-8 text-[#f5f5f0]">
        Services
      </h1>
      <ServiceGrid services={servicesWithBookable} />
    </div>
  )
}
