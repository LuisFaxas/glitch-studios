"use client"

import { useState, useTransition } from "react"
import { PostCard } from "./post-card"
import { loadMoreBlogPosts } from "@/actions/public-blog"
import type { BlogPost, BlogCategory } from "@/types"

type PostWithMeta = BlogPost & {
  category?: BlogCategory | null
  readingTime: number
}

interface LoadMoreButtonProps {
  initialOffset: number
  initialHasMore: boolean
  categorySlug: string | null
}

export function LoadMoreButton({
  initialOffset,
  initialHasMore,
  categorySlug,
}: LoadMoreButtonProps) {
  const [appended, setAppended] = useState<PostWithMeta[]>([])
  const [offset, setOffset] = useState(initialOffset)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [error, setError] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    setError(false)
    startTransition(async () => {
      try {
        const result = await loadMoreBlogPosts({ offset, categorySlug })
        const nextAppended = [...appended, ...(result.posts as PostWithMeta[])]
        const nextOffset = offset + result.posts.length
        setAppended(nextAppended)
        setOffset(nextOffset)
        setHasMore(result.hasMore)

        const url = new URL(window.location.href)
        url.searchParams.set("offset", String(nextOffset))
        window.history.replaceState({}, "", url.toString())
      } catch {
        setError(true)
      }
    })
  }

  if (!hasMore && appended.length === 0) return null

  return (
    <>
      {appended.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mt-1">
          {appended.map((post) => (
            <PostCard key={post.id} post={post} minutes={post.readingTime} />
          ))}
        </div>
      )}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            type="button"
            onClick={handleClick}
            disabled={isPending}
            className={
              "font-mono text-[11px] font-bold uppercase tracking-wide px-8 py-3 border transition-colors duration-200 " +
              (isPending
                ? "bg-[#111111] text-[#888888] border-[#222222] animate-pulse"
                : "bg-[#111111] text-[#f5f5f0] border-[#222222] hover:bg-[#f5f5f0] hover:text-[#000000] hover:border-[#f5f5f0]")
            }
          >
            {error
              ? "COULDN'T LOAD MORE POSTS. TAP TO RETRY."
              : isPending
                ? "LOADING..."
                : "LOAD MORE"}
          </button>
        </div>
      )}
    </>
  )
}
