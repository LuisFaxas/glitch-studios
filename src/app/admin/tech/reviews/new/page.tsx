export const dynamic = "force-dynamic"

import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { listProducts } from "@/actions/admin-tech-products"
import { listReviewers } from "@/actions/admin-tech-reviews"
import { ReviewEditor } from "@/components/admin/tech/review-editor"

export default async function NewTechReviewPage() {
  const [products, reviewers, session] = await Promise.all([
    listProducts(),
    listReviewers(),
    auth.api.getSession({ headers: await headers() }),
  ])
  const initialReviewerId = session?.user.id ?? reviewers[0]?.id ?? ""

  return (
    <ReviewEditor
      mode="create"
      initialReviewerId={initialReviewerId}
      products={products}
      reviewers={reviewers}
      galleryUrls={[]}
    />
  )
}
