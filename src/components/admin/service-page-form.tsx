"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { TiptapEditor, type TiptapEditorRef } from "./tiptap-editor"
import { MediaPickerDialog } from "./media-picker-dialog"
import { createService, updateService } from "@/actions/admin-services"
import Link from "next/link"

const SERVICE_TYPES = [
  { value: "studio_session", label: "Studio Session" },
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "video_production", label: "Video Production" },
  { value: "sfx", label: "SFX" },
  { value: "graphic_design", label: "Graphic Design" },
] as const

const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum([
    "studio_session",
    "mixing",
    "mastering",
    "video_production",
    "sfx",
    "graphic_design",
  ]),
  description: z.string().min(1, "Description is required"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(160, "Max 160 characters"),
  priceLabel: z.string().min(1, "Price label is required"),
  features: z.array(z.string()),
  ctaText: z.string().default("Book Now"),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

interface ServiceData {
  id: string
  name: string
  slug: string
  type: "studio_session" | "mixing" | "mastering" | "video_production" | "sfx" | "graphic_design"
  description: string
  shortDescription: string
  priceLabel: string
  features: string[] | null
  ctaText: string | null
  sortOrder: number | null
  isActive: boolean | null
  hasBookingConfig: boolean
}

export function ServicePageForm({
  service,
}: {
  service?: ServiceData
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const editorRef = useRef<TiptapEditorRef>(null)
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  const [name, setName] = useState(service?.name ?? "")
  const [slug, setSlug] = useState(service?.slug ?? "")
  const [type, setType] = useState(service?.type ?? "studio_session")
  const [description, setDescription] = useState(service?.description ?? "")
  const [shortDescription, setShortDescription] = useState(
    service?.shortDescription ?? ""
  )
  const [priceLabel, setPriceLabel] = useState(service?.priceLabel ?? "")
  const [featuresText, setFeaturesText] = useState(
    (service?.features ?? []).join("\n")
  )
  const [ctaText, setCtaText] = useState(service?.ctaText ?? "Book Now")
  const [sortOrder, setSortOrder] = useState(service?.sortOrder ?? 0)
  const [isActive, setIsActive] = useState(service?.isActive ?? true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const hasBookingConfig = service?.hasBookingConfig ?? false

  const handleNameChange = (val: string) => {
    setName(val)
    if (!service || !hasBookingConfig) {
      setSlug(slugify(val))
    }
  }

  const handleInsertImage = () => {
    setMediaPickerOpen(true)
  }

  const handleMediaSelect = (asset: { url: string; alt: string }) => {
    editorRef.current?.insertImage(asset.url, asset.alt)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const features = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean)

    const data = {
      name,
      slug,
      type,
      description,
      shortDescription,
      priceLabel,
      features,
      ctaText,
      sortOrder,
      isActive,
    }

    const result = serviceSchema.safeParse(data)
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
        if (service) {
          await updateService(service.id, result.data)
          toast.success("Service updated")
        } else {
          await createService(result.data)
          toast.success("Service created")
          router.push("/admin/services")
        }
        router.refresh()
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {/* Name */}
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Service name"
          className={inputClass}
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass}>Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="service-slug"
          disabled={hasBookingConfig}
          className={`${inputClass} ${hasBookingConfig ? "opacity-50 cursor-not-allowed" : ""}`}
        />
        {hasBookingConfig && (
          <p className="text-[#888888] font-sans text-[11px] mt-1">
            Slug locked — this service has booking configuration
          </p>
        )}
        {errors.slug && <p className={errorClass}>{errors.slug}</p>}
      </div>

      {/* Short Description */}
      <div>
        <label className={labelClass}>Short Description</label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="Brief description for cards"
          maxLength={160}
          className={inputClass}
        />
        <p className="text-[#555555] font-sans text-[11px] mt-1">
          {shortDescription.length}/160
        </p>
        {errors.shortDescription && (
          <p className={errorClass}>{errors.shortDescription}</p>
        )}
      </div>

      {/* Full Description (Tiptap) */}
      <div>
        <label className={labelClass}>Full Description</label>
        <TiptapEditor
          ref={editorRef}
          content={description}
          onChange={setDescription}
          placeholder="Detailed service description..."
          onInsertImage={handleInsertImage}
        />
        {errors.description && (
          <p className={errorClass}>{errors.description}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className={labelClass}>Service Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ServiceData["type"])}
          className={inputClass}
        >
          {SERVICE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {errors.type && <p className={errorClass}>{errors.type}</p>}
      </div>

      {/* Price Label */}
      <div>
        <label className={labelClass}>Price Label</label>
        <input
          type="text"
          value={priceLabel}
          onChange={(e) => setPriceLabel(e.target.value)}
          placeholder="$0.00/hr"
          className={inputClass}
        />
        {errors.priceLabel && (
          <p className={errorClass}>{errors.priceLabel}</p>
        )}
      </div>

      {/* Features */}
      <div>
        <label className={labelClass}>Features (one per line)</label>
        <textarea
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          placeholder={"Feature 1\nFeature 2\nFeature 3"}
          rows={4}
          className={inputClass}
        />
      </div>

      {/* CTA Text */}
      <div>
        <label className={labelClass}>CTA Text</label>
        <input
          type="text"
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          placeholder="Call to action text"
          className={inputClass}
        />
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

      {/* Booking Config Link */}
      {service && hasBookingConfig && (
        <div className="border border-[#222222] p-4">
          <Link
            href={`/admin/services/${service.id}/booking-config`}
            className="font-mono text-[13px] text-[#f5f5f0] uppercase tracking-wider hover:underline"
          >
            Booking Configuration &rarr;
          </Link>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/services")}
          className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
        >
          Cancel
        </button>
      </div>

      {/* Media Picker for Tiptap image insertion */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        typeFilter="image"
      />
    </form>
  )
}
