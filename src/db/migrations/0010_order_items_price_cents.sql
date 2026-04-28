-- Phase 48 checkout proof repair.
-- Production order_items uses price_cents; keep environments aligned and
-- backfill safely from the older decimal price column when present.

ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "price_cents" integer;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'order_items'
      AND column_name = 'price'
  ) THEN
    UPDATE "order_items"
    SET "price_cents" = COALESCE("price_cents", ROUND(("price" * 100))::integer);
  END IF;
END $$;

UPDATE "order_items"
SET "price_cents" = 0
WHERE "price_cents" IS NULL;

ALTER TABLE "order_items"
  ALTER COLUMN "price_cents" SET NOT NULL;

ALTER TABLE "order_items"
  ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now() NOT NULL;
