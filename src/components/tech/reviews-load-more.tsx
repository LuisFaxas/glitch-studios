"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

interface ReviewsLoadMoreProps {
  cursor: { publishedAt: Date; id: string }
}

function encodeCursor(cursor: { publishedAt: Date; id: string }): string {
  return Buffer.from(
    JSON.stringify({ publishedAt: cursor.publishedAt.toISOString(), id: cursor.id }),
  ).toString("base64url")
}

export function ReviewsLoadMore({ cursor }: ReviewsLoadMoreProps) {
  const params = useSearchParams()
  const next = new URLSearchParams(params.toString())
  next.set("cursor", encodeCursor(cursor))
  const href = `?${next.toString()}#reviews-end`

  return (
    <div className="flex justify-center py-8">
      <Link
        href={href}
        scroll={false}
        className="inline-flex items-center gap-2 border border-[#f5f5f0] bg-transparent px-8 py-3 font-mono text-sm font-bold uppercase tracking-[0.05em] text-[#f5f5f0] transition-colors hover:bg-[#f5f5f0] hover:text-black"
      >
        Load more reviews
      </Link>
    </div>
  )
}
