"use client"

import { useState } from "react"
import { toast } from "sonner"
import { RolePermissionGrid } from "@/components/admin/role-permission-grid"
import { AdminMemberTable } from "@/components/admin/admin-member-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import type { RoleWithPermissions, AdminMember } from "@/actions/admin-roles"
import { createRole } from "@/actions/admin-roles"

interface RolesPageClientProps {
  initialRoles: RoleWithPermissions[]
  initialMembers: AdminMember[]
}

export function RolesPageClient({
  initialRoles,
  initialMembers,
}: RolesPageClientProps) {
  const [roles, setRoles] = useState(initialRoles)
  const [members, setMembers] = useState(initialMembers)
  const [newRoleOpen, setNewRoleOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleCreateRole() {
    if (!newRoleName.trim()) return

    setCreating(true)
    const result = await createRole(newRoleName)
    setCreating(false)

    if (result.success && result.role) {
      setRoles([...roles, result.role])
      setNewRoleOpen(false)
      setNewRoleName("")
      toast.success(`Role "${result.role.name}" created`)
    } else {
      toast.error(result.error || "Failed to create role")
    }
  }

  return (
    <div className="space-y-8">
      {/* Permission Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#888]">
            Permission Grid
          </h2>
          <button
            onClick={() => setNewRoleOpen(true)}
            className="rounded-none border border-[#f5f5f0] bg-[#f5f5f0] px-4 py-1.5 font-mono text-xs font-bold uppercase text-[#000] transition-colors hover:bg-transparent hover:text-[#f5f5f0]"
          >
            + New Role
          </button>
        </div>
        <RolePermissionGrid roles={roles} onRolesChange={setRoles} />
      </section>

      {/* Team Members */}
      <section>
        <AdminMemberTable
          members={members}
          roles={roles}
          onMembersChange={setMembers}
        />
      </section>

      {/* New Role Dialog */}
      <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
        <DialogContent className="border border-[#222] bg-[#000]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#f5f5f0]">
              Create New Role
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="mb-1 block font-mono text-xs uppercase text-[#888]">
              Role Name
            </label>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="e.g. moderator"
              className="w-full rounded-none border border-[#333] bg-[#000] px-3 py-2 font-mono text-sm text-[#f5f5f0] placeholder:text-[#444] outline-none focus:border-[#f5f5f0]"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateRole()
              }}
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => setNewRoleOpen(false)}
              className="rounded-none border border-[#333] px-4 py-1.5 font-mono text-xs uppercase text-[#888] hover:bg-[#222]"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRole}
              disabled={creating || !newRoleName.trim()}
              className="rounded-none border border-[#f5f5f0] bg-[#f5f5f0] px-4 py-1.5 font-mono text-xs font-bold uppercase text-[#000] disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Role"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
