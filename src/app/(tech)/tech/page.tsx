import type { Metadata } from "next"
import {
  getLatestPublishedReviews,
  listTopLevelCategoriesWithCounts,
  getBenchmarkSpotlight,
} from "@/lib/tech/queries"
import { TechHeroSection } from "@/components/home/tech-hero-section"
import { TechFeaturedReviewsCarousel } from "@/components/home/tech-featured-reviews-carousel"
import { TechCategoryTiles } from "@/components/home/tech-category-tiles"
import { TechBenchmarkSpotlight } from "@/components/home/tech-benchmark-spotlight"
import { TechCompareCta } from "@/components/home/tech-compare-cta"
import { TechNewsletter } from "@/components/home/tech-newsletter"
import { HomepageScrollWatcher } from "@/components/home/homepage-scroll-watcher"

export const metadata: Metadata = {
  title: "Glitch Tech",
  description:
    "Product reviews, benchmarks, and comparisons from Glitch Studios. Covering computers, audio, and peripherals.",
}

export const revalidate = 300

export default async function TechHomePage() {
  const [featuredReviews, categories, spotlight] = await Promise.all([
    getLatestPublishedReviews(3),
    listTopLevelCategoriesWithCounts(),
    getBenchmarkSpotlight(),
  ])

  return (
    <>
      <HomepageScrollWatcher />
      <TechHeroSection />
      <TechFeaturedReviewsCarousel reviews={featuredReviews} />
      <TechCategoryTiles categories={categories} />
      <TechBenchmarkSpotlight spotlight={spotlight} />
      <TechCompareCta />
      <TechNewsletter />
    </>
  )
}
