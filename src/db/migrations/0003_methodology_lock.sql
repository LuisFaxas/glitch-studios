-- Phase 15: Methodology Lock + Schema. See .planning/phases/15-methodology-lock-schema/.
-- Name reconciliation: this migration uses `tech_review_discipline_exclusions` (D-20 / METH-02),
--   NOT `tech_benchmark_exclusions` from ROADMAP wording. CONTEXT + REQUIREMENTS are authoritative.
-- Applied via direct postgres-js script (same pattern as 0002_glitch_tech_foundation.sql).
-- Safety guards (fail fast if assumptions break):
DO $$
BEGIN
  IF (SELECT count(*) FROM tech_benchmark_runs) > 0 THEN
    RAISE EXCEPTION 'tech_benchmark_runs is non-empty; Phase 15 assumed empty (D-10). Abort and backfill manually.';
  END IF;
  IF (SELECT count(*) FROM tech_reviews WHERE status = 'published' AND published_at IS NULL) > 0 THEN
    RAISE EXCEPTION 'tech_reviews has published rows with NULL published_at; backfill before CHECK applies (RESEARCH §P-2).';
  END IF;
END $$;

--> statement-breakpoint
CREATE TYPE "public"."benchmark_mode" AS ENUM('ac', 'battery', 'both');
--> statement-breakpoint
CREATE TYPE "public"."benchmark_discipline" AS ENUM('cpu', 'gpu', 'llm', 'video', 'dev', 'python', 'games', 'memory', 'storage', 'thermal', 'wireless', 'display', 'battery_life');
--> statement-breakpoint
CREATE TYPE "public"."bpr_tier" AS ENUM('platinum', 'gold', 'silver', 'bronze');
--> statement-breakpoint
CREATE TYPE "public"."discipline_exclusion_reason" AS ENUM('no_hardware', 'requires_license', 'device_class_exempt', 'test_failed');

--> statement-breakpoint
ALTER TABLE "tech_benchmark_tests" ADD COLUMN "discipline" "benchmark_discipline";
--> statement-breakpoint
ALTER TABLE "tech_benchmark_tests" ADD COLUMN "mode" "benchmark_mode" NOT NULL DEFAULT 'both';
--> statement-breakpoint
ALTER TABLE "tech_benchmark_tests" ADD COLUMN "bpr_eligible" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_tests" ADD COLUMN "min_ram_gb" integer;

--> statement-breakpoint
-- D-10 backfill: set discipline + mode on any pre-existing tech_benchmark_tests rows.
-- Preflight at revision time confirmed no seed file inserts into this table; expected
-- row count = 0. If rows exist (manual dev inserts), the heuristic below classifies
-- them by name; executor MUST inspect the preflight output from action step (a) and
-- hand-edit the WHEN clauses below if any existing name does not match the heuristic.
UPDATE "tech_benchmark_tests" SET
  "discipline" = CASE
    WHEN name ILIKE '%geekbench%' OR name ILIKE '%cinebench%' OR name ILIKE '%hyperfine%' OR name ILIKE '%ripgrep%' THEN 'cpu'::benchmark_discipline
    WHEN name ILIKE '%3dmark%' OR name ILIKE '%blender%' OR name ILIKE '%wild life%' OR name ILIKE '%steel nomad%' OR name ILIKE '%solar bay%' THEN 'gpu'::benchmark_discipline
    WHEN name ILIKE '%llama%' OR name ILIKE '%mlx%' OR name ILIKE '%tg128%' OR name ILIKE '%pp512%' THEN 'llm'::benchmark_discipline
    WHEN name ILIKE '%handbrake%' OR name ILIKE '%ffmpeg%' OR name ILIKE '%av1%' OR name ILIKE '%hevc%' OR name ILIKE '%h.264%' THEN 'video'::benchmark_discipline
    WHEN name ILIKE '%cargo%' OR name ILIKE '%xcodebuild%' OR name ILIKE '%tsc%' THEN 'dev'::benchmark_discipline
    WHEN name ILIKE '%pyperformance%' OR name ILIKE '%pytorch%' OR name ILIKE '%python%' THEN 'python'::benchmark_discipline
    WHEN name ILIKE '%baldur%' OR name ILIKE '%cyberpunk%' OR name ILIKE '%gptk%' THEN 'games'::benchmark_discipline
    WHEN name ILIKE '%stream%' OR name ILIKE '%triad%' OR name ILIKE '%memory%' THEN 'memory'::benchmark_discipline
    WHEN name ILIKE '%amorphous%' OR name ILIKE '%ssd%' OR name ILIKE '%disk%' OR name ILIKE '%seq read%' OR name ILIKE '%seq write%' THEN 'storage'::benchmark_discipline
    WHEN name ILIKE '%thermal%' OR name ILIKE '%stress-ng%' OR name ILIKE '%retention%' THEN 'thermal'::benchmark_discipline
    WHEN name ILIKE '%iperf%' OR name ILIKE '%wifi%' OR name ILIKE '%tb5%' OR name ILIKE '%thunderbolt%' THEN 'wireless'::benchmark_discipline
    WHEN name ILIKE '%display%' OR name ILIKE '%delta-e%' OR name ILIKE '%gamut%' OR name ILIKE '%lagom%' OR name ILIKE '%contrast%' THEN 'display'::benchmark_discipline
    WHEN name ILIKE '%battery%' OR name ILIKE '%standby%' OR name ILIKE '%drain%' THEN 'battery_life'::benchmark_discipline
    ELSE 'cpu'::benchmark_discipline  -- heuristic fallback; inspect if triggered
  END,
  "mode" = 'both'::benchmark_mode
WHERE "discipline" IS NULL;

--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "mode" "benchmark_mode" NOT NULL;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "run_uuid" uuid NOT NULL;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "rubric_version" text NOT NULL DEFAULT '1.1';
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "superseded" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "source_file" text;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "ingest_batch_id" uuid;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "ambient_temp_c" numeric(4,1);
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "macos_build" text;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "run_flagged" text;
--> statement-breakpoint
ALTER TABLE "tech_benchmark_runs" ADD COLUMN "permalink_url" text;

--> statement-breakpoint
ALTER TABLE "tech_reviews" ADD COLUMN "bpr_score" numeric(5,4);
--> statement-breakpoint
ALTER TABLE "tech_reviews" ADD COLUMN "bpr_tier" "bpr_tier";
--> statement-breakpoint
ALTER TABLE "tech_reviews" ADD COLUMN "rubric_version" text NOT NULL DEFAULT '1.1';

--> statement-breakpoint
ALTER TABLE "tech_reviews" ADD CONSTRAINT "tech_reviews_published_at_chk" CHECK ("status" != 'published' OR "published_at" IS NOT NULL);

--> statement-breakpoint
CREATE TABLE "tech_review_discipline_exclusions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "review_id" uuid NOT NULL,
  "discipline" "benchmark_discipline" NOT NULL,
  "reason" "discipline_exclusion_reason" NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "tech_review_discipline_exclusions"
  ADD CONSTRAINT "tech_review_discipline_exclusions_review_id_tech_reviews_id_fk"
  FOREIGN KEY ("review_id") REFERENCES "tech_reviews"("id") ON DELETE cascade;

--> statement-breakpoint
CREATE UNIQUE INDEX "tech_benchmark_tests_natural_key_uniq"
  ON "tech_benchmark_tests" ("template_id", "discipline", "mode", "name");

--> statement-breakpoint
CREATE UNIQUE INDEX "tech_benchmark_runs_live_uniq"
  ON "tech_benchmark_runs" ("product_id", "test_id", "mode", "run_uuid")
  WHERE "superseded" = false;

--> statement-breakpoint
CREATE UNIQUE INDEX "tech_review_discipline_exclusions_review_discipline_uniq"
  ON "tech_review_discipline_exclusions" ("review_id", "discipline");
