export const dynamic = "force-dynamic"

import { getBeatById } from "@/actions/admin-beats"
import { BeatForm } from "@/components/admin/beats/beat-form"
import { notFound } from "next/navigation"
import { getMediaForEntity } from "@/lib/media/queries"
import { MediaItemAttachmentList } from "@/components/media/media-item-attachment-list"

export default async function EditBeatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const beat = await getBeatById(id)
  if (!beat) notFound()
  const mediaRows = await getMediaForEntity("beat", id)
  return (
    <div className="p-6 max-w-[640px] mx-auto space-y-8">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        Edit Beat
      </h1>
      <BeatForm mode="edit" beat={beat} />
      <MediaItemAttachmentList
        attachedToType="beat"
        attachedToId={id}
        entityNoun="beat"
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
}
