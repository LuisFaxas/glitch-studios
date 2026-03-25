"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBeat, updateBeat, deleteBeat } from "@/actions/admin-beats"
import { UploadZone } from "@/components/admin/beats/upload-zone"
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
import { LICENSE_TIER_DISPLAY, type LicenseTier } from "@/types/beats"

const MUSICAL_KEYS = [
  "C major", "C minor", "C# major", "C# minor",
  "D major", "D minor", "D# major", "D# minor",
  "E major", "E minor",
  "F major", "F minor", "F# major", "F# minor",
  "G major", "G minor", "G# major", "G# minor",
  "A major", "A minor", "A# major", "A# minor",
  "B major", "B minor",
]

const TIER_KEYS: LicenseTier[] = [
  "mp3_lease",
  "wav_lease",
  "stems",
  "unlimited",
  "exclusive",
]

interface BeatWithPricingAndProducers {
  id: string
  title: string
  bpm: number
  key: string
  genre: string
  moods: string[] | null
  description: string | null
  coverArtKey: string | null
  previewAudioKey: string | null
  wavFileKey: string | null
  stemsZipKey: string | null
  midiFileKey: string | null
  status: "draft" | "published" | "sold_exclusive"
  pricing: { tier: string; price: string; isActive: boolean | null }[]
  producers: { name: string; splitPercent: number }[]
}

interface BeatFormProps {
  beat?: BeatWithPricingAndProducers
  mode: "create" | "edit"
}

const inputClass =
  "w-full bg-[#111] border border-[#333] text-[#f5f5f0] px-3 py-2 rounded-none font-sans text-[15px] focus:border-[#f5f5f0] outline-none"

export function BeatForm({ beat, mode }: BeatFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState(beat?.title ?? "")
  const [bpm, setBpm] = useState(beat?.bpm ?? 140)
  const [key, setKey] = useState(beat?.key ?? "C minor")
  const [genre, setGenre] = useState(beat?.genre ?? "")
  const [moodsText, setMoodsText] = useState(
    beat?.moods?.join(", ") ?? ""
  )
  const [description, setDescription] = useState(beat?.description ?? "")
  const [status, setStatus] = useState<"draft" | "published">(
    beat?.status === "sold_exclusive" ? "published" : (beat?.status ?? "draft")
  )

  // File keys
  const [coverArtKey, setCoverArtKey] = useState(beat?.coverArtKey ?? null)
  const [previewAudioKey, setPreviewAudioKey] = useState(
    beat?.previewAudioKey ?? null
  )
  const [wavFileKey, setWavFileKey] = useState(beat?.wavFileKey ?? null)
  const [stemsZipKey, setStemsZipKey] = useState(beat?.stemsZipKey ?? null)
  const [midiFileKey, setMidiFileKey] = useState(beat?.midiFileKey ?? null)

  // Pricing
  const [pricing, setPricing] = useState<Record<LicenseTier, string>>(() => {
    const defaults: Record<LicenseTier, string> = {
      mp3_lease: "",
      wav_lease: "",
      stems: "",
      unlimited: "",
      exclusive: "",
    }
    if (beat?.pricing) {
      for (const p of beat.pricing) {
        defaults[p.tier as LicenseTier] = p.price
      }
    }
    return defaults
  })

  // Producers
  const [producers, setProducers] = useState<
    { name: string; splitPercent: string }[]
  >(
    beat?.producers?.map((p) => ({
      name: p.name,
      splitPercent: String(p.splitPercent),
    })) ?? []
  )

  const splitTotal = producers.reduce(
    (sum, p) => sum + (parseInt(p.splitPercent) || 0),
    0
  )
  const splitValid = producers.length === 0 || splitTotal === 100

  function addProducer() {
    setProducers([...producers, { name: "", splitPercent: "" }])
  }

  function removeProducer(index: number) {
    setProducers(producers.filter((_, i) => i !== index))
  }

  function updateProducer(
    index: number,
    field: "name" | "splitPercent",
    value: string
  ) {
    setProducers(
      producers.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!splitValid) return

    setSaving(true)
    try {
      const moods = moodsText
        .split(",")
        .map((m) => m.trim())
        .filter(Boolean)

      const data = {
        title,
        bpm,
        key,
        genre,
        moods,
        description,
        coverArtKey,
        previewAudioKey,
        wavFileKey,
        stemsZipKey,
        midiFileKey,
        status,
        pricing: TIER_KEYS.filter((t) => pricing[t] !== "").map((t) => ({
          tier: t,
          price: parseFloat(pricing[t]) || 0,
        })),
        producers: producers
          .filter((p) => p.name.trim())
          .map((p) => ({
            name: p.name.trim(),
            splitPercent: parseInt(p.splitPercent) || 0,
          })),
      }

      if (mode === "edit" && beat) {
        await updateBeat(beat.id, data)
        toast.success("Beat updated")
      } else {
        await createBeat(data)
        toast.success("Beat created")
      }
      router.push("/admin/beats")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save beat"
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!beat) return
    try {
      await deleteBeat(beat.id)
      toast.success("Beat deleted")
      router.push("/admin/beats")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete beat"
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-[640px]">
      {/* Title */}
      <div>
        <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* BPM & Key */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
            BPM
          </label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(parseInt(e.target.value) || 0)}
            min={1}
            max={999}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
            Key
          </label>
          <select
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={inputClass}
          >
            {MUSICAL_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Genre */}
      <div>
        <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
          Genre
        </label>
        <input
          type="text"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* Moods */}
      <div>
        <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
          Mood Tags (comma-separated)
        </label>
        <input
          type="text"
          value={moodsText}
          onChange={(e) => setMoodsText(e.target.value)}
          placeholder="dark, aggressive, energetic"
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

      {/* Upload Zones */}
      <div className="space-y-4">
        <p className="font-mono text-[11px] text-[#888] uppercase tracking-wider">
          Files
        </p>

        <UploadZone
          label="MP3 Preview"
          accept="audio/mpeg"
          currentKey={previewAudioKey}
          onUploadComplete={setPreviewAudioKey}
          subtitle="Must be watermarked before upload"
        />
        <UploadZone
          label="WAV Master"
          accept="audio/wav"
          currentKey={wavFileKey}
          onUploadComplete={setWavFileKey}
        />
        <UploadZone
          label="Stems ZIP"
          accept="application/zip"
          currentKey={stemsZipKey}
          onUploadComplete={setStemsZipKey}
        />
        <UploadZone
          label="MIDI Files"
          accept="audio/midi"
          currentKey={midiFileKey}
          onUploadComplete={setMidiFileKey}
        />
        <UploadZone
          label="Cover Art"
          accept="image/*"
          currentKey={coverArtKey}
          onUploadComplete={setCoverArtKey}
        />
      </div>

      {/* License Tier Pricing */}
      <div>
        <p className="font-mono text-[11px] text-[#888] uppercase tracking-wider mb-3">
          License Tier Pricing
        </p>
        <div className="space-y-2">
          {TIER_KEYS.map((tier) => (
            <div key={tier} className="flex items-center gap-3">
              <span className="font-sans text-[14px] text-[#ccc] w-28">
                {LICENSE_TIER_DISPLAY[tier]}
              </span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666] text-[14px]">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing[tier]}
                  onChange={(e) =>
                    setPricing({ ...pricing, [tier]: e.target.value })
                  }
                  placeholder="0.00"
                  className={`${inputClass} pl-7`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Co-producer Splits */}
      <div>
        <p className="font-mono text-[11px] text-[#888] uppercase tracking-wider mb-3">
          Co-producer Splits
        </p>
        <div className="space-y-2">
          {producers.map((producer, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={producer.name}
                onChange={(e) => updateProducer(i, "name", e.target.value)}
                placeholder="Producer name"
                className={`${inputClass} flex-1`}
              />
              <div className="relative w-24">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={producer.splitPercent}
                  onChange={(e) =>
                    updateProducer(i, "splitPercent", e.target.value)
                  }
                  placeholder="%"
                  className={`${inputClass} pr-7`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] text-[14px]">
                  %
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeProducer(i)}
                className="text-[#dc2626] font-mono text-sm px-2"
              >
                X
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addProducer}
          className="font-mono text-[13px] text-[#888] uppercase tracking-wider mt-2 hover:text-[#f5f5f0] transition-colors"
        >
          + Add co-producer
        </button>
        {producers.length > 0 && !splitValid && (
          <p className="text-red-500 text-[11px] mt-1">
            Split percentages must total 100% (currently {splitTotal}%)
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block font-mono text-[11px] text-[#888] uppercase tracking-wider mb-1">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "draft" | "published")}
          className={inputClass}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Save Button */}
      <button
        type="submit"
        disabled={saving || !splitValid}
        className={`bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-8 py-3 rounded-none w-full ${
          saving || !splitValid ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {saving ? "Saving..." : "Save Beat"}
      </button>

      {/* Delete Button (edit mode) */}
      {mode === "edit" && beat && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger
            render={
              <button
                type="button"
                className="text-[#dc2626] font-mono text-sm uppercase w-full text-center mt-2"
              />
            }
          >
            Delete Beat
          </DialogTrigger>
          <DialogContent className="bg-[#111] border border-[#333]">
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f0] font-mono uppercase">
                Delete Beat
              </DialogTitle>
              <DialogDescription className="text-[#888] font-sans">
                This will permanently remove &quot;{beat.title}&quot; and all
                associated files. This cannot be undone.
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
