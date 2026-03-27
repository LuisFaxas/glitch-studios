"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { ALL_PERMISSIONS, type Permission } from "@/lib/permissions"
import type { RoleWithPermissions } from "@/actions/admin-roles"
import { updateRolePermissions, deleteRole } from "@/actions/admin-roles"

const PERMISSION_LABELS: Record<Permission, string> = {
  manage_content: "Manage Content",
  manage_media: "Manage Media",
  view_clients: "View Clients",
  send_newsletters: "Send Newsletters",
  manage_bookings: "Manage Bookings",
  manage_settings: "Manage Settings",
  manage_roles: "Manage Roles",
  reply_messages: "Reply Messages",
}

interface RolePermissionGridProps {
  roles: RoleWithPermissions[]
  onRolesChange: (roles: RoleWithPermissions[]) => void
}

export function RolePermissionGrid({
  roles,
  onRolesChange,
}: RolePermissionGridProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  async function handleToggle(
    role: RoleWithPermissions,
    permission: Permission,
    checked: boolean
  ) {
    if (role.name === "owner") return

    const newPermissions = checked
      ? [...role.permissions, permission]
      : role.permissions.filter((p) => p !== permission)

    // Optimistic update
    const updatedRoles = roles.map((r) =>
      r.id === role.id ? { ...r, permissions: newPermissions } : r
    )
    onRolesChange(updatedRoles)

    setUpdating(role.id)
    const result = await updateRolePermissions(role.id, newPermissions)
    setUpdating(null)

    if (!result.success) {
      // Revert
      onRolesChange(roles)
      toast.error(result.error || "Failed to update permissions")
    }
  }

  async function handleDeleteRole(roleId: string) {
    if (!confirm("Delete this role? Users with this role will be set to 'user'.")) return

    const result = await deleteRole(roleId)
    if (result.success) {
      onRolesChange(roles.filter((r) => r.id !== roleId))
      toast.success("Role deleted")
    } else {
      toast.error(result.error || "Failed to delete role")
    }
  }

  // Sort: owner first, then defaults, then custom
  const sortedRoles = [...roles].sort((a, b) => {
    if (a.name === "owner") return -1
    if (b.name === "owner") return 1
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return 0
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[#000] px-3 py-2 text-left font-mono text-xs uppercase text-[#666]">
              Permission
            </th>
            {sortedRoles.map((role) => (
              <th
                key={role.id}
                className="min-w-[120px] px-3 py-2 text-center font-mono text-xs uppercase text-[#888]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span>{role.name}</span>
                  {!role.isDefault && role.name !== "owner" && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="font-mono text-[10px] text-[#dc2626] hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALL_PERMISSIONS.map((permission) => (
            <tr key={permission} className="border-t border-[#222]">
              <td className="sticky left-0 z-10 bg-[#000] px-3 py-2 font-mono text-[13px] text-[#ccc]">
                {PERMISSION_LABELS[permission]}
              </td>
              {sortedRoles.map((role) => {
                const isOwner = role.name === "owner"
                const hasPermission = isOwner || role.permissions.includes(permission)

                return (
                  <td
                    key={role.id}
                    className="px-3 py-2 text-center"
                  >
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={hasPermission}
                        disabled={isOwner || updating === role.id}
                        onCheckedChange={(checked) =>
                          handleToggle(role, permission, !!checked)
                        }
                      />
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
