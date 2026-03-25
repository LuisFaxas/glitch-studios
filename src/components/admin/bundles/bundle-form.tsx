"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createBundle,
  updateBundle,
  deleteBundle,
} from "@/actions/admin-bundles"
import { UploadZone } from "@/components/admin/beats/upload-zone"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface AvailableBeat {
  id: string
  title: string
  lowestPrice: number
}

interface BundleWithBeats {
  id: string
  title: string
  description: string | null
  discountPercent: number
  isActive: boolean | null
  beatIds: string[]
}

interface BundleFormProps {
  bundle?: BundleWithBeats
  mode: "create" | "edit"
  availableBeats: AvailableBeat[]
}

const inputClass =
  "w-full bg-[#111] border border-[#333] text-[#f5f5f0] px-3 py-2 rounded-none font-sans text-[15px] focus:border-[#f5f5f0] outline-none"

export function BundleForm({ bundle, mode, availableBeats }: BundleFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [title, setTitle] = useState(bundle?.title ?? "")
  const [description, setDescription] = useState(bundle?.description ?? "")
  const [discountPercent, setDiscountPercent] = useState(
    bundle?.discountPercent ?? 20
  )
  const [coverArtKey, setCoverArtKey] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(bundle?.isActive ?? true)
  const [selectedBeatIds, setSelectedBeatIds] = useState<Set<string>>(
    new Set(bundle?.beatIds ?? [])
  )

  function toggleBeat(beatId: string) {
    const next = new Set(selectedBeatIds)
    if (next.has(beatId)) {
      next.delete(beatId)
    } else {
      next.add(beatId)
    }
    setSelectedBeatIds(next)
  }

  // Price preview
  const selectedBeats = availableBeats.filter((b) =>
    selectedBeatIds.has(b.id)
  )
  const originalTotal = selectedBeats.reduce(
    (sum, b) => sum + b.lowestPrice,
    0
  )
  const discountedTotal =
    originalTotal * (1 - discountPercent / 100)

  const minBeatsValid = selectedBeatIds.size >= 2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!minBeatsValid) return

    setSaving(true)
    try {
      const data = {
        title,
        description,
        discountPercent,
        coverArtKey,
        isActive,
        beatIds: Array.from(selectedBeatIds),
      }

      if (mode === "edit" && bundle) {
        await updateBundle(bundle.id, data)
        toast.success("Bundle updated")
      } else {
        await createBundle(data)
        toast.success("Bundle created")
      }
      router.push("/admin/bundles")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save bundle"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!bundle) return
    try {
      await deleteBundle(bundle.id)
      toast.success("Bundle deleted")
      router.push("/admin/bundles")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete bundle"
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[640px]">
      {/* Name */}
      <div>
        <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
          Name
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Discount Percentage */}
      <div>
        <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
          Discount Percentage
        </label>
        <div className="relative w-32">
          <input
            type="number"
            min={1}
            max={99}
            value={discountPercent}
            onChange={(e) =>
              setDiscountPercent(parseInt(e.target.value) || 0)
            }
            required
            className={`${inputClass} pr-7`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-[14px]">
            %
          </span>
        </div>
      </div>

      {/* Cover Art */}
      <UploadZone
        label="Cover Art"
        accept="image/*"
        currentKey={coverArtKey}
        onUploadComplete={setCoverArtKey}
      />

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive ?? false}
          onChange={(e) => setIsActive(e.target.checked)}
          className="w-4 h-4 accent-[#f5f5f0]"
        />
        <label
          htmlFor="isActive"
          className="font-mono text-[13px] text-[#ccc] uppercase tracking-wider"
        >
          Active
        </label>
      </div>

      {/* Beat Picker */}
      <div>
        <p className="font-mono text-[11px] text-[#888] uppercase tracking-wider mb-3">
          Beats in Bundle (minimum 2)
        </p>

        {/* Selected beats */}
        {selectedBeats.length > 0 && (
          <div className="space-y-1 mb-3">
            {selectedBeats.map((beat) => (
              <div
                key={beat.id}
                className="flex items-center justify-between bg-[#1a1a1a] px-3 py-2 border border-[#333]"
              >
                <span className="text-[#f5f5f0] font-sans text-[14px]">
                  {beat.title}
                </span>
                <button
                  type="button"
                  onClick={() => toggleBeat(beat.id)}
                  className="text-[#dc2626] font-mono text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Available beats */}
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {availableBeats
            .filter((b) => !selectedBeatIds.has(b.id))
            .map((beat) => (
              <label
                key={beat.id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-[#1a1a1a] cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => toggleBeat(beat.id)}
                  className="w-4 h-4 accent-[#f5f5f0]"
                />
                <span className="text-[#ccc] font-sans text-[14px]">
                  {beat.title}
                </span>
                {beat.lowestPrice > 0 && (
                  <span className="text-[#666] font-mono text-[12px] ml-auto">
                    ${beat.lowestPrice.toFixed(2)}
                  </span>
                )}
              </label>
            ))}
          {availableBeats.length === 0 && (
            <p className="text-[#666] font-sans text-sm py-2">
              No published beats available.
            </p>
          )}
        </div>

        {!minBeatsValid && selectedBeatIds.size > 0 && (
          <p className="text-red-500 text-[11px] mt-1">
            A bundle requires at least 2 beats.
          </p>
        )}
      </div>

      {/* Bundle Price Preview */}
      {selectedBeats.length >= 2 && originalTotal > 0 && (
        <div className="bg-[#1a1a1a] border border-[#333] px-4 py-3">
          <p className="font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
            Price Preview
          </p>
          <p className="font-sans text-[15px] text-[#f5f5f0]">
            Original: ${originalTotal.toFixed(2)} / Bundle: $
            {discountedTotal.toFixed(2)}{" "}
            <span className="text-[#888]">({discountPercent}% off)</span>
          </p>
        </div>
      )}

      {/* Save Button */}
      <button
        type="submit"
        disabled={saving || !minBeatsValid}
        className={`bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-8 py-3 rounded-none w-full ${
          saving || !minBeatsValid ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {saving ? "Saving..." : "Save Bundle"}
      </button>

      {/* Delete Button (edit mode) */}
      {mode === "edit" && bundle && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="text-[#dc2626] font-mono text-sm uppercase w-full text-center mt-2"
          >
            Delete Bundle
          </button>
          <DialogContent className="bg-[#111] border border-[#333]">
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f0] font-mono uppercase">
                Delete Bundle
              </DialogTitle>
              <DialogDescription className="text-[#888] font-sans">
                This will permanently remove &quot;{bundle.title}&quot;. This
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="bg-transparent border-[#333]">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
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
      )}
    </form>
  )
}
