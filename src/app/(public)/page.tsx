export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { getPublicUrl } from "@/lib/r2"
import { services, testimonials, portfolioItems, beats, blogPosts } from "@/db/schema"
import { eq, asc, desc } from "drizzle-orm"
import { HeroSection } from "@/components/home/hero-section"
import { ServicesOverview } from "@/components/home/services-overview"
import { FeaturedCarousel } from "@/components/home/featured-carousel"
import { VideoPortfolioCarousel } from "@/components/home/video-portfolio-carousel"
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel"
import { BlogSection } from "@/components/home/blog-section"
import { SplashOverlay } from "@/components/home/splash-overlay"
import { HomepageScrollWatcher } from "@/components/home/homepage-scroll-watcher"
import { getPublicHomepageSections } from "@/actions/admin-homepage"

function parseConfig(config: string | null) {
  try {
    return JSON.parse(config || "{}")
  } catch {
    return {}
  }
}

export default async function HomePage() {
  const [servicesResult, testimonialsResult, portfolioResult, homepageSectionsResult, beatsResult, blogResult] =
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
      db
        .select()
        .from(beats)
        .where(eq(beats.status, "published"))
        .orderBy(desc(beats.createdAt))
        .limit(6),
      db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.status, "published"))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(3),
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
  const beatsRaw =
    beatsResult.status === "fulfilled" ? beatsResult.value : []
  const beatsList = beatsRaw.map((b) => ({
    ...b,
    coverArtUrl: b.coverArtKey ? getPublicUrl(b.coverArtKey) : null,
  }))
  const blogList =
    blogResult.status === "fulfilled" ? blogResult.value : []

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
    featured_beats: () => (
      <FeaturedCarousel beats={beatsList} />
    ),
    services: () => <ServicesOverview services={servicesList} />,
    portfolio: () => <VideoPortfolioCarousel portfolioItems={portfolioList} />,
    testimonials: () => <TestimonialsCarousel testimonials={testimonialsList} />,
    blog: () => <BlogSection posts={blogList} />,
  }

  // If homepage sections exist in DB, render dynamically
  const useDynamicLayout = homepageSections.length > 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HomepageScrollWatcher />
      <SplashOverlay>
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
            <FeaturedCarousel beats={beatsList} />
            <VideoPortfolioCarousel portfolioItems={portfolioList} />
            <TestimonialsCarousel testimonials={testimonialsList} />
            <BlogSection posts={blogList} />
          </>
        )}
      </SplashOverlay>
    </>
  )
}
