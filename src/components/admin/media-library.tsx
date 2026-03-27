"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Grid3x3,
  List,
  Search,
  Upload,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { getMediaAssets } from "@/actions/admin-media"
import { MediaTile } from "./media-tile"
import { MediaUploadZone } from "./media-upload-zone"
import { MediaDetailSheet } from "./media-detail-sheet"
import type { mediaAssets } from "@/db/schema"

type MediaAsset = typeof mediaAssets.$inferSelect

const TYPE_TABS = [
  { label: "All", value: "all" },
  { label: "Images", value: "image" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
] as const

export function MediaLibrary() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [typeFilter, setTypeFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<MediaAsset[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMediaAssets({
        type: typeFilter,
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
  }, [typeFilter, search, page])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [typeFilter, search])

  const selectedAsset = items.find((i) => i.id === selectedId) || null

  const handleSelect = (asset: MediaAsset) => {
    setSelectedId(asset.id)
    setSheetOpen(true)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <MediaUploadZone onUploadComplete={fetchMedia} />

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setTypeFilter(tab.value)}
              className={`font-mono text-[13px] uppercase tracking-wider px-3 py-1.5 transition-colors ${
                typeFilter === tab.value
                  ? "bg-[#f5f5f0] text-[#000000]"
                  : "text-[#888888] hover:text-[#f5f5f0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]"
            />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans pl-9 pr-3 py-1.5 outline-none focus:border-[#f5f5f0] w-48"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`p-1.5 ${
                view === "grid" ? "text-[#f5f5f0]" : "text-[#555555]"
              }`}
              title="Grid view"
            >
              <Grid3x3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-1.5 ${
                view === "list" ? "text-[#f5f5f0]" : "text-[#555555]"
              }`}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-[#555555] font-mono text-sm">
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Upload size={32} className="mx-auto text-[#333333]" />
          <p className="font-mono text-[15px] text-[#f5f5f0] uppercase tracking-wider">
            Media Library Empty
          </p>
          <p className="text-[13px] text-[#555555] font-sans">
            Upload images, audio, and video to use across your site.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-1">
          {items.map((asset) => (
            <MediaTile
              key={asset.id}
              asset={asset}
              selected={selectedId === asset.id}
              onSelect={() => handleSelect(asset)}
            />
          ))}
        </div>
      ) : (
        <div className="border border-[#222222]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#222222]">
                <th className="text-left font-mono text-[13px] font-bold uppercase tracking-wider text-[#555555] px-3 py-2">
                  File
                </th>
                <th className="text-left font-mono text-[13px] font-bold uppercase tracking-wider text-[#555555] px-3 py-2 hidden sm:table-cell">
                  Type
                </th>
                <th className="text-left font-mono text-[13px] font-bold uppercase tracking-wider text-[#555555] px-3 py-2 hidden sm:table-cell">
                  Size
                </th>
                <th className="text-left font-mono text-[13px] font-bold uppercase tracking-wider text-[#555555] px-3 py-2 hidden md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((asset, i) => (
                <tr
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={`border-b border-[#111111] cursor-pointer hover:bg-[#111111] transition-colors ${
                    i % 2 === 1 ? "bg-[#0a0a0a]" : "bg-[#000000]"
                  } ${selectedId === asset.id ? "bg-[#111111]" : ""}`}
                >
                  <td className="px-3 py-2 text-[15px] text-[#f5f5f0] font-sans truncate max-w-[200px]">
                    {asset.filename}
                  </td>
                  <td className="px-3 py-2 text-[13px] text-[#888888] font-sans hidden sm:table-cell">
                    {asset.mimeType.split("/")[0]}
                  </td>
                  <td className="px-3 py-2 text-[13px] text-[#888888] font-sans hidden sm:table-cell">
                    {formatBytes(asset.size)}
                  </td>
                  <td className="px-3 py-2 text-[13px] text-[#888888] font-sans hidden md:table-cell">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 text-[#888888] disabled:text-[#333333]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-mono text-[13px] text-[#888888]">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 text-[#888888] disabled:text-[#333333]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail sheet */}
      <MediaDetailSheet
        asset={selectedAsset}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onDeleted={fetchMedia}
      />
    </div>
  )
}
