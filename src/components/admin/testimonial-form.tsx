"use client"

import { useState, useTransition } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { MediaPickerDialog } from "./media-picker-dialog"
import { createTestimonial, updateTestimonial } from "@/actions/admin-content"

const SERVICE_TYPE_OPTIONS = [
  { value: "", label: "Select service type" },
  { value: "general", label: "General" },
  { value: "studio_session", label: "Studio Session" },
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "video_production", label: "Video Production" },
  { value: "sfx", label: "SFX" },
  { value: "graphic_design", label: "Graphic Design" },
] as const

const testimonialSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters"),
  clientTitle: z.string().nullable(),
  quote: z
    .string()
    .min(20, "Quote must be at least 20 characters")
    .max(500, "Max 500 characters"),
  serviceType: z.string().nullable(),
  rating: z.number().int().min(1).max(5).nullable(),
  avatarUrl: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
})

interface TestimonialData {
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

export function TestimonialForm({
  testimonial,
  onSaved,
  onCancel,
}: {
  testimonial?: TestimonialData
  onSaved?: () => void
  onCancel?: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  const [clientName, setClientName] = useState(testimonial?.clientName ?? "")
  const [clientTitle, setClientTitle] = useState(testimonial?.clientTitle ?? "")
  const [quote, setQuote] = useState(testimonial?.quote ?? "")
  const [serviceType, setServiceType] = useState(
    testimonial?.serviceType ?? ""
  )
  const [ratingStr, setRatingStr] = useState(
    testimonial?.rating?.toString() ?? ""
  )
  const [avatarUrl, setAvatarUrl] = useState(testimonial?.avatarUrl ?? "")
  const [isActive, setIsActive] = useState(testimonial?.isActive ?? true)
  const [sortOrder, setSortOrder] = useState(testimonial?.sortOrder ?? 0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const rating = ratingStr ? parseInt(ratingStr) : null

    const data = {
      clientName,
      clientTitle: clientTitle || null,
      quote,
      serviceType: serviceType || null,
      rating,
      avatarUrl: avatarUrl || null,
      isActive,
      sortOrder,
    }

    const result = testimonialSchema.safeParse(data)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString()
        if (key) fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    startTransition(async () => {
      try {
        if (testimonial) {
          await updateTestimonial(testimonial.id, result.data)
          toast.success("Testimonial updated")
        } else {
          await createTestimonial(result.data)
          toast.success("Testimonial created")
        }
        onSaved?.()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save")
      }
    })
  }

  const inputClass =
    "w-full bg-[#111111] border border-[#222222] text-[#f5f5f0] text-[13px] font-sans px-3 py-2 outline-none focus:border-[#f5f5f0]"
  const labelClass =
    "block font-mono text-[11px] uppercase tracking-wider text-[#888888] mb-1"
  const errorClass = "text-[#ff4444] font-sans text-[11px] mt-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Client Name */}
      <div>
        <label className={labelClass}>Client Name</label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Client name"
          className={inputClass}
        />
        {errors.clientName && (
          <p className={errorClass}>{errors.clientName}</p>
        )}
      </div>

      {/* Client Title */}
      <div>
        <label className={labelClass}>Client Title</label>
        <input
          type="text"
          value={clientTitle}
          onChange={(e) => setClientTitle(e.target.value)}
          placeholder="CEO, Artist, etc."
          className={inputClass}
        />
      </div>

      {/* Quote */}
      <div>
        <label className={labelClass}>Quote</label>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Testimonial quote..."
          rows={4}
          maxLength={500}
          className={inputClass}
        />
        <p className="text-[#555555] font-sans text-[11px] mt-1">
          {quote.length}/500
        </p>
        {errors.quote && <p className={errorClass}>{errors.quote}</p>}
      </div>

      {/* Service Type */}
      <div>
        <label className={labelClass}>Service Type</label>
        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          className={inputClass}
        >
          {SERVICE_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label className={labelClass}>Rating (1-5)</label>
        <input
          type="number"
          value={ratingStr}
          onChange={(e) => setRatingStr(e.target.value)}
          placeholder="5"
          min={1}
          max={5}
          className={`${inputClass} w-24`}
        />
        {errors.rating && <p className={errorClass}>{errors.rating}</p>}
      </div>

      {/* Avatar */}
      <div>
        <label className={labelClass}>Photo</label>
        <div className="flex items-center gap-4">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt={clientName}
              className="w-12 h-12 rounded-full object-cover border border-[#222222]"
            />
          )}
          <button
            type="button"
            onClick={() => setMediaPickerOpen(true)}
            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-4 py-2"
          >
            {avatarUrl ? "Change" : "Select Photo"}
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={() => setAvatarUrl("")}
              className="font-mono text-[11px] uppercase text-[#ff4444]"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? "bg-[#f5f5f0]" : "bg-[#333333]"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform ${isActive ? "translate-x-5 bg-[#000000]" : "translate-x-0 bg-[#888888]"}`}
          />
        </button>
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#888888]">
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Display Order */}
      <div>
        <label className={labelClass}>Display Order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
          min={0}
          className={`${inputClass} w-24`}
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Media Picker */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset) => {
          setAvatarUrl(asset.url)
        }}
        typeFilter="image"
      />
    </form>
  )
}
