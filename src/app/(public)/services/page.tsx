import { db } from "@/lib/db"
import { services } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ServiceGrid } from "@/components/services/service-grid"
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
    <div className="px-6 py-12 md:py-16">
      <h1 className="font-mono font-bold text-[40px] md:text-5xl uppercase tracking-[0.05em] mb-8 text-[#f5f5f0]">
        Services
      </h1>
      <ServiceGrid services={servicesList} />
    </div>
  )
}
