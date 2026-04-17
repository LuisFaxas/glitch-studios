export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { getReview } from "@/actions/admin-tech-reviews"

export default async function EditTechReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const review = await getReview(id)
  if (!review) notFound()

  return (
    <div>
      <nav className="flex items-center gap-2 text-[13px] font-mono text-[#888888] mb-6">
        <Link href="/admin/tech/reviews" className="hover:text-[#f5f5f0]">Reviews</Link>
        <span>/</span>
        <span className="text-[#f5f5f0]">Edit</span>
      </nav>
      <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
        Edit Review — {review.title}
      </h1>
      <p className="font-sans text-[13px] text-[#555555]">
        Review editor — fully wired in Plan 06.
      </p>
    </div>
  )
}
