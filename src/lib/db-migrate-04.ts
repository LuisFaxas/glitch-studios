/**
 * Phase 4 migration script.
 * Run with: npx tsx src/lib/db-migrate-04.ts
 */
import postgres from "postgres"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL is required")
  process.exit(1)
}

const sql = postgres(databaseUrl)

async function migrate() {
  console.log("Phase 4 migration: starting...")

  // Add "scheduled" to post_status enum
  await sql`ALTER TYPE post_status ADD VALUE IF NOT EXISTS 'scheduled'`

  // Add scheduledAt to blog_posts
  await sql`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP`

  // Add tags to newsletter_subscribers
  await sql`ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS tags TEXT[]`

  // Add service_type to testimonials
  await sql`ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS service_type TEXT`

  // Blog tags
  await sql`
    CREATE TABLE IF NOT EXISTS blog_tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  // Blog post tags (many-to-many)
  await sql`
    CREATE TABLE IF NOT EXISTS blog_post_tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE
    )
  `

  // Media assets
  await sql`
    CREATE TABLE IF NOT EXISTS media_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE,
      url TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      duration INTEGER,
      alt TEXT,
      uploaded_by TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  // Homepage sections
  await sql`
    CREATE TABLE IF NOT EXISTS homepage_sections (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      section_type TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_visible BOOLEAN DEFAULT true,
      config TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  // Contact replies
  await sql`
    CREATE TABLE IF NOT EXISTS contact_replies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
      sent_by TEXT NOT NULL
    )
  `

  // Newsletter broadcasts
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_broadcasts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      segment TEXT NOT NULL DEFAULT 'all',
      recipient_count INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'sent',
      error_message TEXT,
      sent_at TIMESTAMP,
      sent_by TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  // Site settings
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT NOT NULL UNIQUE,
      value TEXT,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  // Admin roles
  await sql`
    CREATE TABLE IF NOT EXISTS admin_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL UNIQUE,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `

  // Admin role permissions
  await sql`
    CREATE TABLE IF NOT EXISTS admin_role_permissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      role_id UUID NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
      permission TEXT NOT NULL
    )
  `

  // Insert default roles (skip if they already exist)
  await sql`
    INSERT INTO admin_roles (name, is_default)
    VALUES ('owner', true), ('editor', true), ('manager', true)
    ON CONFLICT (name) DO NOTHING
  `

  // Get role IDs
  const roles = await sql`SELECT id, name FROM admin_roles WHERE name IN ('owner', 'editor', 'manager')`

  const ownerRole = roles.find((r) => r.name === "owner")
  const editorRole = roles.find((r) => r.name === "editor")
  const managerRole = roles.find((r) => r.name === "manager")

  // Owner gets all 8 permissions
  if (ownerRole) {
    const ownerPermissions = [
      "manage_content",
      "manage_media",
      "view_clients",
      "send_newsletters",
      "manage_bookings",
      "manage_settings",
      "manage_roles",
      "reply_messages",
    ]
    for (const perm of ownerPermissions) {
      await sql`
        INSERT INTO admin_role_permissions (role_id, permission)
        SELECT ${ownerRole.id}, ${perm}
        WHERE NOT EXISTS (
          SELECT 1 FROM admin_role_permissions
          WHERE role_id = ${ownerRole.id} AND permission = ${perm}
        )
      `
    }
  }

  // Editor gets manage_content, manage_media, reply_messages
  if (editorRole) {
    const editorPermissions = ["manage_content", "manage_media", "reply_messages"]
    for (const perm of editorPermissions) {
      await sql`
        INSERT INTO admin_role_permissions (role_id, permission)
        SELECT ${editorRole.id}, ${perm}
        WHERE NOT EXISTS (
          SELECT 1 FROM admin_role_permissions
          WHERE role_id = ${editorRole.id} AND permission = ${perm}
        )
      `
    }
  }

  // Manager gets view_clients, manage_bookings, reply_messages, send_newsletters
  if (managerRole) {
    const managerPermissions = [
      "view_clients",
      "manage_bookings",
      "reply_messages",
      "send_newsletters",
    ]
    for (const perm of managerPermissions) {
      await sql`
        INSERT INTO admin_role_permissions (role_id, permission)
        SELECT ${managerRole.id}, ${perm}
        WHERE NOT EXISTS (
          SELECT 1 FROM admin_role_permissions
          WHERE role_id = ${managerRole.id} AND permission = ${perm}
        )
      `
    }
  }

  // Migrate existing admin users to owner role
  const updated = await sql`UPDATE "user" SET role = 'owner' WHERE role = 'admin'`
  console.log(`Migrated ${updated.count} admin user(s) to owner role`)

  console.log("Phase 4 migration: complete!")
  await sql.end()
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
