import type { InferSelectModel, InferInsertModel } from "drizzle-orm"
import type {
  services,
  teamMembers,
  portfolioItems,
  blogPosts,
  blogCategories,
  testimonials,
  contactSubmissions,
  newsletterSubscribers,
} from "@/db/schema"

export type Service = InferSelectModel<typeof services>
export type NewService = InferInsertModel<typeof services>
export type TeamMember = InferSelectModel<typeof teamMembers>
export type NewTeamMember = InferInsertModel<typeof teamMembers>
export type PortfolioItem = InferSelectModel<typeof portfolioItems>
export type NewPortfolioItem = InferInsertModel<typeof portfolioItems>
export type BlogPost = InferSelectModel<typeof blogPosts>
export type NewBlogPost = InferInsertModel<typeof blogPosts>
export type BlogCategory = InferSelectModel<typeof blogCategories>
export type Testimonial = InferSelectModel<typeof testimonials>
export type ContactSubmission = InferSelectModel<typeof contactSubmissions>
export type NewsletterSubscriber = InferSelectModel<
  typeof newsletterSubscribers
>
