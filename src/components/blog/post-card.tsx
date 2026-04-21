"use client"

import Link from "next/link"
import Image from "next/image"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import { PostCardPlaceholder } from "./post-card-placeholder"
import { ReadingTimeBadge } from "./reading-time-badge"
import type { BlogPost, BlogCategory } from "@/types"

interface PostCardProps {
  post: BlogPost & { category?: BlogCategory | null }
  minutes: number
}

export function PostCard({ post, minutes }: PostCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        .toUpperCase()
        .replace(",", "")
    : null

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col group-hover:border-[#444444]">
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
          style={{ animationDuration: "100ms" }}
          aria-hidden="true"
        />

        <div className="aspect-video relative">
          {post.coverImageUrl ? (
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <PostCardPlaceholder title={post.title} />
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          {post.category && (
            <span className="bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none inline-block mb-2 self-start">
              {post.category.name}
            </span>
          )}
          <h2 className="font-mono font-bold text-xl text-[#f5f5f0] line-clamp-2 mt-2">
            <GlitchHeading text={post.title}>{post.title}</GlitchHeading>
          </h2>
          {post.excerpt && (
            <p className="line-clamp-3 text-[#888888] font-sans text-[13px] mt-2">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto pt-3 flex items-center gap-2">
            <ReadingTimeBadge minutes={minutes} />
            {formattedDate && (
              <>
                <span className="text-[#555555]" aria-hidden="true">
                  ·
                </span>
                <time className="font-mono text-[11px] font-bold uppercase tracking-wide text-[#888888]">
                  {formattedDate}
                </time>
              </>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
