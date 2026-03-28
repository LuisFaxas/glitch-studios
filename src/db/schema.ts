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
import { relations } from "drizzle-orm"

// Better Auth tables (must match DB schema created by Better Auth migrations)
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false),
  image: text("image"),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("banReason"),
  banExpires: timestamp("banExpires"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonatedBy"),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// Enums
export const serviceTypeEnum = pgEnum("service_type", [
  "studio_session",
  "mixing",
  "mastering",
  "video_production",
  "sfx",
  "graphic_design",
])

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "scheduled",
  "published",
])

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
  scheduledAt: timestamp("scheduled_at"),
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
  serviceType: text("service_type"),
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
  tags: text("tags").array(),
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
  status: orderStatusEnum("status").default("pending"),
  totalCents: integer("total_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// === Booking System (Phase 3) ===

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "no_show",
])

export const depositTypeEnum = pgEnum("deposit_type", [
  "percentage",
  "flat",
])

export const refundPolicyEnum = pgEnum("refund_policy", [
  "full",
  "partial",
  "none",
])

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  features: text("features").array(),
  photos: text("photos").array(),
  hourlyRateOverride: numeric("hourly_rate_override", {
    precision: 10,
    scale: 2,
  }),
  bufferMinutes: integer("buffer_minutes").default(15),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const serviceBookingConfig = pgTable("service_booking_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .references(() => services.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  durationMinutes: integer("duration_minutes").notNull(),
  depositType: depositTypeEnum("deposit_type").default("percentage"),
  depositValue: numeric("deposit_value", { precision: 10, scale: 2 }).notNull(),
  autoConfirm: boolean("auto_confirm").default(true),
  cancellationWindowHours: integer("cancellation_window_hours").default(48),
  refundPolicy: refundPolicyEnum("refund_policy").default("full"),
  maxAdvanceBookingDays: integer("max_advance_booking_days").default(90),
  prepInstructions: text("prep_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const weeklyAvailability = pgTable("weekly_availability", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").default(true),
})

export const availabilityOverrides = pgTable("availability_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  roomId: uuid("room_id")
    .references(() => rooms.id, { onDelete: "cascade" })
    .notNull(),
  date: text("date").notNull(),
  isClosed: boolean("is_closed").default(false),
  startTime: text("start_time"),
  endTime: text("end_time"),
  reason: text("reason"),
})

export const sessionPackages = pgTable("session_packages", {
  id: uuid("id").defaultRandom().primaryKey(),
  serviceId: uuid("service_id")
    .references(() => services.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  sessionCount: integer("session_count").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const bookingSeries = pgTable("booking_series", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  guestEmail: text("guest_email"),
  serviceId: uuid("service_id")
    .references(() => services.id)
    .notNull(),
  roomId: uuid("room_id")
    .references(() => rooms.id)
    .notNull(),
  packageId: uuid("package_id"),
  totalSessions: integer("total_sessions").notNull(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  stripeSessionId: text("stripe_session_id"),
  totalPaid: numeric("total_paid", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  seriesId: uuid("series_id").references(() => bookingSeries.id, {
    onDelete: "set null",
  }),
  serviceId: uuid("service_id")
    .references(() => services.id)
    .notNull(),
  roomId: uuid("room_id")
    .references(() => rooms.id)
    .notNull(),
  userId: text("user_id"),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull(),
  notes: text("notes"),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  status: bookingStatusEnum("status").default("pending"),
  depositAmount: numeric("deposit_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  cancelledAt: timestamp("cancelled_at"),
  cancelledBy: text("cancelled_by"),
  cancellationReason: text("cancellation_reason"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// === Admin Dashboard & Email (Phase 4) ===

// Blog tags (D-06)
export const blogTags = pgTable("blog_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const blogPostTags = pgTable("blog_post_tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  postId: uuid("post_id")
    .notNull()
    .references(() => blogPosts.id, { onDelete: "cascade" }),
  tagId: uuid("tag_id")
    .notNull()
    .references(() => blogTags.id, { onDelete: "cascade" }),
})

// Media library (D-09, D-10)
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  filename: text("filename").notNull(),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  alt: text("alt"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Homepage sections (D-11, D-12)
export const homepageSections = pgTable("homepage_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionType: text("section_type").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").default(true),
  config: text("config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// Contact replies (D-13, MAIL-05)
export const contactReplies = pgTable("contact_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => contactSubmissions.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  sentBy: text("sent_by").notNull(),
})

// Newsletter broadcasts (D-15, D-17)
export const newsletterBroadcasts = pgTable("newsletter_broadcasts", {
  id: uuid("id").defaultRandom().primaryKey(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  segment: text("segment").notNull().default("all"),
  recipientCount: integer("recipient_count").notNull().default(0),
  status: text("status").default("sent"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  sentBy: text("sent_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Site settings (ADMN-05)
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

// RBAC (D-18, D-19, D-20)
export const adminRoles = pgTable("admin_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const adminRolePermissions = pgTable("admin_role_permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  roleId: uuid("role_id")
    .notNull()
    .references(() => adminRoles.id, { onDelete: "cascade" }),
  permission: text("permission").notNull(),
})

// === Drizzle Relations (Phase 4) ===

export const adminRolesRelations = relations(adminRoles, ({ many }) => ({
  permissions: many(adminRolePermissions),
}))

export const adminRolePermissionsRelations = relations(
  adminRolePermissions,
  ({ one }) => ({
    role: one(adminRoles, {
      fields: [adminRolePermissions.roleId],
      references: [adminRoles.id],
    }),
  })
)

export const blogPostsRelations = relations(blogPosts, ({ many }) => ({
  postTags: many(blogPostTags),
}))

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  postTags: many(blogPostTags),
}))

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
}))

export const contactSubmissionsRelations = relations(
  contactSubmissions,
  ({ many }) => ({
    replies: many(contactReplies),
  })
)

export const contactRepliesRelations = relations(
  contactReplies,
  ({ one }) => ({
    submission: one(contactSubmissions, {
      fields: [contactReplies.submissionId],
      references: [contactSubmissions.id],
    }),
  })
)
