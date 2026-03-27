"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { toast } from "sonner"
import { MediaPickerDialog } from "./media-picker-dialog"
import { createTeamMember, updateTeamMember } from "@/actions/admin-content"

const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  bio: z
    .string()
    .min(20, "Bio must be at least 20 characters")
    .max(1000, "Max 1000 characters"),
  photoUrl: z.string().nullable(),
  credits: z.string().nullable(),
  featuredTrackUrl: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  instagram: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  youtube: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  soundcloud: z
    .string()
    .url("Must be a valid URL")
    .nullable()
    .or(z.literal("")),
  sortOrder: z.number().int().min(0),
})

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

interface TeamMemberData {
  id: string
  name: string
  slug: string
  role: string
  bio: string
  photoUrl: string | null
  socialLinks: string | null
  credits: string | null
  featuredTrackUrl: string | null
  sortOrder: number | null
}

function parseSocialLinks(json: string | null): {
  instagram: string
  youtube: string
  soundcloud: string
} {
  if (!json) return { instagram: "", youtube: "", soundcloud: "" }
  try {
    const parsed = JSON.parse(json)
    return {
      instagram: parsed.instagram || "",
      youtube: parsed.youtube || "",
      soundcloud: parsed.soundcloud || "",
    }
  } catch {
    return { instagram: "", youtube: "", soundcloud: "" }
  }
}

export function TeamMemberForm({
  member,
}: {
  member?: TeamMemberData
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false)

  const social = parseSocialLinks(member?.socialLinks ?? null)

  const [name, setName] = useState(member?.name ?? "")
  const [role, setRole] = useState(member?.role ?? "")
  const [bio, setBio] = useState(member?.bio ?? "")
  const [photoUrl, setPhotoUrl] = useState(member?.photoUrl ?? "")
  const [credits, setCredits] = useState(member?.credits ?? "")
  const [featuredTrackUrl, setFeaturedTrackUrl] = useState(
    member?.featuredTrackUrl ?? ""
  )
  const [instagram, setInstagram] = useState(social.instagram)
  const [youtube, setYoutube] = useState(social.youtube)
  const [soundcloud, setSoundcloud] = useState(social.soundcloud)
  const [sortOrder, setSortOrder] = useState(member?.sortOrder ?? 0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name,
      role,
      bio,
      photoUrl: photoUrl || null,
      credits: credits || null,
      featuredTrackUrl: featuredTrackUrl || null,
      instagram: instagram || null,
      youtube: youtube || null,
      soundcloud: soundcloud || null,
      sortOrder,
    }

    const result = teamMemberSchema.safeParse(data)
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

    // Build socialLinks JSON
    const socialLinks = JSON.stringify({
      instagram: instagram || undefined,
      youtube: youtube || undefined,
      soundcloud: soundcloud || undefined,
    })

    const formData = {
      name,
      slug: slugify(name),
      role,
      bio,
      photoUrl: photoUrl || null,
      socialLinks:
        instagram || youtube || soundcloud ? socialLinks : null,
      credits: credits || null,
      featuredTrackUrl: featuredTrackUrl || null,
      sortOrder,
    }

    startTransition(async () => {
      try {
        if (member) {
          await updateTeamMember(member.id, formData)
          toast.success("Team member updated")
        } else {
          await createTeamMember(formData)
          toast.success("Team member created")
          router.push("/admin/team")
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
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className={inputClass}
        />
        {errors.name && <p className={errorClass}>{errors.name}</p>}
      </div>

      {/* Role */}
      <div>
        <label className={labelClass}>Role / Title</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Producer, Engineer, etc."
          className={inputClass}
        />
        {errors.role && <p className={errorClass}>{errors.role}</p>}
      </div>

      {/* Bio */}
      <div>
        <label className={labelClass}>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief biography..."
          rows={4}
          maxLength={1000}
          className={inputClass}
        />
        <p className="text-[#555555] font-sans text-[11px] mt-1">
          {bio.length}/1000
        </p>
        {errors.bio && <p className={errorClass}>{errors.bio}</p>}
      </div>

      {/* Photo */}
      <div>
        <label className={labelClass}>Photo</label>
        <div className="flex items-center gap-4">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={name}
              className="w-16 h-16 object-cover border border-[#222222]"
            />
          )}
          <button
            type="button"
            onClick={() => setMediaPickerOpen(true)}
            className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-4 py-2"
          >
            {photoUrl ? "Change Photo" : "Select Photo"}
          </button>
          {photoUrl && (
            <button
              type="button"
              onClick={() => setPhotoUrl("")}
              className="font-mono text-[11px] uppercase text-[#ff4444]"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Credits */}
      <div>
        <label className={labelClass}>Credits</label>
        <textarea
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          placeholder="Notable credits or accomplishments..."
          rows={3}
          className={inputClass}
        />
      </div>

      {/* Featured Track URL */}
      <div>
        <label className={labelClass}>Featured Track URL</label>
        <input
          type="text"
          value={featuredTrackUrl}
          onChange={(e) => setFeaturedTrackUrl(e.target.value)}
          placeholder="https://soundcloud.com/..."
          className={inputClass}
        />
        {errors.featuredTrackUrl && (
          <p className={errorClass}>{errors.featuredTrackUrl}</p>
        )}
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <p className={labelClass}>Social Links</p>
        <div>
          <label className="text-[#555555] font-sans text-[11px] mb-0.5 block">
            Instagram
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="https://instagram.com/..."
            className={inputClass}
          />
          {errors.instagram && (
            <p className={errorClass}>{errors.instagram}</p>
          )}
        </div>
        <div>
          <label className="text-[#555555] font-sans text-[11px] mb-0.5 block">
            YouTube
          </label>
          <input
            type="text"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://youtube.com/..."
            className={inputClass}
          />
          {errors.youtube && (
            <p className={errorClass}>{errors.youtube}</p>
          )}
        </div>
        <div>
          <label className="text-[#555555] font-sans text-[11px] mb-0.5 block">
            SoundCloud
          </label>
          <input
            type="text"
            value={soundcloud}
            onChange={(e) => setSoundcloud(e.target.value)}
            placeholder="https://soundcloud.com/..."
            className={inputClass}
          />
          {errors.soundcloud && (
            <p className={errorClass}>{errors.soundcloud}</p>
          )}
        </div>
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
          onClick={() => router.push("/admin/team")}
          className="bg-[#222222] text-[#888888] font-mono text-[13px] uppercase px-6 py-2"
        >
          Cancel
        </button>
      </div>

      {/* Media Picker */}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(asset) => {
          setPhotoUrl(asset.url)
        }}
        typeFilter="image"
      />
    </form>
  )
}
