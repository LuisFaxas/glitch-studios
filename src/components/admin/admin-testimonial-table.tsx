"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { deleteTestimonial } from "@/actions/admin-content"
import { TestimonialForm } from "./testimonial-form"

interface TestimonialRow {
  id: string
  clientName: string
  clientTitle: string | null
  quote: string
  serviceType: string | null
  rating: number | null
  avatarUrl: string | null
  isActive: boolean | null
  sortOrder: number | null
}

export function AdminTestimonialTable({
  testimonials,
}: {
  testimonials: TestimonialRow[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [editTarget, setEditTarget] = useState<TestimonialRow | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const handleDelete = () => {
    if (!deleteTarget) return
    startTransition(async () => {
      try {
        await deleteTestimonial(deleteTarget.id)
        toast.success("Testimonial deleted")
        setDeleteTarget(null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Delete failed")
      }
    })
  }

  const truncate = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "..." : text

  return (
    <>
      {/* Add Button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 rounded-none"
        >
          Add Testimonial
        </button>
      </div>

      <div className="border border-[#222222] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#222222]">
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Client
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Quote
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Service
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Rating
              </th>
              <th className="font-mono text-[11px] uppercase tracking-wider text-[#888888] px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {testimonials.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-12 text-[#555555] font-sans text-[13px]"
                >
                  No testimonials yet. Add your first testimonial.
                </td>
              </tr>
            ) : (
              testimonials.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[#111111] hover:bg-[#111111]"
                >
                  <td className="px-4 py-3 text-[#f5f5f0] font-sans text-[13px]">
                    {t.clientName}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-sans text-[13px] max-w-[300px]">
                    {truncate(t.quote, 80)}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-mono text-[11px] uppercase">
                    {t.serviceType || "--"}
                  </td>
                  <td className="px-4 py-3 text-[#888888] font-mono text-[13px]">
                    {t.rating ? `${t.rating}/5` : "--"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditTarget(t)}
                        className="font-mono text-[11px] uppercase text-[#f5f5f0] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: t.id,
                            name: t.clientName,
                          })
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

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent className="bg-[#0a0a0a] border border-[#222222] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase tracking-wider">
              New Testimonial
            </DialogTitle>
          </DialogHeader>
          <TestimonialForm
            onSaved={() => {
              setShowCreate(false)
              router.refresh()
            }}
            onCancel={() => setShowCreate(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => !o && setEditTarget(null)}
      >
        <DialogContent className="bg-[#0a0a0a] border border-[#222222] sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase tracking-wider">
              Edit Testimonial
            </DialogTitle>
          </DialogHeader>
          {editTarget && (
            <TestimonialForm
              testimonial={editTarget}
              onSaved={() => {
                setEditTarget(null)
                router.refresh()
              }}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent className="bg-[#0a0a0a] border border-[#222222] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase tracking-wider">
              Delete Testimonial
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#888888] font-sans text-[13px]">
            This will permanently remove the testimonial from &ldquo;
            {deleteTarget?.name}&rdquo;. This cannot be undone.
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
