import { db } from "@/lib/db"
import { services } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ServiceTabs } from "@/components/services/service-tabs"
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
  const servicesList = await db
    .select()
    .from(services)
    .where(eq(services.isActive, true))
    .orderBy(asc(services.sortOrder))

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-12 text-white">
        Our Services
      </h1>
      <ServiceTabs services={servicesList} />
    </div>
  )
}
