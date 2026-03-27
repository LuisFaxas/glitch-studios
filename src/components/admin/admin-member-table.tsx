"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import type { AdminMember, RoleWithPermissions } from "@/actions/admin-roles"
import { assignRole, removeAdminAccess } from "@/actions/admin-roles"

const ROLE_BADGE_COLORS: Record<string, string> = {
  owner: "#f5f5f0",
  editor: "#888888",
  manager: "#555555",
  admin: "#f5f5f0",
}

function RoleBadge({ role }: { role: string }) {
  const color = ROLE_BADGE_COLORS[role] || "#666666"
  return (
    <span
      className="inline-block rounded-none px-2 py-0.5 font-mono text-xs uppercase tracking-wider"
      style={{ color, backgroundColor: "#222222" }}
    >
      {role}
    </span>
  )
}

interface AdminMemberTableProps {
  members: AdminMember[]
  roles: RoleWithPermissions[]
  onMembersChange: (members: AdminMember[]) => void
}

export function AdminMemberTable({
  members,
  roles,
  onMembersChange,
}: AdminMemberTableProps) {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)

  const [confirmRemove, setConfirmRemove] = useState<AdminMember | null>(null)
  const [changeRole, setChangeRole] = useState<AdminMember | null>(null)
  const [newRole, setNewRole] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const roleNames = roles.map((r) => r.name)

  async function handleInvite() {
    if (!inviteEmail || !inviteRole) {
      toast.error("Email and role are required")
      return
    }

    setInviteLoading(true)
    try {
      // Look up user by email via server action (assign role which checks user exists)
      // We need to find user first - use a fetch to check
      const res = await fetch(`/api/admin/lookup-user?email=${encodeURIComponent(inviteEmail)}`)
      if (!res.ok) {
        toast.error("User must register first.")
        setInviteLoading(false)
        return
      }
      const data = await res.json()
      if (!data.userId) {
        toast.error("User must register first.")
        setInviteLoading(false)
        return
      }

      const result = await assignRole(data.userId, inviteRole)
      if (result.success) {
        toast.success(`${inviteEmail} assigned ${inviteRole} role`)
        // Add to members list
        onMembersChange([
          ...members,
          {
            id: data.userId,
            name: data.name || inviteEmail.split("@")[0],
            email: inviteEmail,
            role: inviteRole,
            createdAt: new Date().toISOString(),
          },
        ])
        setInviteOpen(false)
        setInviteEmail("")
        setInviteRole("")
      } else {
        toast.error(result.error || "Failed to assign role")
      }
    } catch {
      toast.error("Failed to invite member")
    } finally {
      setInviteLoading(false)
    }
  }

  async function handleRemove() {
    if (!confirmRemove) return
    setActionLoading(true)
    const result = await removeAdminAccess(confirmRemove.id)
    setActionLoading(false)

    if (result.success) {
      toast.success("Admin access removed")
      onMembersChange(members.filter((m) => m.id !== confirmRemove.id))
      setConfirmRemove(null)
    } else {
      toast.error(result.error || "Failed to remove")
    }
  }

  async function handleChangeRole() {
    if (!changeRole || !newRole) return
    setActionLoading(true)
    const result = await assignRole(changeRole.id, newRole)
    setActionLoading(false)

    if (result.success) {
      toast.success(`Role changed to ${newRole}`)
      onMembersChange(
        members.map((m) =>
          m.id === changeRole.id ? { ...m, role: newRole } : m
        )
      )
      setChangeRole(null)
      setNewRole("")
    } else {
      toast.error(result.error || "Failed to change role")
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[#888]">
          Team Members
        </h3>
        <button
          onClick={() => setInviteOpen(true)}
          className="rounded-none border border-[#f5f5f0] bg-[#f5f5f0] px-4 py-1.5 font-mono text-xs font-bold uppercase text-[#000] transition-colors hover:bg-transparent hover:text-[#f5f5f0]"
        >
          Invite Member
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Name
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Email
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Role
              </TableHead>
              <TableHead className="font-mono text-xs uppercase text-[#666]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center font-mono text-sm text-[#444]"
                >
                  No team members yet
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow
                  key={m.id}
                  className="border-[#222] hover:bg-[#111]"
                >
                  <TableCell className="font-mono text-sm text-[#f5f5f0]">
                    {m.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[#ccc]">
                    {m.email}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={m.role} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setChangeRole(m)
                          setNewRole(m.role)
                        }}
                        className="rounded-none border border-[#333] px-2 py-0.5 font-mono text-[10px] uppercase text-[#888] hover:bg-[#222]"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => setConfirmRemove(m)}
                        className="rounded-none border border-[#dc2626] px-2 py-0.5 font-mono text-[10px] uppercase text-[#dc2626] hover:bg-[#dc2626] hover:text-[#000]"
                      >
                        Remove
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="border border-[#222] bg-[#000]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#f5f5f0]">
              Invite Member
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase text-[#888]">
                Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                className="rounded-none border border-[#333] bg-[#000] px-3 py-2 font-mono text-sm text-[#f5f5f0] placeholder:text-[#444] outline-none focus:border-[#f5f5f0]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase text-[#888]">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="rounded-none border border-[#333] bg-[#000] px-3 py-2 font-mono text-sm text-[#f5f5f0] outline-none"
              >
                <option value="">Select role...</option>
                {roleNames
                  .filter((r) => r !== "owner")
                  .map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={handleInvite}
              disabled={inviteLoading}
              className="rounded-none border border-[#f5f5f0] bg-[#f5f5f0] px-4 py-1.5 font-mono text-xs font-bold uppercase text-[#000] disabled:opacity-50"
            >
              {inviteLoading ? "Inviting..." : "Invite"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={!!confirmRemove}
        onOpenChange={() => setConfirmRemove(null)}
      >
        <DialogContent className="border border-[#222] bg-[#000]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#dc2626]">
              Remove Admin Access
            </DialogTitle>
          </DialogHeader>
          <p className="font-mono text-sm text-[#888]">
            This will revoke admin access for{" "}
            <span className="text-[#f5f5f0]">{confirmRemove?.name}</span>. They
            will be set to a regular user.
          </p>
          <DialogFooter>
            <button
              onClick={() => setConfirmRemove(null)}
              className="rounded-none border border-[#333] px-4 py-1.5 font-mono text-xs uppercase text-[#888] hover:bg-[#222]"
            >
              Cancel
            </button>
            <button
              onClick={handleRemove}
              disabled={actionLoading}
              className="rounded-none border border-[#dc2626] bg-[#dc2626] px-4 py-1.5 font-mono text-xs font-bold uppercase text-[#000] disabled:opacity-50"
            >
              {actionLoading ? "Removing..." : "Remove Access"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={!!changeRole} onOpenChange={() => setChangeRole(null)}>
        <DialogContent className="border border-[#222] bg-[#000]">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase text-[#f5f5f0]">
              Change Role
            </DialogTitle>
          </DialogHeader>
          <p className="font-mono text-sm text-[#888]">
            Change role for{" "}
            <span className="text-[#f5f5f0]">{changeRole?.name}</span>
          </p>
          <div className="py-2">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full rounded-none border border-[#333] bg-[#000] px-3 py-2 font-mono text-sm text-[#f5f5f0] outline-none"
            >
              {roleNames.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <button
              onClick={() => setChangeRole(null)}
              className="rounded-none border border-[#333] px-4 py-1.5 font-mono text-xs uppercase text-[#888] hover:bg-[#222]"
            >
              Cancel
            </button>
            <button
              onClick={handleChangeRole}
              disabled={actionLoading}
              className="rounded-none border border-[#f5f5f0] bg-[#f5f5f0] px-4 py-1.5 font-mono text-xs font-bold uppercase text-[#000] disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
