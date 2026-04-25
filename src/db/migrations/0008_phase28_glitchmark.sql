-- Phase 28 — GlitchMark System
-- Adds:
--   1. 4 nullable GlitchMark columns on tech_reviews
--   2. Nullable reference_score column on tech_benchmark_tests
--   3. tech_glitchmark_history table for v1/v2/etc preservation
--
-- Idempotent: every column add and table create uses IF NOT EXISTS.
-- Per CONTEXT D-08 / D-09 / D-10. Per CONTEXT out-of-scope: NO baseline
-- data is populated here. Operator sets reference_score per test post-deploy
-- via SQL UPDATE once real benchmark data exists.

-- 1. tech_reviews — 4 GlitchMark columns
ALTER TABLE "tech_reviews"
  ADD COLUMN IF NOT EXISTS "glitchmark_score" numeric(7,2);
ALTER TABLE "tech_reviews"
  ADD COLUMN IF NOT EXISTS "glitchmark_test_count" integer;
ALTER TABLE "tech_reviews"
  ADD COLUMN IF NOT EXISTS "glitchmark_is_partial" boolean;
ALTER TABLE "tech_reviews"
  ADD COLUMN IF NOT EXISTS "glitchmark_version" text;

-- 2. tech_benchmark_tests — reference_score for normalization
ALTER TABLE "tech_benchmark_tests"
  ADD COLUMN IF NOT EXISTS "reference_score" numeric(14,4);

-- 3. tech_glitchmark_history — append-only history per (review, version)
CREATE TABLE IF NOT EXISTS "tech_glitchmark_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "review_id" uuid NOT NULL REFERENCES "tech_reviews"("id") ON DELETE CASCADE,
  "version" text NOT NULL,
  "score" numeric(7,2),
  "test_count" integer,
  "is_partial" boolean,
  "formula_notes" text,
  "computed_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "tech_glitchmark_history_review_version_uniq"
  ON "tech_glitchmark_history" ("review_id", "version");
CREATE INDEX IF NOT EXISTS "idx_tech_glitchmark_history_version"
  ON "tech_glitchmark_history" ("version");

-- 4. phase28_migration_meta — placeholder for future one-shot operations
--    (e.g. v1→v2 history backfill in a later phase). Created here so the
--    Phase 26/27 idempotency pattern is preserved for downstream changes.
CREATE TABLE IF NOT EXISTS "phase28_migration_meta" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
