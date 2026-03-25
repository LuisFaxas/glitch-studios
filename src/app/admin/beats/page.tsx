export const dynamic = "force-dynamic"

import { getAllBeatsAdmin } from "@/actions/admin-beats"
import { AdminBeatTable } from "@/components/admin/beats/beat-table"
import Link from "next/link"

export default async function AdminBeatsPage() {
  const beats = await getAllBeatsAdmin()
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Beats
        </h1>
        <Link
          href="/admin/beats/new"
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 rounded-none"
        >
          New Beat
        </Link>
      </div>
      <AdminBeatTable beats={beats} />
    </div>
  )
}
