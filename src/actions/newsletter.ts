"use server"

import crypto from "crypto"
import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/db/schema"
import { eq } from "drizzle-orm"

export type NewsletterSource =
  | "footer"
  | "launch-notify"
  | "blog"
  | "apparel"

export async function subscribeNewsletter(
  email: string,
  source: NewsletterSource = "footer"
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, normalizedEmail))
    .limit(1)

  if (existing.length > 0) {
    // D-19: reuse existing .tags array (no schema migration); upsert tag if absent
    const currentTags = existing[0].tags ?? []
    if (!currentTags.includes(source)) {
      await db
        .update(newsletterSubscribers)
        .set({ tags: [...currentTags, source] })
        .where(eq(newsletterSubscribers.email, normalizedEmail))
    }
    return {
      success: true,
      message:
        source === "launch-notify"
          ? "You're on the list. We'll email you when bookings open."
          : source === "apparel"
            ? "You're on the Glitch Apparel waitlist. We'll email you at launch."
            : "You are already subscribed.",
    }
  }

  await db
    .insert(newsletterSubscribers)
    .values({ email: normalizedEmail, tags: [source] })

  return {
    success: true,
    message:
      source === "launch-notify"
        ? "You're on the list. We'll email you when bookings open."
        : source === "apparel"
          ? "You're on the Glitch Apparel waitlist. We'll email you at launch."
          : "You are subscribed. Welcome to the Glitch community.",
  }
}

/**
 * Generate an HMAC token for unsubscribe URL verification.
 */
function generateHmacToken(email: string): string {
  return crypto
    .createHmac("sha256", process.env.CRON_SECRET!)
    .update(email.toLowerCase().trim())
    .digest("hex")
}

/**
 * Generate a full unsubscribe URL for a subscriber.
 */
export async function generateUnsubscribeUrl(email: string): Promise<string> {
  const token = generateHmacToken(email)
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://glitchstudios.com"
  return `${siteUrl}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

/**
 * Verify HMAC token and deactivate subscriber.
 * Used by the public /unsubscribe page.
 */
export async function unsubscribe(
  email: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const expectedToken = generateHmacToken(email)

  if (token !== expectedToken) {
    return { success: false, message: "Invalid unsubscribe link." }
  }

  const normalizedEmail = email.toLowerCase().trim()

  await db
    .update(newsletterSubscribers)
    .set({ isActive: false })
    .where(eq(newsletterSubscribers.email, normalizedEmail))

  return {
    success: true,
    message: "You have been unsubscribed from Glitch Studios newsletter.",
  }
}
