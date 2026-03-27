import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { services, serviceBookingConfig } from "@/db/schema"
import { BookingFlow } from "@/components/booking/booking-flow"
import type { ServiceBookingInfo, DepositType, RefundPolicy } from "@/types/booking"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Book Session | Glitch Studios",
  description: "Book a studio session, mixing, mastering, or production service at Glitch Studios.",
}

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>
}) {
  const params = await searchParams

  // Query services that have booking config (inner join)
  const rows = await db
    .select({
      serviceId: services.id,
      serviceName: services.name,
      serviceSlug: services.slug,
      serviceType: services.type,
      priceLabel: services.priceLabel,
      durationMinutes: serviceBookingConfig.durationMinutes,
      depositType: serviceBookingConfig.depositType,
      depositValue: serviceBookingConfig.depositValue,
      autoConfirm: serviceBookingConfig.autoConfirm,
      cancellationWindowHours: serviceBookingConfig.cancellationWindowHours,
      refundPolicy: serviceBookingConfig.refundPolicy,
      maxAdvanceBookingDays: serviceBookingConfig.maxAdvanceBookingDays,
      prepInstructions: serviceBookingConfig.prepInstructions,
    })
    .from(services)
    .innerJoin(
      serviceBookingConfig,
      eq(services.id, serviceBookingConfig.serviceId)
    )
    .where(eq(services.isActive, true))
    .orderBy(services.sortOrder)

  const bookableServices: ServiceBookingInfo[] = rows.map((row) => ({
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    serviceSlug: row.serviceSlug,
    durationMinutes: row.durationMinutes,
    depositType: (row.depositType ?? "percentage") as DepositType,
    depositValue: Number(row.depositValue),
    autoConfirm: row.autoConfirm ?? true,
    cancellationWindowHours: row.cancellationWindowHours ?? 48,
    refundPolicy: (row.refundPolicy ?? "full") as RefundPolicy,
    maxAdvanceBookingDays: row.maxAdvanceBookingDays ?? 90,
    prepInstructions: row.prepInstructions,
    priceLabel: row.priceLabel,
  }))

  return (
    <div className="py-8 lg:py-12">
      <h1 className="font-mono text-[40px] font-bold text-[#f5f5f0] mb-8 lg:mb-12">
        BOOK SESSION
      </h1>

      <BookingFlow
        services={bookableServices}
        initialServiceSlug={params.service}
      />
    </div>
  )
}
