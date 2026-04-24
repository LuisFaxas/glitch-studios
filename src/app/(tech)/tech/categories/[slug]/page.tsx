import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { techCategories } from "@/db/schema"
import {
  getCategoryBySlug,
  getCategoryBreadcrumb,
  getCategoryDescendantIds,
  listChildCategories,
  listProductsForCategory,
} from "@/lib/tech/queries"
import { ReviewCard } from "@/components/tech/review-card"
import { CategoryProductTile } from "@/components/tech/category-product-tile"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { TechNewsletter } from "@/components/home/tech-newsletter"

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const rows = await db.select({ slug: techCategories.slug }).from(techCategories)
    return rows
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: "Category Not Found" }
  return {
    title: `${category.name} — Glitch Tech`,
    description: `Reviews and products in ${category.name}.`,
  }
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const [breadcrumbs, children, descendantIds] = await Promise.all([
    getCategoryBreadcrumb(category.id),
    listChildCategories(category.id),
    getCategoryDescendantIds(slug),
  ])
  const products = await listProductsForCategory(descendantIds)

  const reviewed = products.filter((p) => p.reviewSlug)
  const unreviewed = products.filter((p) => !p.reviewSlug)

  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-8 md:px-6 md:pt-24">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.05em] text-[#555]">
            <li>
              <Link href="/tech/categories" className="hover:text-[#f5f5f0]">Categories</Link>
            </li>
            {breadcrumbs.map((node, idx) => (
              <li key={node.id} className="flex items-center gap-2">
                <span aria-hidden="true">/</span>
                {idx === breadcrumbs.length - 1 ? (
                  <span aria-current="page" className="text-[#888]">{node.name}</span>
                ) : (
                  <Link href={`/tech/categories/${node.slug}`} className="hover:text-[#f5f5f0]">{node.name}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="font-mono text-4xl font-bold uppercase tracking-tight text-[#f5f5f0] md:text-5xl">
          <GlitchHeading text={category.name}>{category.name}</GlitchHeading>
        </h1>
        <p className="mt-3 font-mono text-[13px] uppercase tracking-[0.05em] text-[#888]">
          {reviewed.length} review{reviewed.length === 1 ? "" : "s"}
          {" · "}
          {products.length} product{products.length === 1 ? "" : "s"}
        </p>

        {children.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {children.map((c) => (
              <Link
                key={c.id}
                href={`/tech/categories/${c.slug}`}
                className="border border-[#222] bg-[#111] px-4 py-2 font-mono text-[13px] uppercase tracking-[0.05em] text-[#888] transition-colors hover:border-[#444] hover:text-[#f5f5f0]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      {reviewed.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
            Reviews
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reviewed.map((p) => (
              <ReviewCard
                key={p.id}
                review={{
                  id: p.id,
                  slug: p.reviewSlug!,
                  title: p.name,
                  overallRating: p.reviewOverallRating ?? 0,
                  heroImageUrl: p.heroImageUrl ?? "",
                  heroImageAlt: p.heroImageAlt,
                  productName: p.name,
                  productSlug: p.slug,
                  categoryName: category.name,
                  categorySlug: category.slug,
                  publishedAt: new Date(),
                  excerpt: p.manufacturer ?? "",
                  bprScore: null,
                  bprTier: null,
                  bprDisciplineCount: 0,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {unreviewed.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
          <h2 className="mb-2 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
            Products — no reviews yet
          </h2>
          <p className="mb-6 font-sans text-[13px] text-[#888]">
            We&apos;ve catalogued {unreviewed.length} product{unreviewed.length === 1 ? "" : "s"} in this category but haven&apos;t reviewed {unreviewed.length === 1 ? "it" : "them"} yet.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unreviewed.map((p) => (
              <CategoryProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {products.length === 0 && (
        <section className="mx-auto max-w-7xl px-4 py-20 text-center md:px-6">
          <h2 className="font-mono text-xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
            Nothing here yet
          </h2>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-[#888]">
            We haven&apos;t reviewed anything in {category.name} yet. Browse other categories or check back soon.
          </p>
          <Link
            href="/tech/categories"
            className="mt-6 inline-flex items-center gap-2 border border-[#f5f5f0] bg-transparent px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-black"
          >
            Back to all categories
          </Link>
        </section>
      )}

      <TechNewsletter />
    </main>
  )
}
