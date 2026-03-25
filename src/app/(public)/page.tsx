export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { services, testimonials, portfolioItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { HeroSection } from "@/components/home/hero-section"
import { ServicesOverview } from "@/components/home/services-overview"
import { FeaturedCarousel } from "@/components/home/featured-carousel"
import { VideoPortfolioCarousel } from "@/components/home/video-portfolio-carousel"
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel"

export default async function HomePage() {
  const [servicesResult, testimonialsResult, portfolioResult] = await Promise.allSettled([
    db.select().from(services).where(eq(services.isActive, true)).orderBy(asc(services.sortOrder)),
    db.select().from(testimonials).where(eq(testimonials.isActive, true)).orderBy(asc(testimonials.sortOrder)),
    db.select().from(portfolioItems).where(eq(portfolioItems.isActive, true)).orderBy(asc(portfolioItems.sortOrder)),
  ])

  const servicesList = servicesResult.status === "fulfilled" ? servicesResult.value : []
  const testimonialsList = testimonialsResult.status === "fulfilled" ? testimonialsResult.value : []
  const portfolioList = portfolioResult.status === "fulfilled" ? portfolioResult.value : []

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Glitch Studios",
    description:
      "Music and video production studio offering studio sessions, mixing & mastering, video production, SFX design, and graphic design.",
    url: "https://glitchstudios.com",
    logo: "https://glitchstudios.com/logo.png",
    sameAs: [],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HeroSection />
      <ServicesOverview services={servicesList} />
      <FeaturedCarousel />
      <VideoPortfolioCarousel portfolioItems={portfolioList} />
      <TestimonialsCarousel testimonials={testimonialsList} />
    </>
  )
}
