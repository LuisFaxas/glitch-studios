export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { techReviews } from "@/db/schema"
import { eq } from "drizzle-orm"
import { IngestWizard } from "./IngestWizard"

export default async function IngestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const review = await db.query.techReviews.findFirst({
    where: eq(techReviews.id, id),
    columns: {
      id: true,
      productId: true,
      title: true,
      slug: true,
    },
  })

  if (!review) notFound()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="text-sm text-muted-foreground">
          <Link
            href={`/admin/tech/reviews/${review.id}/edit`}
            className="hover:underline"
          >
            ← Back to review
          </Link>
        </div>
        <h1 className="text-2xl font-bold mt-2">Import Benchmark Data</h1>
        <p className="text-muted-foreground mt-1">
          Review: <span className="font-medium">{review.title}</span>
        </p>
      </div>
      <IngestWizard
        reviewId={review.id}
        productId={review.productId}
        reviewSlug={review.slug}
      />
    </div>
  )
}
