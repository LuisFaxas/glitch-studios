"use client"

import { useState } from "react"
import Image from "next/image"
import { AudioLines, Video, Copy, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { deleteMedia, updateMediaAlt } from "@/actions/admin-media"
import type { mediaAssets } from "@/db/schema"

type MediaAsset = typeof mediaAssets.$inferSelect

interface MediaDetailSheetProps {
  asset: MediaAsset | null
  open: boolean
  onClose: () => void
  onDeleted: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaDetailSheet({
  asset,
  open,
  onClose,
  onDeleted,
}: MediaDetailSheetProps) {
  const [altText, setAltText] = useState(asset?.alt || "")
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (!asset) return null

  const isImage = asset.mimeType.startsWith("image/")
  const isAudio = asset.mimeType.startsWith("audio/")
  const isVideo = asset.mimeType.startsWith("video/")

  const handleSaveAlt = async () => {
    try {
      await updateMediaAlt(asset.id, altText)
      toast.success("Alt text updated")
    } catch {
      toast.error("Failed to update alt text")
    }
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(asset.url)
    toast.success("URL copied to clipboard")
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteMedia(asset.id)
      toast.success("File deleted")
      setDeleteConfirm(false)
      onClose()
      onDeleted()
    } catch {
      toast.error("Failed to delete file")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side="right" className="bg-[#0a0a0a] border-[#222222] w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="p-4">
            <SheetTitle className="text-[#f5f5f0] font-mono text-sm uppercase tracking-wider truncate">
              {asset.filename}
            </SheetTitle>
            <SheetDescription className="text-[#555555] text-[13px]">
              {asset.mimeType}
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 space-y-4">
            {/* Preview */}
            <div className="bg-[#111111] aspect-video flex items-center justify-center overflow-hidden relative">
              {isImage ? (
                <Image
                  src={asset.url}
                  alt={asset.alt || asset.filename}
                  fill
                  className="object-contain"
                  sizes="400px"
                />
              ) : isAudio ? (
                <AudioLines size={48} className="text-[#555555]" />
              ) : isVideo ? (
                <Video size={48} className="text-[#555555]" />
              ) : (
                <span className="text-[#555555] font-mono text-sm">
                  No preview
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#555555]">Size</span>
                <span className="text-[#888888]">
                  {formatBytes(asset.size)}
                </span>
              </div>
              {asset.width && asset.height && (
                <div className="flex justify-between">
                  <span className="text-[#555555]">Dimensions</span>
                  <span className="text-[#888888]">
                    {asset.width} x {asset.height}
                  </span>
                </div>
              )}
              {asset.duration && (
                <div className="flex justify-between">
                  <span className="text-[#555555]">Duration</span>
                  <span className="text-[#888888]">
                    {Math.floor(asset.duration / 60)}:
                    {String(asset.duration % 60).padStart(2, "0")}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#555555]">Uploaded</span>
                <span className="text-[#888888]">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Alt text */}
            <div className="space-y-1">
              <label className="text-[13px] font-mono text-[#555555] uppercase tracking-wider">
                Alt Text
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                onBlur={handleSaveAlt}
                placeholder="Describe this media..."
                className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[15px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center gap-2 bg-[#111111] border border-[#222222] text-[#888888] font-mono text-[13px] uppercase px-4 py-2 hover:text-[#f5f5f0] transition-colors"
              >
                <Copy size={14} />
                Copy URL
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 bg-[#111111] border border-[#222222] text-[#dc2626] font-mono text-[13px] uppercase px-4 py-2 hover:bg-[#dc2626] hover:text-[#f5f5f0] transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteConfirm}
        onOpenChange={(o) => !o && setDeleteConfirm(false)}
      >
        <DialogContent className="bg-[#111111] border border-[#222222] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f0] font-mono uppercase">
              Delete File
            </DialogTitle>
            <DialogDescription className="text-[#888888] text-[15px] font-sans">
              This file may be in use on your site. Removing it will break any
              pages referencing it. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent border-0 p-0 flex-row gap-2">
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-[#dc2626] text-[#f5f5f0] font-mono text-[13px] uppercase px-6 py-2 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
