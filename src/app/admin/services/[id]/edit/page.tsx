export const dynamic = "force-dynamic"

import { getService } from "@/actions/admin-services"
import { ServicePageForm } from "@/components/admin/service-page-form"
import { notFound } from "next/navigation"
import { getMediaForEntity } from "@/lib/media/queries"
import { MediaItemAttachmentList } from "@/components/media/media-item-attachment-list"

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const service = await getService(id)
    const mediaRows = await getMediaForEntity("service", id)
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
          Edit Service
        </h1>
        <ServicePageForm service={service} />
        <MediaItemAttachmentList
          attachedToType="service"
          attachedToId={id}
          entityNoun="service"
          initialItems={mediaRows.map((m) => ({
            id: m.id,
            kind: m.kind,
            externalId: m.externalId,
            title: m.title,
            thumbnailUrl: m.thumbnailUrl,
            isPrimary: m.isPrimary,
            sortOrder: m.sortOrder,
          }))}
        />
      </div>
    )
  } catch {
    notFound()
  }
}
