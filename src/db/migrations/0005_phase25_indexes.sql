-- 0005_phase25_indexes.sql
-- Phase 25-02 — Performance Audit: add indexes on foreign-key columns
-- for high-traffic tables that previously had zero explicit indexes.
-- Every statement uses IF NOT EXISTS so the migration is idempotent.

CREATE INDEX IF NOT EXISTS "idx_account_user" ON "account" ("userId");

CREATE INDEX IF NOT EXISTS "idx_session_user" ON "session" ("userId");

CREATE INDEX IF NOT EXISTS "idx_blog_posts_category" ON "blog_posts" ("category_id");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_status" ON "blog_posts" ("status");
CREATE INDEX IF NOT EXISTS "idx_blog_posts_published_at" ON "blog_posts" ("published_at");

CREATE INDEX IF NOT EXISTS "idx_bundle_beats_bundle" ON "bundle_beats" ("bundle_id");
CREATE INDEX IF NOT EXISTS "idx_bundle_beats_beat" ON "bundle_beats" ("beat_id");

CREATE INDEX IF NOT EXISTS "idx_orders_user" ON "orders" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_orders_guest_email" ON "orders" ("guest_email");

CREATE INDEX IF NOT EXISTS "idx_order_items_order" ON "order_items" ("order_id");
CREATE INDEX IF NOT EXISTS "idx_order_items_beat" ON "order_items" ("beat_id");

CREATE INDEX IF NOT EXISTS "idx_bookings_user" ON "bookings" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_service" ON "bookings" ("service_id");
CREATE INDEX IF NOT EXISTS "idx_bookings_guest_email" ON "bookings" ("guest_email");
CREATE INDEX IF NOT EXISTS "idx_bookings_date" ON "bookings" ("date");

CREATE INDEX IF NOT EXISTS "idx_tech_reviews_product" ON "tech_reviews" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_tech_reviews_reviewer" ON "tech_reviews" ("reviewer_id");
CREATE INDEX IF NOT EXISTS "idx_tech_reviews_status" ON "tech_reviews" ("status");

CREATE INDEX IF NOT EXISTS "idx_tech_benchmark_runs_product" ON "tech_benchmark_runs" ("product_id");
CREATE INDEX IF NOT EXISTS "idx_tech_benchmark_runs_test" ON "tech_benchmark_runs" ("test_id");
