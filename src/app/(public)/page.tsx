export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { services, testimonials, portfolioItems } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { HeroSection } from "@/components/home/hero-section"
import { ServicesOverview } from "@/components/home/services-overview"
import { FeaturedCarousel } from "@/components/home/featured-carousel"
import { VideoPortfolioCarousel } from "@/components/home/video-portfolio-carousel"
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel"
import { getPublicHomepageSections } from "@/actions/admin-homepage"

function parseConfig(config: string | null) {
  try {
    return JSON.parse(config || "{}")
  } catch {
    return {}
  }
}

export default async function HomePage() {
  const [servicesResult, testimonialsResult, portfolioResult, homepageSectionsResult] =
    await Promise.allSettled([
      db
        .select()
        .from(services)
        .where(eq(services.isActive, true))
        .orderBy(asc(services.sortOrder)),
      db
        .select()
        .from(testimonials)
        .where(eq(testimonials.isActive, true))
        .orderBy(asc(testimonials.sortOrder)),
      db
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.isActive, true))
        .orderBy(asc(portfolioItems.sortOrder)),
      getPublicHomepageSections(),
    ])

  const servicesList =
    servicesResult.status === "fulfilled" ? servicesResult.value : []
  const testimonialsList =
    testimonialsResult.status === "fulfilled" ? testimonialsResult.value : []
  const portfolioList =
    portfolioResult.status === "fulfilled" ? portfolioResult.value : []
  const homepageSections =
    homepageSectionsResult.status === "fulfilled"
      ? homepageSectionsResult.value
      : []

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

  // Section renderer map
  const sectionRenderers: Record<string, (config: Record<string, unknown>) => React.ReactNode> = {
    hero: (config) => (
      <HeroSection
        title={config.title as string | undefined}
        subtitle={config.subtitle as string | undefined}
        ctaText={config.ctaText as string | undefined}
        ctaLink={config.ctaLink as string | undefined}
        backgroundMediaUrl={config.backgroundMediaUrl as string | undefined}
      />
    ),
    featured_beats: (config) => (
      <FeaturedCarousel
        beatIds={
          Array.isArray(config.beatIds) && config.beatIds.length > 0
            ? (config.beatIds as string[])
            : undefined
        }
      />
    ),
    services: () => <ServicesOverview services={servicesList} />,
    portfolio: () => <VideoPortfolioCarousel portfolioItems={portfolioList} />,
    testimonials: () => <TestimonialsCarousel testimonials={testimonialsList} />,
  }

  // If homepage sections exist in DB, render dynamically
  const useDynamicLayout = homepageSections.length > 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {useDynamicLayout ? (
        homepageSections.map((section) => {
          const renderer = sectionRenderers[section.sectionType]
          if (!renderer) return null
          const config = parseConfig(section.config)
          return (
            <div key={section.id}>{renderer(config)}</div>
          )
        })
      ) : (
        <>
          <HeroSection />
          <ServicesOverview services={servicesList} />
          <FeaturedCarousel />
          <VideoPortfolioCarousel portfolioItems={portfolioList} />
          <TestimonialsCarousel testimonials={testimonialsList} />
        </>
      )}
    </>
  )
}
