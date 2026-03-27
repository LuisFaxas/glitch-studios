"use server"

import { eq, ilike, desc, sql, and, arrayContains } from "drizzle-orm"
import { Resend } from "resend"
import { db } from "@/lib/db"
import {
  newsletterSubscribers,
  newsletterBroadcasts,
} from "@/db/schema"
import { requirePermission } from "@/lib/permissions"
import { generateUnsubscribeUrl } from "@/actions/newsletter"
import { NewsletterBroadcastEmail } from "@/lib/email/newsletter-broadcast"

const resend = new Resend(process.env.RESEND_API_KEY)
const PAGE_SIZE_SUBSCRIBERS = 50
const PAGE_SIZE_BROADCASTS = 20
const BATCH_SIZE = 100

export type Segment = "all" | "beat_buyers" | "studio_clients"

/**
 * Get paginated subscribers with optional search.
 */
export async function getSubscribers(filters?: {
  search?: string
  page?: number
}) {
  await requirePermission("send_newsletters")

  const page = filters?.page ?? 1
  const offset = (page - 1) * PAGE_SIZE_SUBSCRIBERS

  const conditions = filters?.search
    ? ilike(newsletterSubscribers.email, `%${filters.search}%`)
    : undefined

  const [subscribers, countResult] = await Promise.all([
    db
      .select()
      .from(newsletterSubscribers)
      .where(conditions)
      .orderBy(desc(newsletterSubscribers.subscribedAt))
      .limit(PAGE_SIZE_SUBSCRIBERS)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsletterSubscribers)
      .where(conditions),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    subscribers,
    totalPages: Math.ceil(total / PAGE_SIZE_SUBSCRIBERS),
    total,
  }
}

/**
 * Get active subscribers filtered by segment.
 */
export async function getSubscribersBySegment(segment: Segment) {
  await requirePermission("send_newsletters")

  const isActiveCondition = eq(newsletterSubscribers.isActive, true)

  let conditions
  switch (segment) {
    case "beat_buyers":
      conditions = and(
        isActiveCondition,
        arrayContains(newsletterSubscribers.tags, ["beat_buyer"])
      )
      break
    case "studio_clients":
      conditions = and(
        isActiveCondition,
        arrayContains(newsletterSubscribers.tags, ["studio_client"])
      )
      break
    default:
      conditions = isActiveCondition
  }

  const subscribers = await db
    .select()
    .from(newsletterSubscribers)
    .where(conditions)

  return { subscribers, count: subscribers.length }
}

/**
 * Get counts per segment (only active subscribers).
 */
export async function getSegmentCounts() {
  await requirePermission("send_newsletters")

  const [allResult, buyersResult, clientsResult] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.isActive, true)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.isActive, true),
          arrayContains(newsletterSubscribers.tags, ["beat_buyer"])
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsletterSubscribers)
      .where(
        and(
          eq(newsletterSubscribers.isActive, true),
          arrayContains(newsletterSubscribers.tags, ["studio_client"])
        )
      ),
  ])

  return {
    all: allResult[0]?.count ?? 0,
    beat_buyers: buyersResult[0]?.count ?? 0,
    studio_clients: clientsResult[0]?.count ?? 0,
  }
}

/**
 * Send a newsletter to a segment of subscribers.
 * Tracks partial failures.
 */
export async function sendNewsletter(data: {
  subject: string
  body: string
  segment: Segment
}) {
  const session = await requirePermission("send_newsletters")

  const { subscribers } = await getSubscribersBySegment(data.segment)

  if (subscribers.length === 0) {
    throw new Error("No active subscribers in this segment.")
  }

  let sentCount = 0
  let failedCount = 0
  const errors: string[] = []

  // Chunk subscribers into batches of 100
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)

    try {
      const emails = batch.map((subscriber) => {
        const unsubscribeUrl = generateUnsubscribeUrl(subscriber.email)
        return {
          from: "Glitch Studios <newsletter@glitchstudios.com>",
          to: subscriber.email,
          subject: data.subject,
          react: NewsletterBroadcastEmail({
            body: data.body,
            unsubscribeUrl,
          }),
        }
      })

      await resend.batch.send(emails)
      sentCount += batch.length
    } catch (err) {
      failedCount += batch.length
      errors.push(
        `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${err instanceof Error ? err.message : "Unknown error"}`
      )
    }
  }

  // Determine status
  let status: "sent" | "partial_failure" | "failed"
  if (failedCount === 0) {
    status = "sent"
  } else if (sentCount === 0) {
    status = "failed"
  } else {
    status = "partial_failure"
  }

  // Record broadcast
  await db.insert(newsletterBroadcasts).values({
    subject: data.subject,
    body: data.body,
    segment: data.segment,
    recipientCount: sentCount,
    status,
    errorMessage: errors.length > 0 ? errors.join("; ") : null,
    sentAt: new Date(),
    sentBy: session.user.name ?? "Admin",
  })

  return { sent: sentCount, failed: failedCount, status }
}

/**
 * Get paginated broadcast history.
 */
export async function getBroadcasts(page?: number) {
  await requirePermission("send_newsletters")

  const currentPage = page ?? 1
  const offset = (currentPage - 1) * PAGE_SIZE_BROADCASTS

  const [broadcasts, countResult] = await Promise.all([
    db
      .select()
      .from(newsletterBroadcasts)
      .orderBy(desc(newsletterBroadcasts.createdAt))
      .limit(PAGE_SIZE_BROADCASTS)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsletterBroadcasts),
  ])

  const total = countResult[0]?.count ?? 0

  return {
    broadcasts,
    totalPages: Math.ceil(total / PAGE_SIZE_BROADCASTS),
  }
}

/**
 * Soft-remove a subscriber (set isActive=false).
 */
export async function removeSubscriber(subscriberId: string) {
  await requirePermission("send_newsletters")

  await db
    .update(newsletterSubscribers)
    .set({ isActive: false })
    .where(eq(newsletterSubscribers.id, subscriberId))
}

/**
 * Auto-tag a subscriber on purchase/booking events.
 * Called from Stripe webhook -- not from admin UI.
 */
export async function tagSubscriberOnEvent(
  email: string,
  tag: "beat_buyer" | "studio_client"
) {
  const normalizedEmail = email.toLowerCase().trim()

  const [subscriber] = await db
    .select()
    .from(newsletterSubscribers)
    .where(
      and(
        eq(newsletterSubscribers.email, normalizedEmail),
        eq(newsletterSubscribers.isActive, true)
      )
    )
    .limit(1)

  if (!subscriber) return

  const currentTags = subscriber.tags ?? []
  if (currentTags.includes(tag)) return

  await db
    .update(newsletterSubscribers)
    .set({ tags: [...currentTags, tag] })
    .where(eq(newsletterSubscribers.id, subscriber.id))
}
