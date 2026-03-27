export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { services } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { getServiceBookingConfig } from "./actions"
import { AdminServiceBookingConfig } from "@/components/admin/admin-service-booking-config"

export default async function ServiceBookingConfigPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1)

  if (!service) notFound()

  const config = await getServiceBookingConfig(id)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        {service.name} &mdash; Booking Config
      </h1>
      <AdminServiceBookingConfig
        serviceId={id}
        serviceName={service.name}
        config={config}
      />
    </div>
  )
}
