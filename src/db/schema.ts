import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  numeric,
  pgEnum,
} from "drizzle-orm/pg-core"

// Enums
export const serviceTypeEnum = pgEnum("service_type", [
  "studio_session",
  "mixing",
  "mastering",
  "video_production",
  "sfx",
  "graphic_design",
])

export const postStatusEnum = pgEnum("post_status", ["draft", "published"])

// Services table (BOOK-01)
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  type: serviceTypeEnum("type").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description").notNull(),
  priceLabel: text("price_label").notNull(),
  features: text("features").array(),
  ctaText: text("cta_text").default("Book Now"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Team members / artist profiles (PORT-03)
export const teamMembers = pgTable("team_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  role: text("role").notNull(),
  bio: text("bio").notNull(),
  photoUrl: text("photo_url"),
  socialLinks: text("social_links"),
  credits: text("credits"),
  featuredTrackUrl: text("featured_track_url"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Portfolio items (PORT-01, PORT-05)
export const portfolioItems = pgTable("portfolio_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  type: text("type").notNull(),
  category: text("category"),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  isYouTubeEmbed: boolean("is_youtube_embed").default(true),
  clientName: text("client_name"),
  challenge: text("challenge"),
  approach: text("approach"),
  result: text("result"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Blog categories (CONT-01)
export const blogCategories = pgTable("blog_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
})

// Blog posts (CONT-01)
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  categoryId: uuid("category_id").references(() => blogCategories.id),
  authorId: text("author_id"),
  status: postStatusEnum("status").default("draft"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Testimonials (BOOK-06)
export const testimonials = pgTable("testimonials", {
  id: uuid("id").defaultRandom().primaryKey(),
  clientName: text("client_name").notNull(),
  clientTitle: text("client_title"),
  quote: text("quote").notNull(),
  avatarUrl: text("avatar_url"),
  rating: integer("rating"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Contact submissions (BOOK-05)
export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  serviceInterest: text("service_interest"),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Newsletter subscribers (CONT-02)
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
})

// === Beat Store (Phase 2) ===
export const beatStatusEnum = pgEnum("beat_status", [
  "draft",
  "published",
  "sold_exclusive",
])
export const licenseTierEnum = pgEnum("license_tier", [
  "mp3_lease",
  "wav_lease",
  "stems",
  "unlimited",
  "exclusive",
])
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "completed",
  "refunded",
])

export const beats = pgTable("beats", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  bpm: integer("bpm").notNull(),
  key: text("key").notNull(),
  genre: text("genre").notNull(),
  moods: text("moods").array(),
  description: text("description"),
  coverArtKey: text("cover_art_key"),
  previewAudioKey: text("preview_audio_key"),
  wavFileKey: text("wav_file_key"),
  stemsZipKey: text("stems_zip_key"),
  midiFileKey: text("midi_file_key"),
  status: beatStatusEnum("status").default("draft"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const beatPricing = pgTable("beat_pricing", {
  id: uuid("id").defaultRandom().primaryKey(),
  beatId: uuid("beat_id")
    .references(() => beats.id, { onDelete: "cascade" })
    .notNull(),
  tier: licenseTierEnum("tier").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
})

export const beatProducers = pgTable("beat_producers", {
  id: uuid("id").defaultRandom().primaryKey(),
  beatId: uuid("beat_id")
    .references(() => beats.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  splitPercent: integer("split_percent").notNull(),
})

export const bundles = pgTable("bundles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  discountPercent: integer("discount_percent").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const bundleBeats = pgTable("bundle_beats", {
  id: uuid("id").defaultRandom().primaryKey(),
  bundleId: uuid("bundle_id")
    .references(() => bundles.id, { onDelete: "cascade" })
    .notNull(),
  beatId: uuid("beat_id")
    .references(() => beats.id, { onDelete: "cascade" })
    .notNull(),
})

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  guestEmail: text("guest_email"),
  stripeSessionId: text("stripe_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: orderStatusEnum("status").default("pending"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  beatId: uuid("beat_id")
    .references(() => beats.id)
    .notNull(),
  licenseTier: licenseTierEnum("license_tier").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  licensePdfKey: text("license_pdf_key"),
  downloadCount: integer("download_count").default(0),
})

export const licenseTierDefs = pgTable("license_tier_defs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tier: licenseTierEnum("tier").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  usageRights: text("usage_rights").array(),
  deliverables: text("deliverables").array(),
  sortOrder: integer("sort_order").default(0),
})
