"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteBeat } from "@/actions/admin-beats"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface BeatRow {
  id: string
  title: string
  bpm: number
  key: string
  genre: string
  status: "draft" | "published" | "sold_exclusive" | null
}

interface AdminBeatTableProps {
  beats: BeatRow[]
}

const statusStyles: Record<string, string> = {
  draft: "bg-[#333] text-[#888]",
  published: "bg-[#f5f5f0] text-[#000]",
  sold_exclusive: "bg-[#555] text-[#f5f5f0]",
}

const statusLabels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  sold_exclusive: "Sold",
}

export function AdminBeatTable({ beats }: AdminBeatTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState("")

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteBeat(deleteId)
      toast.success("Beat deleted")
      setDeleteId(null)
      router.refresh()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete beat"
      )
    }
  }

  if (beats.length === 0) {
    return (
      <p className="text-[#888] font-sans text-center py-12">
        No beats yet. Create your first beat.
      </p>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="border-[#333]">
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Title
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              BPM
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Key
            </TableHead>
            <TableHead className="text-[#888] font-mono text-[11px] uppercase">
              Genre
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
          {beats.map((beat) => (
            <TableRow key={beat.id} className="border-[#333]">
              <TableCell className="text-[#f5f5f0] font-sans">
                {beat.title}
              </TableCell>
              <TableCell className="text-[#ccc] font-mono text-sm">
                {beat.bpm}
              </TableCell>
              <TableCell className="text-[#ccc] font-sans text-sm">
                {beat.key}
              </TableCell>
              <TableCell className="text-[#ccc] font-sans text-sm">
                {beat.genre}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block px-2 py-0.5 text-[11px] font-mono uppercase ${
                    statusStyles[beat.status ?? "draft"]
                  }`}
                >
                  {statusLabels[beat.status ?? "draft"]}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/admin/beats/${beat.id}/edit`}
                  className="text-[#888] hover:text-[#f5f5f0] font-mono text-sm uppercase mr-3 transition-colors"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteId(beat.id)
                    setDeleteTitle(beat.title)
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
              Delete Beat
            </DialogTitle>
            <DialogDescription className="text-[#888] font-sans">
              This will permanently remove &quot;{deleteTitle}&quot; and all
              associated files. This cannot be undone.
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
