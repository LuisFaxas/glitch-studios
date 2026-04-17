import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Review",
    description: "Glitch Tech product review.",
  }
}

export default async function TechReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <main className="min-h-screen bg-black">
      <section className="mx-auto max-w-7xl px-4 py-24">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-4xl">
          Review: {slug}
        </h1>
        <p className="mt-4 font-sans text-sm text-[#888]">
          Placeholder detail page — template filled in Phase 07.6.
        </p>
      </section>
    </main>
  )
}
