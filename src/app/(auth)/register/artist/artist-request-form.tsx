"use client"

import { useState } from "react"
import type { Brand } from "@/lib/brand"
import { submitArtistApplication } from "@/actions/artist-applications"
import { getTagsForBrand } from "@/lib/types/artist-application"
import { AuthFormCard } from "@/components/auth/auth-form-card"
import { EnumSafeFormError } from "@/components/auth/enum-safe-form-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface ArtistRequestFormProps {
  brand: Brand
}

const LABEL_CLASS = "font-mono uppercase tracking-[0.08em] text-[12px] font-semibold"

export function ArtistRequestForm({ brand }: ArtistRequestFormProps) {
  const [view, setView] = useState<"form" | "submitted">("form")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [focusTags, setFocusTags] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const tags = getTagsForBrand(brand)
  const heading =
    brand === "tech" ? "Request contributor access" : "Request artist access"

  const toggleTag = (tag: string) => {
    setFocusTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (focusTags.length === 0) {
      setError("Pick at least one tag.")
      return
    }
    if (bio.trim().length < 20) {
      setError("Bio must be at least 20 characters.")
      return
    }

    setPending(true)
    const result = await submitArtistApplication({
      brand,
      name,
      email,
      bio,
      portfolioUrl,
      focusTags,
    })
    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }
    setView("submitted")
  }

  if (view === "submitted") {
    return (
      <AuthFormCard
        heading="Request received."
        subhead="Our team reviews every application. You'll hear from us by email within 3 business days."
      >
        <div />
      </AuthFormCard>
    )
  }

  return (
    <AuthFormCard heading={heading}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <EnumSafeFormError message={error} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className={LABEL_CLASS}>
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className={LABEL_CLASS}>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="bio" className={LABEL_CLASS}>
            Bio
          </Label>
          <Textarea
            id="bio"
            name="bio"
            required
            minLength={20}
            maxLength={2000}
            rows={5}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="portfolioUrl" className={LABEL_CLASS}>
            Portfolio URL (optional)
          </Label>
          <Input
            id="portfolioUrl"
            name="portfolioUrl"
            type="url"
            placeholder="https://..."
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            disabled={pending}
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={LABEL_CLASS}>
            {brand === "tech" ? "Focus areas" : "Genres"}
          </legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tags.map((tag) => {
              const id = `tag-${tag}`
              const checked = focusTags.includes(tag)
              return (
                <label
                  key={tag}
                  htmlFor={id}
                  className="flex items-center gap-2 text-[14px] font-sans cursor-pointer"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggleTag(tag)}
                    disabled={pending}
                  />
                  <span>{tag}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <Button type="submit" size="lg" disabled={pending} className="mt-2">
          {pending ? "Submitting..." : "Submit request"}
        </Button>
      </form>
    </AuthFormCard>
  )
}
