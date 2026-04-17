"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getMediaAssets } from "@/actions/admin-media"
import { MediaTile } from "./media-tile"
import type { mediaAssets } from "@/db/schema"

type MediaAsset = typeof mediaAssets.$inferSelect

interface MediaPickerDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (asset: { id: string; url: string; alt: string }) => void
  typeFilter?: "image" | "audio" | "video"
}

export function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  typeFilter,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaAsset[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchMedia = useCallback(async () => {
    if (!open) return
    setLoading(true)
    try {
      const result = await getMediaAssets({
        type: typeFilter || "all",
        search: search || undefined,
        page,
      })
      setItems(result.items)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.error("Failed to load media:", err)
    } finally {
      setLoading(false)
    }
  }, [open, typeFilter, search, page])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  useEffect(() => {
    if (open) {
      setSelectedId(null)
      setSearch("")
      setPage(1)
    }
  }, [open])

  const selectedAsset = items.find((i) => i.id === selectedId) || null

  const handleConfirm = () => {
    if (selectedAsset) {
      onSelect({ id: selectedAsset.id, url: selectedAsset.url, alt: selectedAsset.alt || "" })
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-[#0a0a0a] border border-[#222222] sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[#f5f5f0] font-mono uppercase tracking-wider">
            Select Media
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]"
          />
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans pl-9 pr-3 py-2 outline-none focus:border-[#f5f5f0]"
          />
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto min-h-[300px]">
          {loading ? (
            <div className="text-center py-12 text-[#555555] font-mono text-sm">
              Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#555555] font-sans text-[13px]">
                No media found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1 p-1">
              {items.map((asset) => (
                <MediaTile
                  key={asset.id}
                  asset={asset}
                  selected={selectedId === asset.id}
                  onSelect={() => setSelectedId(asset.id)}
                  onDoubleClick={() => {
                    onSelect({
                      id: asset.id,
                      url: asset.url,
                      alt: asset.alt || "",
                    })
                    onClose()
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 text-[#888888] disabled:text-[#333333]"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-[11px] text-[#888888]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 text-[#888888] disabled:text-[#333333]"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <DialogFooter className="bg-transparent border-0 p-0 flex-row gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedAsset}
            className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
          >
            Select
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
