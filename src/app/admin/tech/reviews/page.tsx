export const dynamic = "force-dynamic"

import Link from "next/link"
import { listReviews } from "@/actions/admin-tech-reviews"

export default async function AdminTechReviewsPage() {
  const reviews = await listReviews()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0]">
          Reviews
        </h1>
        <Link
          href="/admin/tech/reviews/new"
          className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
        >
          New review
        </Link>
      </div>
      {reviews.length === 0 ? (
        <div className="border border-[#222222] bg-[#111111] p-12 text-center">
          <h2 className="font-mono text-[15px] uppercase text-[#888888] mb-2">
            No reviews yet
          </h2>
          <p className="font-sans text-[13px] text-[#555555] mb-6">
            Create your first review. Attach a product, fill the rating, publish when ready.
          </p>
          <Link
            href="/admin/tech/reviews/new"
            className="inline-block bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
          >
            New review
          </Link>
        </div>
      ) : (
        <table className="w-full border border-[#222222]">
          <thead>
            <tr className="bg-[#111111] border-b border-[#222222]">
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Title</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Product</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Reviewer</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-b border-[#222222] hover:bg-[#111111]">
                <td className="p-3">
                  <Link
                    href={`/admin/tech/reviews/${r.id}/edit`}
                    className="font-mono text-[13px] uppercase text-[#f5f5f0] hover:underline"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="p-3 font-sans text-[13px] text-[#888888]">{r.productName ?? "—"}</td>
                <td className="p-3 font-sans text-[13px] text-[#888888]">{r.reviewerName}</td>
                <td className="p-3">
                  <span
                    className={`font-mono text-[11px] uppercase tracking-[0.1em] px-2 py-0.5 border ${
                      r.status === "published"
                        ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
                        : "bg-[#222222] text-[#888888] border-[#333333]"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
