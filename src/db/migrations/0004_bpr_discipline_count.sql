-- 0004_bpr_discipline_count.sql
-- Phase 17 — BPR medal UI + methodology page
-- Add bpr_discipline_count to tech_reviews so UI can render
-- "Based on X of 7 eligible disciplines." without recomputing.

ALTER TABLE "tech_reviews"
  ADD COLUMN "bpr_discipline_count" integer NOT NULL DEFAULT 0;
