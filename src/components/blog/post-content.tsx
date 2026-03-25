import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import type { BlogPost, BlogCategory } from "@/types"

interface PostContentProps {
  post: BlogPost & { category?: BlogCategory | null }
}

function estimateReadTime(content: string): number {
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

export function PostContent({ post }: PostContentProps) {
  const readTime = estimateReadTime(post.content)
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <article className="max-w-4xl mx-auto px-4 py-16 md:py-24">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        <span className="font-mono text-sm">Back to Blog</span>
      </Link>

      {post.coverImageUrl && (
        <div className="aspect-video relative rounded-none overflow-hidden mb-8">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
          />
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-mono font-bold uppercase tracking-tight text-white mb-4">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-4 text-sm text-[#888888] mb-12">
        {formattedDate && <time>{formattedDate}</time>}
        {post.category && (
          <span className="bg-[#222222] text-[#888888] px-2 py-1 rounded-none text-[11px] font-sans">
            {post.category.name}
          </span>
        )}
        <span>{readTime} min read</span>
      </div>

      <div
        className="prose prose-invert max-w-none
          prose-headings:font-mono prose-headings:font-bold prose-headings:uppercase prose-headings:text-white prose-headings:tracking-tight
          prose-p:text-[#f5f5f0]/80 prose-p:leading-relaxed
          prose-a:text-[#f5f5f0] prose-a:underline prose-a:decoration-[#555555] prose-a:underline-offset-4 hover:prose-a:decoration-[#f5f5f0]
          prose-strong:text-[#f5f5f0]
          prose-ul:text-[#f5f5f0]/80 prose-ol:text-[#f5f5f0]/80
          prose-li:marker:text-[#555555]
          prose-blockquote:border-[#222222] prose-blockquote:text-[#888888]
          prose-code:bg-[#222222] prose-code:text-[#f5f5f0]/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-none prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-[#111111] prose-pre:border prose-pre:border-[#222222] prose-pre:rounded-none
          prose-img:rounded-none
          prose-hr:border-[#222222]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
