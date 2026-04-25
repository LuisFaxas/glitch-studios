"use client"

import { useState } from "react"
import type { Brand } from "@/lib/brand"
import { submitArtistApplication } from "@/actions/artist-applications"
import { getTagsForBrand } from "@/lib/types/artist-application"
import { AuthSplitFrame } from "@/components/auth/auth-split-frame"
import { EnumSafeFormError } from "@/components/auth/enum-safe-form-error"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface ArtistRequestFormProps {
  brand: Brand
  stats: { value: string; label: string }[]
}

const LABEL_CLASS =
  "font-mono uppercase tracking-[0.08em] text-[12px] font-semibold"

const STUDIOS_HIGHLIGHT = {
  eyebrow: "What we look for",
  title: "We build the roster slowly",
  points: [
    {
      label: "Original work, not covers",
      description:
        "Demonstrate a recognizable signature in production, performance, or songwriting.",
    },
    {
      label: "Catalog you can ship",
      description:
        "Mixed, mastered, and ready for licensing — or close enough to finish in our rooms.",
    },
    {
      label: "Working professionally",
      description:
        "Touring, charting, releasing, or freelancing. We grow with people already moving.",
    },
  ],
}

const TECH_HIGHLIGHT = {
  eyebrow: "Contributor brief",
  title: "We publish what holds up",
  points: [
    {
      label: "Receipts over opinions",
      description:
        "Every claim cites a benchmark, a measurement, or a teardown. No vibes-based takes.",
    },
    {
      label: "Independence — full stop",
      description:
        "If a vendor sent you a unit, say so up front. We disclose every relationship.",
    },
    {
      label: "Range or specialty",
      description:
        "Generalist coverage of laptops or deep dives on a single category — both work.",
    },
  ],
}

export function ArtistRequestForm({ brand, stats }: ArtistRequestFormProps) {
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
  const subhead =
    brand === "tech"
      ? "We review every contributor application by hand. Bring the receipts."
      : "We review every artist application by hand. Bring the catalog."
  const wordmark = "Show off!"
  const highlight = brand === "tech" ? TECH_HIGHLIGHT : STUDIOS_HIGHLIGHT

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
      <AuthSplitFrame
        wordmark={wordmark}
        eyebrow="What happens next"
        highlight={{
          title: "Your application is in",
          points: [
            {
              label: "We read every one",
              description:
                "A real human reads each submission. No auto-rejects, no aging-out.",
            },
            {
              label: "Reply within 3 business days",
              description:
                "Approved, declined, or asked for more — by email from a real address.",
            },
            {
              label: "Approved? You set your password",
              description:
                "We send an invite link. Click it, set a password, and you're in.",
            },
          ],
        }}
        stats={stats}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2a4a2a] bg-[#0e1e0e] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#7ad17a]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7ad17a]" />
              Submitted
            </span>
            <h1 className="font-mono text-[28px] uppercase leading-[1.1] tracking-[0.04em] font-semibold text-[#f5f5f0]">
              Request received.
            </h1>
            <p className="font-sans text-[15px] leading-[1.55] text-[var(--muted-foreground)]">
              We&apos;ll review your application by hand. Confirmation just hit{" "}
              <span className="text-[#f5f5f0]">{email || "your inbox"}</span>.
            </p>
          </div>

          {/* Application timeline */}
          <ol className="flex flex-col gap-4 rounded-lg border border-[#222] bg-[#0a0a0a] p-5">
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[#f5f5f0]"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#f5f5f0]">
                  Submitted · today
                </span>
                <span className="font-sans text-[14px] leading-[1.4] text-[var(--muted-foreground)]">
                  Application landed in our queue.
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-[#444] bg-transparent"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  In review · 1-3 days
                </span>
                <span className="font-sans text-[14px] leading-[1.4] text-[var(--muted-foreground)]">
                  A real human reads it. We may email back asking for more.
                </span>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-[#444] bg-transparent"
              />
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Decision · by email
                </span>
                <span className="font-sans text-[14px] leading-[1.4] text-[var(--muted-foreground)]">
                  Approved? Invite link to set your password and start uploading.
                </span>
              </div>
            </li>
          </ol>

          <div className="flex flex-col gap-2 rounded-lg border border-[#222] bg-[#0a0a0a] p-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              Reference
            </span>
            <span className="font-mono text-[14px] text-[#f5f5f0]">
              {name || "Your application"} ·{" "}
              {focusTags.slice(0, 3).join(" · ") || "tags"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--foreground)] px-6 font-sans text-[15px] font-semibold text-black"
            >
              Back to home
            </a>
            <a
              href="/contact"
              className="text-center font-mono text-[12px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] hover:text-[#f5f5f0]"
            >
              Forgot to add something? Contact us
            </a>
          </div>
        </div>
      </AuthSplitFrame>
    )
  }

  return (
    <AuthSplitFrame
      wordmark={wordmark}
      eyebrow={highlight.eyebrow}
      highlight={{ title: highlight.title, points: highlight.points }}
      stats={stats}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-mono text-[22px] uppercase leading-[1.15] tracking-[0.04em] font-semibold text-[#f5f5f0]">
            {heading}
          </h1>
          <p className="font-sans text-[15px] leading-[1.5] text-[var(--muted-foreground)]">
            {subhead}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <EnumSafeFormError message={error} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              placeholder={
                brand === "tech"
                  ? "What you cover, what you've published, why we should publish you."
                  : "What you produce, who you've worked with, what makes your sound yours."
              }
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={pending}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              {bio.length} / 2000
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="portfolioUrl" className={LABEL_CLASS}>
              Portfolio URL (optional)
            </Label>
            <Input
              id="portfolioUrl"
              name="portfolioUrl"
              type="url"
              placeholder={
                brand === "tech"
                  ? "https://your-blog.com  or  https://youtube.com/..."
                  : "https://your-soundcloud.com  or  https://your-spotify.com/..."
              }
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              disabled={pending}
            />
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className={LABEL_CLASS}>
              {brand === "tech" ? "Focus areas" : "Genres"}
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tags.map((tag) => {
                const id = `tag-${tag}`
                const checked = focusTags.includes(tag)
                return (
                  <label
                    key={tag}
                    htmlFor={id}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[14px] font-sans cursor-pointer transition-colors ${
                      checked
                        ? "border-[#f5f5f0] bg-[#f5f5f0]/5 text-[#f5f5f0]"
                        : "border-[#222] text-[var(--muted-foreground)] hover:border-[#333]"
                    }`}
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

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="mt-2 bg-[var(--foreground)] text-black font-sans"
          >
            {pending ? "Submitting..." : "Submit request"}
          </Button>
        </form>
      </div>
    </AuthSplitFrame>
  )
}
