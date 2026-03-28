/**
 * Seed an admin/owner user with direct database insert.
 * Does NOT require a running dev server.
 *
 * Usage:
 *   npx tsx src/db/seed-admin.ts
 *
 * Environment variables (optional):
 *   ADMIN_EMAIL     (default: admin@glitchstudios.com)
 *   ADMIN_PASSWORD  (default: changeme123)
 *   ADMIN_NAME      (default: Glitch Admin)
 */
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { sql } from "drizzle-orm"
import { hashPassword } from "better-auth/crypto/password"
import * as schema from "./schema"

async function seedAdmin() {
  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client, { schema })

  const email = process.env.ADMIN_EMAIL || "admin@glitchstudios.com"
  const password = process.env.ADMIN_PASSWORD || "changeme123"
  const name = process.env.ADMIN_NAME || "Glitch Admin"

  try {
    console.log(`Seeding admin user: ${email}`)

    // Hash password using Better Auth's scrypt-based hashing (salt:hash format)
    const hashedPassword = await hashPassword(password)

    // Generate user ID
    const userId = crypto.randomUUID()

    // Insert into user table (or update if email already exists)
    await db.execute(
      sql`INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
          VALUES (${userId}, ${name}, ${email}, true, 'owner', NOW(), NOW())
          ON CONFLICT (email) DO UPDATE SET role = 'owner', name = ${name}, "updatedAt" = NOW()`
    )

    // Get the actual user ID (may differ if user already existed)
    const userResult = await db.execute(
      sql`SELECT id FROM "user" WHERE email = ${email}`
    )
    const actualUserId = (userResult.rows?.[0] as { id: string })?.id ?? (userResult as unknown as { id: string }[])[0]?.id ?? userId

    // Insert into account table for credential provider (or update password if exists)
    await db.execute(
      sql`INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
          VALUES (${crypto.randomUUID()}, ${email}, 'credential', ${actualUserId}, ${hashedPassword}, NOW(), NOW())
          ON CONFLICT ("providerId", "accountId") DO UPDATE SET password = ${hashedPassword}, "updatedAt" = NOW()`
    )

    console.log(`Admin user created: ${email} (role: owner)`)
    console.log("Login with these credentials at /login")
  } catch (error) {
    console.error("Failed to seed admin user:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seedAdmin()
