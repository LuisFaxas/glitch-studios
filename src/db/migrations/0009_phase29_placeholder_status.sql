-- Phase 29 — Master Leaderboard
-- Adds 'placeholder' to tech_review_status enum so seed reviews can render
-- on the leaderboard without leaking to /tech/reviews, sitemap, homepage carousels,
-- review detail, or getBenchmarkSpotlight.
--
-- Idempotent: ALTER TYPE ... ADD VALUE IF NOT EXISTS is supported in Postgres 12+.
-- IMPORTANT: this statement cannot share a transaction with subsequent statements
-- that USE the new enum value. The runner script issues it standalone.

ALTER TYPE "tech_review_status" ADD VALUE IF NOT EXISTS 'placeholder';

-- Phase29 idempotency record (parity with Phase 27/28 pattern).
CREATE TABLE IF NOT EXISTS "phase29_migration_meta" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

INSERT INTO "phase29_migration_meta" ("key", "value")
VALUES ('placeholder_status_added', 'true')
ON CONFLICT ("key") DO NOTHING;
