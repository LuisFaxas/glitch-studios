"use server"

import { db } from "@/lib/db"
import { contactSubmissions, contactReplies } from "@/db/schema"
import { requirePermission } from "@/lib/permissions"
import { eq, desc, count, sql } from "drizzle-orm"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const PAGE_SIZE = 20

export async function getMessages(filters?: { page?: number }) {
  await requirePermission("reply_messages")

  const page = filters?.page ?? 1
  const offset = (page - 1) * PAGE_SIZE

  const messages = await db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      email: contactSubmissions.email,
      serviceInterest: contactSubmissions.serviceInterest,
      message: contactSubmissions.message,
      isRead: contactSubmissions.isRead,
      createdAt: contactSubmissions.createdAt,
      replyCount: sql<number>`(SELECT COUNT(*) FROM contact_replies WHERE contact_replies.submission_id = ${contactSubmissions.id})::int`,
    })
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(PAGE_SIZE)
    .offset(offset)

  const [totalResult] = await db
    .select({ value: count() })
    .from(contactSubmissions)

  const [unreadResult] = await db
    .select({ value: count() })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.isRead, false))

  return {
    messages,
    totalPages: Math.ceil((totalResult?.value ?? 0) / PAGE_SIZE),
    unreadCount: unreadResult?.value ?? 0,
  }
}

export async function getMessage(submissionId: string) {
  await requirePermission("reply_messages")

  const [submission] = await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, submissionId))
    .limit(1)

  if (!submission) {
    throw new Error("Message not found")
  }

  const replies = await db
    .select()
    .from(contactReplies)
    .where(eq(contactReplies.submissionId, submissionId))
    .orderBy(contactReplies.sentAt)

  // Do NOT mark as read here — separate action to avoid accidental state changes
  return { submission, replies }
}

export async function markAsRead(submissionId: string) {
  await requirePermission("reply_messages")

  await db
    .update(contactSubmissions)
    .set({ isRead: true })
    .where(eq(contactSubmissions.id, submissionId))
}

export async function replyToMessage(submissionId: string, body: string) {
  const session = await requirePermission("reply_messages")

  const [submission] = await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, submissionId))
    .limit(1)

  if (!submission) {
    throw new Error("Message not found")
  }

  // Insert reply record
  await db.insert(contactReplies).values({
    submissionId,
    body,
    sentBy: session.user.name || "Admin",
  })

  // Send reply email via Resend with proper replyTo header
  const adminEmail = process.env.ADMIN_EMAIL || "admin@glitchstudios.com"
  await resend.emails.send({
    from: `Glitch Studios <${adminEmail}>`,
    to: submission.email,
    replyTo: adminEmail,
    subject: `Re: ${submission.serviceInterest || "Your message"} - Glitch Studios`,
    text: body,
  })

  // Mark submission as read if not already
  if (!submission.isRead) {
    await db
      .update(contactSubmissions)
      .set({ isRead: true })
      .where(eq(contactSubmissions.id, submissionId))
  }

  return { success: true }
}

export async function getUnreadCount() {
  const [result] = await db
    .select({ value: count() })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.isRead, false))

  return result?.value ?? 0
}
