import { db } from "@/lib/db"
import { sql } from "drizzle-orm"

/**
 * Seed an admin user.
 *
 * This script creates an admin user via the Better Auth API,
 * then promotes the user to admin role in the database.
 *
 * Usage:
 *   ADMIN_EMAIL=admin@glitchstudios.com ADMIN_PASSWORD=changeme123 tsx src/db/seed-admin.ts
 *
 * The script calls the Better Auth sign-up endpoint directly,
 * then updates the user role to "admin" in the database.
 */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || "admin@glitchstudios.com"
  const password = process.env.ADMIN_PASSWORD || "changeme123"
  const name = process.env.ADMIN_NAME || "Admin"
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"

  console.log(`Seeding admin user: ${email}`)

  // Register the user via Better Auth API
  try {
    const response = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.log(
        `Registration response (${response.status}): ${body}`
      )
      // User might already exist, continue to role update
    } else {
      console.log("Admin user registered successfully")
    }
  } catch (error) {
    console.log("Registration request failed (server may not be running)")
    console.log("Attempting direct database role update...")
  }

  // Update the user role to admin directly in the database
  try {
    await db.execute(
      sql`UPDATE "user" SET role = 'admin' WHERE email = ${email}`
    )
    console.log(`Updated role to admin for: ${email}`)
  } catch (error) {
    console.error("Failed to update admin role:", error)
    process.exit(1)
  }

  console.log("Admin seed complete")
  process.exit(0)
}

seedAdmin()
