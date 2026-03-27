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
import { deactivateService, deleteService } from "@/actions/admin-services"

interface ServiceRow {
  id: string
  name: string
  type: string
  priceLabel: string
  sortOrder: number | null
  isActive: boolean | null
  hasBookingConfig: boolean
}

export function AdminServiceTable({ services }: { services: ServiceRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmDialog, setConfirmDialog] = useState<{
    id: string
    name: string
    action: "deactivate" | "delete"
  } | null>(null)

  const handleAction = () => {
    if (!confirmDialog) return
    startTransition(async () => {
      try {
        if (confirmDialog.action === "deactivate") {
          await deactivateService(confirmDialog.id)
          toast.success("Service deactivated")
        } else {
          await deleteService(confirmDialog.id)
          toast.success("Service deleted")
        }
        setConfirmDialog(null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Action failed")
      }
    })
  }

  const typeLabels: Record<string, string> = {
    studio_session: "Studio Session",
    mixing: "Mixing",
    mastering: "Mastering",
    video_production: "Video Production",
    sfx: "SFX",
    graphic_design: "Graphic Design",
  }

  return (
    <>
      <div className="border border-[#222222] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Name
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Type
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Price
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Order
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Active
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Booking
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {services.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-12 text-[#555555] font-sans text-[13px]"
                >
                  No services yet. Create your first service.
                </td>
              </tr>
            ) : (
              services.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-[#111111] hover:bg-[#111111]"
                >
                  <td className="px-4 py-3 text-[#f5f5f0] font-sans text-[13px]">
                    {s.name}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-sans text-[13px]">
                    {typeLabels[s.type] ?? s.type}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-sans text-[13px]">
                    {s.priceLabel}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-mono text-[13px]">
                    {s.sortOrder ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block font-mono text-[11px] uppercase px-2 py-0.5 ${s.isActive ? "bg-[#f5f5f0]/10 text-[#f5f5f0]" : "bg-[#ff4444]/10 text-[#ff4444]"}`}
                    >
                      {s.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.hasBookingConfig ? (
                      <Link
                        href={`/admin/services/${s.id}/booking-config`}
                        className="font-mono text-[11px] uppercase text-[#f5f5f0] underline"
                      >
                        Configured
                      </Link>
                    ) : (
                      <span className="font-mono text-[11px] uppercase text-[#555555]">
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/services/${s.id}/edit`}
                        className="font-mono text-[11px] uppercase text-[#f5f5f0] hover:underline"
                      >
                        Edit
                      </Link>
                      {s.isActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDialog({
                              id: s.id,
                              name: s.name,
                              action: "deactivate",
                            })
                          }
                          className="font-mono text-[11px] uppercase text-[#ff8800] hover:underline"
                        >
                          Deactivate
                        </button>
                      ) : !s.hasBookingConfig ? (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDialog({
                              id: s.id,
                              name: s.name,
                              action: "delete",
                            })
                          }
                          className="font-mono text-[11px] uppercase text-[#ff4444] hover:underline"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog */}
      <Dialog
        open={!!confirmDialog}
        onOpenChange={(o) => !o && setConfirmDialog(null)}
      >
        <DialogContent className="bg-[#0a0a0a] border border-[#222222] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase tracking-wider">
              {confirmDialog?.action === "deactivate"
                ? "Deactivate Service"
                : "Delete Service"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#888888] font-sans text-[13px]">
            {confirmDialog?.action === "deactivate"
              ? `This service will be hidden from the public site but its booking history will be preserved.`
              : `This will permanently remove "${confirmDialog?.name}". This cannot be undone.`}
          </p>
          <DialogFooter className="bg-transparent border-0 p-0 flex-row gap-2 justify-end">
            <button
              type="button"
              onClick={() => setConfirmDialog(null)}
              className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAction}
              disabled={isPending}
              className={`font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50 ${
                confirmDialog?.action === "delete"
                  ? "bg-[#ff4444] text-[#000000]"
                  : "bg-[#ff8800] text-[#000000]"
              }`}
            >
              {isPending
                ? "Processing..."
                : confirmDialog?.action === "deactivate"
                  ? "Deactivate"
                  : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
