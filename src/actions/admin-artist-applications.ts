"use server"

import crypto from "node:crypto"
import { z } from "zod"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { Resend } from "resend"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { artistApplications, user } from "@/db/schema"

const resend = new Resend(process.env.RESEND_API_KEY)
const EMAIL_FROM = "Glitch Studios <noreply@glitchstudios.io>"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = session?.user?.role ?? ""
  if (!session?.user || !["owner", "admin"].includes(role)) {
    throw new Error("Unauthorized")
  }
  return session
}

const idSchema = z.object({ applicationId: z.string().uuid() })

export async function approveArtistApplication(input: { applicationId: string }) {
  const session = await requireAdmin()
  const parsed = idSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid applicationId")

  const [app] = await db
    .select()
    .from(artistApplications)
    .where(eq(artistApplications.id, parsed.data.applicationId))
    .limit(1)
  if (!app) throw new Error("Application not found")
  if (app.status !== "pending" && app.status !== "info_requested") {
    throw new Error(`Cannot approve application in status ${app.status}`)
  }

  const newRole = app.brand === "studios" ? "artist" : "contributor"
  const userId = crypto.randomUUID()

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: app.name,
      email: app.email,
      emailVerified: true,
      role: newRole,
    })
    await tx
      .update(artistApplications)
      .set({
        status: "approved",
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      })
      .where(eq(artistApplications.id, app.id))
  })

  // Trigger Better Auth password-reset flow with the invite=1 marker.
  // The sendResetPassword handler in src/lib/auth.ts branches on this and
  // sends ArtistApprovalInviteEmail with the brand from the URL.
  const redirectTo = `/reset-password?invite=1&brand=${encodeURIComponent(app.brand)}`
  await auth.api.requestPasswordReset({
    body: { email: app.email, redirectTo },
    headers: await headers(),
  })

  revalidatePath("/admin/applications")
  return { ok: true }
}

const rejectSchema = z.object({
  applicationId: z.string().uuid(),
  reviewerNote: z.string().max(2000).optional(),
})

export async function rejectArtistApplication(input: {
  applicationId: string
  reviewerNote?: string
}) {
  const session = await requireAdmin()
  const parsed = rejectSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  await db
    .update(artistApplications)
    .set({
      status: "rejected",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
      reviewerNote: parsed.data.reviewerNote ?? null,
    })
    .where(eq(artistApplications.id, parsed.data.applicationId))

  revalidatePath("/admin/applications")
  return { ok: true }
}

const moreInfoSchema = z.object({
  applicationId: z.string().uuid(),
  emailBody: z.string().min(20).max(5000),
  emailSubject: z.string().min(3).max(200),
})

export async function requestMoreInfoOnApplication(input: {
  applicationId: string
  emailBody: string
  emailSubject: string
}) {
  const session = await requireAdmin()
  const parsed = moreInfoSchema.safeParse(input)
  if (!parsed.success) throw new Error("Invalid input")

  const [app] = await db
    .select()
    .from(artistApplications)
    .where(eq(artistApplications.id, parsed.data.applicationId))
    .limit(1)
  if (!app) throw new Error("Application not found")

  await db
    .update(artistApplications)
    .set({
      status: "info_requested",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    })
    .where(eq(artistApplications.id, app.id))

  await resend.emails.send({
    from: EMAIL_FROM,
    to: app.email,
    subject: parsed.data.emailSubject,
    text: parsed.data.emailBody,
  })

  revalidatePath("/admin/applications")
  return { ok: true }
}
