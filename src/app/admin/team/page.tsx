export const dynamic = "force-dynamic"

import { getTeamMembers, deleteTeamMember } from "@/actions/admin-content"
import { AdminTeamTable } from "@/components/admin/admin-team-table"
import Link from "next/link"

export default async function AdminTeamPage() {
  const members = await getTeamMembers()
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Team
        </h1>
        <Link
          href="/admin/team/new"
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 rounded-none"
        >
          Add Member
        </Link>
      </div>
      <AdminTeamTable members={members} />
    </div>
  )
}
