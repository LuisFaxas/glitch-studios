-- Phase 26 — Brand-Aware Auth UI Redesign
-- Adds artist_applications table + newsletter_opt_in user column
-- + grandfather email verification for pre-existing users.

-- 1. Create enums (IF NOT EXISTS — idempotent)
DO $$ BEGIN
  CREATE TYPE "artist_application_status" AS ENUM ('pending', 'approved', 'rejected', 'info_requested');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "artist_application_brand" AS ENUM ('studios', 'tech');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create table
CREATE TABLE IF NOT EXISTS "artist_applications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "brand" "artist_application_brand" NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "bio" text NOT NULL,
  "portfolio_url" text,
  "focus_tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" "artist_application_status" NOT NULL DEFAULT 'pending',
  "submitted_at" timestamp NOT NULL DEFAULT now(),
  "reviewed_at" timestamp,
  "reviewed_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "reviewer_note" text
);

CREATE INDEX IF NOT EXISTS "idx_artist_applications_status" ON "artist_applications" ("status");
CREATE INDEX IF NOT EXISTS "idx_artist_applications_brand" ON "artist_applications" ("brand");
CREATE INDEX IF NOT EXISTS "idx_artist_applications_submitted_at" ON "artist_applications" ("submitted_at");

-- 3. Add newsletter_opt_in column to user (additive, safe)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "newsletter_opt_in" boolean NOT NULL DEFAULT false;

-- 4. Grandfather migration: every user that existed BEFORE this migration
-- ran is treated as already verified. Guarded by phase26_migration_meta so
-- re-running is a no-op.

CREATE TABLE IF NOT EXISTS "phase26_migration_meta" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

DO $$
DECLARE
  already_ran text;
BEGIN
  SELECT value INTO already_ran FROM "phase26_migration_meta" WHERE key = 'grandfather_email_verified';
  IF already_ran IS NULL THEN
    UPDATE "user" SET "emailVerified" = true WHERE "emailVerified" = false OR "emailVerified" IS NULL;
    INSERT INTO "phase26_migration_meta" (key, value) VALUES ('grandfather_email_verified', now()::text);
  END IF;
END $$;
