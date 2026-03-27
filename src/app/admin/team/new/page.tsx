export const dynamic = "force-dynamic"

import { TeamMemberForm } from "@/components/admin/team-member-form"

export default function NewTeamMemberPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        New Team Member
      </h1>
      <TeamMemberForm />
    </div>
  )
}
