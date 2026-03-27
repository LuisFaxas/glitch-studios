"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { deleteTeamMember } from "@/actions/admin-content"

interface TeamMemberRow {
  id: string
  name: string
  role: string
  photoUrl: string | null
  sortOrder: number | null
}

export function AdminTeamTable({ members }: { members: TeamMemberRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      try {
        await deleteTeamMember(deleteTarget.id)
        toast.success("Team member removed")
        setDeleteTarget(null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed")
      }
    })
  }

  return (
    <>
      <div className="border border-[#222222] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Photo
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Name
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Role
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Order
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-[#555555] font-sans text-[13px]"
                >
                  No team members yet. Add your first member.
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-[#111111] hover:bg-[#111111]"
                >
                  <td className="px-4 py-3">
                    {m.photoUrl ? (
                      <img
                        src={m.photoUrl}
                        alt={m.name}
                        className="w-12 h-12 object-cover border border-[#222222]"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#222222] border border-[#333333] flex items-center justify-center">
                        <span className="text-[#555555] font-mono text-[11px]">
                          --
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#f5f5f0] font-sans text-[13px]">
                    {m.name}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-sans text-[13px]">
                    {m.role}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-mono text-[13px]">
                    {m.sortOrder ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/team/${m.id}/edit`}
                        className="font-mono text-[11px] uppercase text-[#f5f5f0] hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({ id: m.id, name: m.name })
                        }
                        className="font-mono text-[11px] uppercase text-[#ff4444] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="bg-[#0a0a0a] border border-[#222222] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase tracking-wider">
              Remove Team Member
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#888888] font-sans text-[13px]">
            This will permanently remove &ldquo;{deleteTarget?.name}&rdquo; from
            the site.
          </p>
          <DialogFooter className="bg-transparent border-0 p-0 flex-row gap-2 justify-end">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-[#ff4444] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
