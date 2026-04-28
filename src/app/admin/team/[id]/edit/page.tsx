export const dynamic = "force-dynamic"

import { getTeamMember } from "@/actions/admin-content"
import { TeamMemberForm } from "@/components/admin/team-member-form"
import { notFound } from "next/navigation"

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let member: Awaited<ReturnType<typeof getTeamMember>>

  try {
    member = await getTeamMember(id)
  } catch {
    notFound()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        Edit Team Member
      </h1>
      <TeamMemberForm member={member} />
    </div>
  )
}
