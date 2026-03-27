export const dynamic = "force-dynamic"

import { getService } from "@/actions/admin-services"
import { ServicePageForm } from "@/components/admin/service-page-form"
import { notFound } from "next/navigation"

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const service = await getService(id)
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
          Edit Service
        </h1>
        <ServicePageForm service={service} />
      </div>
    )
  } catch {
    notFound()
  }
}
