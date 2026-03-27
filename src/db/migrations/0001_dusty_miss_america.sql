CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."deposit_type" AS ENUM('percentage', 'flat');--> statement-breakpoint
CREATE TYPE "public"."refund_policy" AS ENUM('full', 'partial', 'none');--> statement-breakpoint
CREATE TABLE "availability_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"date" text NOT NULL,
	"is_closed" boolean DEFAULT false,
	"start_time" text,
	"end_time" text,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "booking_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"guest_email" text,
	"service_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"package_id" uuid,
	"total_sessions" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"stripe_session_id" text,
	"total_paid" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"series_id" uuid,
	"service_id" uuid NOT NULL,
	"room_id" uuid NOT NULL,
	"user_id" text,
	"guest_name" text NOT NULL,
	"guest_email" text NOT NULL,
	"guest_phone" text NOT NULL,
	"notes" text,
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"status" "booking_status" DEFAULT 'pending',
	"deposit_amount" numeric(10, 2) NOT NULL,
	"total_price" numeric(10, 2) NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"cancelled_at" timestamp,
	"cancelled_by" text,
	"cancellation_reason" text,
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"features" text[],
	"photos" text[],
	"hourly_rate_override" numeric(10, 2),
	"buffer_minutes" integer DEFAULT 15,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rooms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service_booking_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"duration_minutes" integer NOT NULL,
	"deposit_type" "deposit_type" DEFAULT 'percentage',
	"deposit_value" numeric(10, 2) NOT NULL,
	"auto_confirm" boolean DEFAULT true,
	"cancellation_window_hours" integer DEFAULT 48,
	"refund_policy" "refund_policy" DEFAULT 'full',
	"max_advance_booking_days" integer DEFAULT 90,
	"prep_instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_booking_config_service_id_unique" UNIQUE("service_id")
);
--> statement-breakpoint
CREATE TABLE "session_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" uuid NOT NULL,
	"name" text NOT NULL,
	"session_count" integer NOT NULL,
	"discount_percent" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
ALTER TABLE "availability_overrides" ADD CONSTRAINT "availability_overrides_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_series" ADD CONSTRAINT "booking_series_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_series_id_booking_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."booking_series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_booking_config" ADD CONSTRAINT "service_booking_config_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_packages" ADD CONSTRAINT "session_packages_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_availability" ADD CONSTRAINT "weekly_availability_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;