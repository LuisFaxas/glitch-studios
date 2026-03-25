"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import clsx from "clsx"
import type { BlogPost, BlogCategory } from "@/types"

interface PostCardProps {
  post: BlogPost & { category?: BlogCategory | null }
}

export function PostCard({ post }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <article
        className={clsx(
          "relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200",
          isHovered && "border-[#444444]",
        )}
      >
        {/* Glitch hover animation overlay */}
        {isHovered && (
          <span
            className="pointer-events-none absolute inset-0 z-10 animate-glitch-hover"
            style={{ animationDuration: "100ms" }}
            aria-hidden="true"
          />
        )}

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
            <div className="w-full h-full bg-[#111111]" />
          )}
        </div>
        <div className="p-4">
          {post.category && (
            <span className="bg-[#222222] text-[#888888] text-[11px] font-sans px-2 py-1 rounded-none inline-block mb-2">
              {post.category.name}
            </span>
          )}
          <h2 className="font-mono font-bold text-xl text-[#f5f5f0] group-hover:text-[#f5f5f0] transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-3 text-[#888888] font-sans text-[13px] mt-2">
              {post.excerpt}
            </p>
          )}
          {formattedDate && (
            <p className="text-[11px] font-sans text-[#555555] mt-3">
              {formattedDate}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}
