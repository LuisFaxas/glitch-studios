export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { services, testimonials, portfolioItems, blogPosts } from "@/db/schema"
import { eq, asc, desc } from "drizzle-orm"
import { getPublishedBeats } from "@/actions/beats"
import { StudiosHeroSection } from "@/components/home/studios-hero-section"
import { ServicesOverview } from "@/components/home/services-overview"
import { FeaturedCarousel } from "@/components/home/featured-carousel"
import { HomeFeaturedWorkGrid } from "@/components/media/home-featured-work-grid"
import { TestimonialsCarousel } from "@/components/home/testimonials-carousel"
import { BlogSection } from "@/components/home/blog-section"
import { GlitchTechPromoSection } from "@/components/home/glitch-tech-promo-section"
import { SplashOverlay } from "@/components/home/splash-overlay"
import { HomepageScrollWatcher } from "@/components/home/homepage-scroll-watcher"
import { getPublicHomepageSections } from "@/actions/admin-homepage"
import { getSplashMode } from "@/lib/get-splash-mode"

function parseConfig(config: string | null) {
  try {
    return JSON.parse(config || "{}")
  } catch {
    return {}
  }
}

export default async function HomePage() {
  const splashMode = await getSplashMode()
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
      getPublishedBeats(),
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
  const beatsList =
    beatsResult.status === "fulfilled" ? beatsResult.value : []
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
      <StudiosHeroSection
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
    portfolio: () => <HomeFeaturedWorkGrid />,
    glitch_tech_promo: () => <GlitchTechPromoSection />,
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
      <SplashOverlay mode={splashMode} brand="studios">
        {useDynamicLayout ? (
          <>
            {homepageSections.map((section, idx) => {
              const renderer = sectionRenderers[section.sectionType]
              if (!renderer) return null
              const config = parseConfig(section.config)
              const isPortfolio = section.sectionType === "portfolio"
              const next = homepageSections[idx + 1]
              const injectPromoAfter =
                isPortfolio &&
                (!next || next.sectionType === "testimonials") &&
                !homepageSections.some((s) => s.sectionType === "glitch_tech_promo")
              return (
                <div key={section.id}>
                  {renderer(config)}
                  {injectPromoAfter && <GlitchTechPromoSection />}
                </div>
              )
            })}
            {/* Fallback: if no portfolio section exists, still render the promo once so TECH-03 holds */}
            {!homepageSections.some(
              (s) => s.sectionType === "portfolio" || s.sectionType === "glitch_tech_promo",
            ) && <GlitchTechPromoSection />}
          </>
        ) : (
          <>
            <StudiosHeroSection />
            <ServicesOverview services={servicesList} />
            <FeaturedCarousel beats={beatsList} />
            <HomeFeaturedWorkGrid />
            <GlitchTechPromoSection />
            <TestimonialsCarousel testimonials={testimonialsList} />
            <BlogSection posts={blogList} />
          </>
        )}
      </SplashOverlay>
    </>
  )
}
