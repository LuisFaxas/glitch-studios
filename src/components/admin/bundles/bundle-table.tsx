"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteBundle } from "@/actions/admin-bundles"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface BundleRow {
  id: string
  title: string
  discountPercent: number
  isActive: boolean | null
  beatCount: number
}

interface AdminBundleTableProps {
  bundles: BundleRow[]
}

export function AdminBundleTable({ bundles }: AdminBundleTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState("")

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteBundle(deleteId)
      toast.success("Bundle deleted")
      setDeleteId(null)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete bundle"
      )
    }
  }

  if (bundles.length === 0) {
    return (
      <p className="text-[#888] font-sans text-center py-12">
        No bundles yet. Create your first bundle.
      </p>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="border-[#333]">
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Name
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Beats
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Discount
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Status
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bundles.map((bundle) => (
            <TableRow key={bundle.id} className="border-[#333]">
              <TableCell className="text-[#f5f5f0] font-sans">
                {bundle.title}
              </TableCell>
              <TableCell className="text-[#ccc] font-mono text-sm">
                {bundle.beatCount}
              </TableCell>
              <TableCell className="text-[#ccc] font-mono text-sm">
                {bundle.discountPercent}%
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block px-2 py-0.5 text-[11px] font-mono uppercase ${
                    bundle.isActive
                      ? "bg-[#f5f5f0] text-[#000]"
                      : "bg-[#333] text-[#888]"
                  }`}
                >
                  {bundle.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/bundles/${bundle.id}/edit`}
                  className="text-[#888] hover:text-[#f5f5f0] font-mono text-sm uppercase mr-3 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteId(bundle.id)
                    setDeleteTitle(bundle.title)
                  }}
                  className="text-[#dc2626] font-mono text-sm uppercase transition-colors hover:text-[#ef4444]"
                >
                  Delete
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >
        <DialogContent className="bg-[#111] border border-[#333]">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase">
              Delete Bundle
            </DialogTitle>
            <DialogDescription className="text-[#888] font-sans">
              This will permanently remove &quot;{deleteTitle}&quot;. This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent border-[#333]">
            <button
              type="button"
              onClick={() => setDeleteId(null)}
              className="font-mono text-sm text-[#888] uppercase px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-[#dc2626] text-white font-mono text-sm uppercase px-4 py-2 rounded-none"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
