"use server"

import { z } from "zod"
import { Resend } from "resend"
import { db } from "@/lib/db"
import { artistApplications } from "@/db/schema"
import { GENRE_TAGS, FOCUS_TAGS } from "@/lib/types/artist-application"

const resend = new Resend(process.env.RESEND_API_KEY)

const submitSchema = z.object({
  brand: z.enum(["studios", "tech"]),
  name: z.string().min(1).max(120),
  email: z.string().email(),
  bio: z.string().min(20).max(2000),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  focusTags: z.array(z.string()).min(1).max(8),
})

const ALL_VALID_TAGS = new Set<string>([...GENRE_TAGS, ...FOCUS_TAGS])

const ADMIN_FALLBACK_EMAIL = "office@glitchstudios.io"
// Mirrors EMAIL_FROM in src/lib/auth.ts (Phase 24 sender pattern).
const EMAIL_FROM = "Glitch Studios <noreply@glitchstudios.io>"

export type SubmitArtistApplicationResult =
  | { ok: true; applicationId: string }
  | { ok: false; error: string }

export async function submitArtistApplication(
  input: unknown,
): Promise<SubmitArtistApplicationResult> {
  const parsed = submitSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Please review the form for errors and try again." }
  }
  const data = parsed.data

  const safeFocusTags = data.focusTags.filter((t) => ALL_VALID_TAGS.has(t))
  if (safeFocusTags.length === 0) {
    return { ok: false, error: "Pick at least one tag." }
  }

  try {
    const [row] = await db
      .insert(artistApplications)
      .values({
        brand: data.brand,
        name: data.name,
        email: data.email.toLowerCase(),
        bio: data.bio,
        portfolioUrl:
          data.portfolioUrl && data.portfolioUrl.length > 0 ? data.portfolioUrl : null,
        focusTags: safeFocusTags,
        status: "pending",
      })
      .returning({ id: artistApplications.id })

    const brandName = data.brand === "tech" ? "GlitchTech" : "Glitch Studios"
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? ADMIN_FALLBACK_EMAIL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? ""

    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: adminEmail,
        subject: `New ${brandName} application: ${data.name}`,
        html: `<p><strong>${escapeHtml(data.name)}</strong> (${escapeHtml(data.email)}) submitted a ${brandName} application.</p>
<p>Bio: ${escapeHtml(data.bio)}</p>
${data.portfolioUrl ? `<p>Portfolio: <a href="${escapeAttr(data.portfolioUrl)}">${escapeHtml(data.portfolioUrl)}</a></p>` : ""}
<p>Tags: ${safeFocusTags.map(escapeHtml).join(", ")}</p>
<p>Review at <a href="${baseUrl}/admin/applications">${baseUrl}/admin/applications</a></p>`,
      })
    } catch (emailErr) {
      console.error("[artist-applications] admin notification failed", emailErr)
    }

    return { ok: true, applicationId: row.id }
  } catch (err) {
    console.error("[artist-applications] insert failed", err)
    return { ok: false, error: "Something glitched on our side. Try again in a moment." }
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;")
}
