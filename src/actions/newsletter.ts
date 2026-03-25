"use server"

import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function subscribeNewsletter(email: string) {
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, normalizedEmail))
    .limit(1)

  if (existing.length > 0) {
    return { success: false, message: "You are already subscribed." }
  }

  await db
    .insert(newsletterSubscribers)
    .values({ email: normalizedEmail })

  return {
    success: true,
    message: "You are subscribed. Welcome to the Glitch community.",
  }
}
