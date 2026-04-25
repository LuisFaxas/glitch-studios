-- Phase 27 — Media/Video Strategy Foundation
-- Adds polymorphic media_item table + backfills existing video_url values
-- from portfolio_items and tech_reviews into media_item rows (is_primary=true).
--
-- Per CONTEXT D-07: video_url columns on portfolio_items and tech_reviews
-- are intentionally NOT dropped here. Read-time fallback for one release;
-- drop scheduled for a follow-up cleanup phase.

-- 1. Enum (idempotent — re-running is safe)
DO $$ BEGIN
  CREATE TYPE "media_kind" AS ENUM ('youtube_video', 'instagram_post');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Table
CREATE TABLE IF NOT EXISTS "media_item" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "kind" "media_kind" NOT NULL,
  "external_id" text NOT NULL,
  "external_url" text NOT NULL,
  "title" text,
  "description" text,
  "thumbnail_url" text,
  "duration_sec" integer,
  "attached_to_type" text NOT NULL,
  "attached_to_id" uuid NOT NULL,
  "is_primary" boolean NOT NULL DEFAULT false,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_by" text REFERENCES "user"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_media_item_attachment"
  ON "media_item" ("attached_to_type", "attached_to_id");
CREATE INDEX IF NOT EXISTS "idx_media_item_kind_external"
  ON "media_item" ("kind", "external_id");

-- 3. One-shot backfill guard (Phase 26 pattern)
CREATE TABLE IF NOT EXISTS "phase27_migration_meta" (
  "key" text PRIMARY KEY,
  "value" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

DO $$
DECLARE
  already_ran text;
BEGIN
  SELECT value INTO already_ran
    FROM "phase27_migration_meta"
    WHERE key = 'backfill_video_url';
  IF already_ran IS NULL THEN
    -- portfolio_items.video_url -> media_item rows
    INSERT INTO "media_item"
      (kind, external_id, external_url, attached_to_type, attached_to_id, is_primary)
    SELECT
      'youtube_video',
      substring(p.video_url FROM '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})'),
      p.video_url,
      'portfolio_item',
      p.id,
      true
    FROM "portfolio_items" p
    WHERE p.video_url IS NOT NULL
      AND p.video_url <> ''
      AND p.video_url ~ '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})';

    -- tech_reviews.video_url -> media_item rows
    INSERT INTO "media_item"
      (kind, external_id, external_url, attached_to_type, attached_to_id, is_primary)
    SELECT
      'youtube_video',
      substring(r.video_url FROM '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})'),
      r.video_url,
      'tech_review',
      r.id,
      true
    FROM "tech_reviews" r
    WHERE r.video_url IS NOT NULL
      AND r.video_url <> ''
      AND r.video_url ~ '(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([A-Za-z0-9_-]{11})';

    INSERT INTO "phase27_migration_meta" (key, value)
      VALUES ('backfill_video_url', now()::text);
  END IF;
END $$;
