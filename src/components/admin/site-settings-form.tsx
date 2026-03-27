"use client"

import { useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { updateSettings } from "@/actions/admin-settings"

const settingsSchema = z.object({
  studio_name: z.string().min(2, "Studio name must be at least 2 characters"),
  studio_tagline: z.string().max(100, "Tagline max 100 characters").optional().default(""),
  studio_about: z.string().max(2000, "About text max 2000 characters").optional().default(""),
  contact_email: z.string().email("Valid email required"),
  contact_phone: z.string().optional().default(""),
  contact_address: z.string().max(300, "Address max 300 characters").optional().default(""),
  social_instagram: z.string().url("Must be a valid URL").or(z.literal("")).optional().default(""),
  social_youtube: z.string().url("Must be a valid URL").or(z.literal("")).optional().default(""),
  social_soundcloud: z.string().url("Must be a valid URL").or(z.literal("")).optional().default(""),
  social_twitter: z.string().url("Must be a valid URL").or(z.literal("")).optional().default(""),
})

interface SiteSettingsFormProps {
  initialSettings: Record<string, string | null>
}

export function SiteSettingsForm({ initialSettings }: SiteSettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>({
    studio_name: initialSettings.studio_name || "",
    studio_tagline: initialSettings.studio_tagline || "",
    studio_about: initialSettings.studio_about || "",
    contact_email: initialSettings.contact_email || "",
    contact_phone: initialSettings.contact_phone || "",
    contact_address: initialSettings.contact_address || "",
    social_instagram: initialSettings.social_instagram || "",
    social_youtube: initialSettings.social_youtube || "",
    social_soundcloud: initialSettings.social_soundcloud || "",
    social_twitter: initialSettings.social_twitter || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = settingsSchema.safeParse(values)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as string
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setSaving(true)
    try {
      const res = await updateSettings(result.data)
      if (res.success) {
        toast.success("Settings saved")
      } else {
        toast.error(res.error || "Failed to save")
      }
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    "w-full rounded-none border border-[#333] bg-[#000] px-3 py-2 font-mono text-sm text-[#f5f5f0] placeholder:text-[#444] outline-none focus:border-[#f5f5f0]"
  const textareaClass =
    "w-full rounded-none border border-[#333] bg-[#000] px-3 py-2 font-mono text-sm text-[#f5f5f0] placeholder:text-[#444] outline-none focus:border-[#f5f5f0] resize-y"

  function FieldError({ field }: { field: string }) {
    if (!errors[field]) return null
    return (
      <span className="mt-0.5 font-mono text-[10px] text-[#dc2626]">
        {errors[field]}
      </span>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* STUDIO INFO */}
      <section>
        <h2 className="mb-4 font-mono text-[28px] font-bold uppercase">
          Studio Info
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              Studio Name *
            </label>
            <input
              type="text"
              value={values.studio_name}
              onChange={(e) => handleChange("studio_name", e.target.value)}
              placeholder="Glitch Studios"
              className={inputClass}
              required
            />
            <FieldError field="studio_name" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              Tagline
            </label>
            <input
              type="text"
              value={values.studio_tagline}
              onChange={(e) => handleChange("studio_tagline", e.target.value)}
              placeholder="Music & video production"
              className={inputClass}
              maxLength={100}
            />
            <FieldError field="studio_tagline" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              About Text
            </label>
            <textarea
              value={values.studio_about}
              onChange={(e) => handleChange("studio_about", e.target.value)}
              placeholder="Studio description..."
              className={textareaClass}
              rows={4}
              maxLength={2000}
            />
            <FieldError field="studio_about" />
          </div>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section>
        <h2 className="mb-4 font-mono text-[28px] font-bold uppercase">
          Contact Info
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              Email *
            </label>
            <input
              type="email"
              value={values.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="contact@glitchstudios.com"
              className={inputClass}
              required
            />
            <FieldError field="contact_email" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              Phone
            </label>
            <input
              type="text"
              value={values.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              placeholder="(555) 555-5555"
              className={inputClass}
            />
            <FieldError field="contact_phone" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              Address
            </label>
            <textarea
              value={values.contact_address}
              onChange={(e) => handleChange("contact_address", e.target.value)}
              placeholder="Studio address..."
              className={textareaClass}
              rows={2}
              maxLength={300}
            />
            <FieldError field="contact_address" />
          </div>
        </div>
      </section>

      {/* SOCIAL LINKS */}
      <section>
        <h2 className="mb-4 font-mono text-[28px] font-bold uppercase">
          Social Links
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              Instagram URL
            </label>
            <input
              type="text"
              value={values.social_instagram}
              onChange={(e) => handleChange("social_instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className={inputClass}
            />
            <FieldError field="social_instagram" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              YouTube URL
            </label>
            <input
              type="text"
              value={values.social_youtube}
              onChange={(e) => handleChange("social_youtube", e.target.value)}
              placeholder="https://youtube.com/..."
              className={inputClass}
            />
            <FieldError field="social_youtube" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              SoundCloud URL
            </label>
            <input
              type="text"
              value={values.social_soundcloud}
              onChange={(e) =>
                handleChange("social_soundcloud", e.target.value)
              }
              placeholder="https://soundcloud.com/..."
              className={inputClass}
            />
            <FieldError field="social_soundcloud" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-xs uppercase text-[#888]">
              X/Twitter URL
            </label>
            <input
              type="text"
              value={values.social_twitter}
              onChange={(e) => handleChange("social_twitter", e.target.value)}
              placeholder="https://x.com/..."
              className={inputClass}
            />
            <FieldError field="social_twitter" />
          </div>
        </div>
      </section>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="rounded-none border border-[#f5f5f0] bg-[#f5f5f0] px-6 py-2 font-mono text-sm font-bold uppercase text-[#000] transition-colors hover:bg-transparent hover:text-[#f5f5f0] disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  )
}
