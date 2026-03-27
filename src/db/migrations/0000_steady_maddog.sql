CREATE TYPE "public"."beat_status" AS ENUM('draft', 'published', 'sold_exclusive');--> statement-breakpoint
CREATE TYPE "public"."license_tier" AS ENUM('mp3_lease', 'wav_lease', 'stems', 'unlimited', 'exclusive');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'completed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('studio_session', 'mixing', 'mastering', 'video_production', 'sfx', 'graphic_design');--> statement-breakpoint
CREATE TABLE "beat_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beat_id" uuid NOT NULL,
	"tier" "license_tier" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "beat_producers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"beat_id" uuid NOT NULL,
	"name" text NOT NULL,
	"split_percent" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"bpm" integer NOT NULL,
	"key" text NOT NULL,
	"genre" text NOT NULL,
	"moods" text[],
	"description" text,
	"cover_art_key" text,
	"preview_audio_key" text,
	"wav_file_key" text,
	"stems_zip_key" text,
	"midi_file_key" text,
	"status" "beat_status" DEFAULT 'draft',
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "beats_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image_url" text,
	"category_id" uuid,
	"author_id" text,
	"status" "post_status" DEFAULT 'draft',
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "bundle_beats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bundle_id" uuid NOT NULL,
	"beat_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"discount_percent" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bundles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"service_interest" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "license_tier_defs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "license_tier" NOT NULL,
	"display_name" text NOT NULL,
	"description" text,
	"usage_rights" text[],
	"deliverables" text[],
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "license_tier_defs_tier_unique" UNIQUE("tier")
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"beat_id" uuid NOT NULL,
	"license_tier" "license_tier" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"license_pdf_key" text,
	"download_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"guest_email" text,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"status" "order_status" DEFAULT 'pending',
	"total_amount" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"type" text NOT NULL,
	"category" text,
	"description" text,
	"thumbnail_url" text,
	"video_url" text,
	"is_youtube_embed" boolean DEFAULT true,
	"client_name" text,
	"challenge" text,
	"approach" text,
	"result" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portfolio_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "service_type" NOT NULL,
	"description" text NOT NULL,
	"short_description" text NOT NULL,
	"price_label" text NOT NULL,
	"features" text[],
	"cta_text" text DEFAULT 'Book Now',
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "services_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"role" text NOT NULL,
	"bio" text NOT NULL,
	"photo_url" text,
	"social_links" text,
	"credits" text,
	"featured_track_url" text,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"client_title" text,
	"quote" text NOT NULL,
	"avatar_url" text,
	"rating" integer,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "beat_pricing" ADD CONSTRAINT "beat_pricing_beat_id_beats_id_fk" FOREIGN KEY ("beat_id") REFERENCES "public"."beats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beat_producers" ADD CONSTRAINT "beat_producers_beat_id_beats_id_fk" FOREIGN KEY ("beat_id") REFERENCES "public"."beats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_beats" ADD CONSTRAINT "bundle_beats_bundle_id_bundles_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bundle_beats" ADD CONSTRAINT "bundle_beats_beat_id_beats_id_fk" FOREIGN KEY ("beat_id") REFERENCES "public"."beats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_beat_id_beats_id_fk" FOREIGN KEY ("beat_id") REFERENCES "public"."beats"("id") ON DELETE no action ON UPDATE no action;