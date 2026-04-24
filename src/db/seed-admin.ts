/**
 * Seed real owner + admin accounts from env vars. Direct DB insert, no dev server needed.
 *
 * Usage:
 *   pnpm db:seed-users                    # upsert owner + admin defined in .env.local
 *   WIPE_USERS=true pnpm db:seed-users    # delete ALL existing users first, then seed
 *
 * Required env vars (put in .env.local — it is gitignored):
 *   SEED_OWNER_EMAIL, SEED_OWNER_NAME, SEED_OWNER_PASSWORD
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_NAME, SEED_ADMIN_PASSWORD
 *
 * Optional:
 *   WIPE_USERS=true   Deletes every row in "user", "account", "session", "verification"
 *                     before seeding. Use for a clean reset.
 */
import postgres from "postgres"
import { hashPassword } from "better-auth/crypto"

type SeedUser = {
  email: string
  name: string
  password: string
  role: "owner" | "admin"
}

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value || value.trim() === "") {
    console.error(`Missing required env var: ${key}`)
    console.error(`Add it to .env.local, then re-run.`)
    process.exit(1)
  }
  return value
}

async function upsertUser(
  sql: postgres.Sql,
  user: SeedUser,
): Promise<void> {
  const hashed = await hashPassword(user.password)
  const newId = crypto.randomUUID()

  await sql`
    INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
    VALUES (${newId}, ${user.name}, ${user.email}, true, ${user.role}, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
      SET role = ${user.role},
          name = ${user.name},
          "emailVerified" = true,
          "updatedAt" = NOW()
  `

  const [{ id: userId }] = await sql<{ id: string }[]>`
    SELECT id FROM "user" WHERE email = ${user.email}
  `

  await sql`
    DELETE FROM "account"
    WHERE "userId" = ${userId} AND "providerId" = 'credential'
  `
  await sql`
    INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
    VALUES (${crypto.randomUUID()}, ${user.email}, 'credential', ${userId}, ${hashed}, NOW(), NOW())
  `

  console.log(`  ✓ ${user.role.padEnd(5)} ${user.email}`)
}

async function main() {
  const sql = postgres(process.env.DATABASE_URL!)

  const owner: SeedUser = {
    email: requireEnv("SEED_OWNER_EMAIL"),
    name: requireEnv("SEED_OWNER_NAME"),
    password: requireEnv("SEED_OWNER_PASSWORD"),
    role: "owner",
  }
  const adminUser: SeedUser = {
    email: requireEnv("SEED_ADMIN_EMAIL"),
    name: requireEnv("SEED_ADMIN_NAME"),
    password: requireEnv("SEED_ADMIN_PASSWORD"),
    role: "admin",
  }

  try {
    console.log("Seeding users:")
    await upsertUser(sql, owner)
    await upsertUser(sql, adminUser)

    if (process.env.WIPE_USERS === "true") {
      console.log("\nWiping all other users (reassigning authored content to owner first):")
      const [{ id: ownerId }] = await sql<{ id: string }[]>`
        SELECT id FROM "user" WHERE email = ${owner.email}
      `
      const keepEmails = [owner.email, adminUser.email]

      await sql`
        UPDATE "tech_reviews" SET reviewer_id = ${ownerId}
        WHERE reviewer_id IN (SELECT id FROM "user" WHERE email <> ALL(${sql.array(keepEmails)}))
      `
      await sql`
        UPDATE "tech_benchmark_runs" SET created_by = ${ownerId}
        WHERE created_by IN (SELECT id FROM "user" WHERE email <> ALL(${sql.array(keepEmails)}))
      `
      await sql`
        DELETE FROM "session" WHERE "userId" IN (
          SELECT id FROM "user" WHERE email <> ALL(${sql.array(keepEmails)})
        )
      `
      await sql`
        DELETE FROM "account" WHERE "userId" IN (
          SELECT id FROM "user" WHERE email <> ALL(${sql.array(keepEmails)})
        )
      `
      await sql`DELETE FROM "verification"`
      const deleted = await sql`
        DELETE FROM "user" WHERE email <> ALL(${sql.array(keepEmails)}) RETURNING email
      `
      console.log(`  ✓ removed ${deleted.length} old user(s): ${deleted.map((r) => r.email).join(", ") || "none"}`)
    }

    console.log("\nDone. Sign in at /login with the credentials you set in .env.local.")
  } catch (error) {
    console.error("Failed to seed users:", error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

main()
