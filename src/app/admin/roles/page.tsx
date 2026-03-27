export const dynamic = "force-dynamic"

import { getRoles, getAdminMembers } from "@/actions/admin-roles"
import { RolesPageClient } from "./client"

export default async function AdminRolesPage() {
  const [roles, members] = await Promise.all([getRoles(), getAdminMembers()])

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8">
        <h1 className="font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Roles & Permissions
        </h1>
      </div>

      <RolesPageClient initialRoles={roles} initialMembers={members} />
    </div>
  )
}
