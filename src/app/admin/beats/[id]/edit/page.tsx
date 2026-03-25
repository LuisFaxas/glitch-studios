export const dynamic = "force-dynamic"

import { getBeatById } from "@/actions/admin-beats"
import { BeatForm } from "@/components/admin/beats/beat-form"
import { notFound } from "next/navigation"

export default async function EditBeatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const beat = await getBeatById(id)
  if (!beat) notFound()
  return (
    <div className="p-6 max-w-[640px] mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        Edit Beat
      </h1>
      <BeatForm mode="edit" beat={beat} />
    </div>
  )
}
