-- Phase 48.4 — Services mono-stack redesign.
-- Adds 'photography' to the service_type enum so Photography can become the
-- 7th service (audio -> visual -> custom order).
--
-- Idempotent: ALTER TYPE ... ADD VALUE IF NOT EXISTS is supported in Postgres 12+.
-- IMPORTANT: ALTER TYPE ... ADD VALUE cannot share a transaction with statements
-- that USE the new enum value. This file contains ONLY the enum addition; the
-- Photography row upsert + sortOrder reorder run as separate post-commit
-- statements in scripts/run-phase48-4-photography-migration.ts.

ALTER TYPE "service_type" ADD VALUE IF NOT EXISTS 'photography';
