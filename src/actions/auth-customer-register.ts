"use server"

import { z } from "zod"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { user } from "@/db/schema"

const checkEmailSchema = z.object({
  email: z.string().email(),
})

/**
 * Returns whether an email is already taken.
 * AUTH-06: register flow may leak email existence by design at step 1
 * (so user doesn't waste 3 steps on a duplicate email). Login + forgot-password
 * remain enumeration-safe.
 *
 * NEVER throws. NEVER echoes the email. Returns ONLY { taken: boolean }.
 */
export async function checkEmailUniqueness(
  input: unknown,
): Promise<{ taken: boolean }> {
  const parsed = checkEmailSchema.safeParse(input)
  if (!parsed.success) {
    return { taken: false }
  }
  const normalized = parsed.data.email.toLowerCase()
  const [existing] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, normalized))
    .limit(1)
  return { taken: !!existing }
}
