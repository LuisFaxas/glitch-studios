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
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="size-4" />
        <span className="font-mono text-sm">Back to Blog</span>
      </Link>

      {post.coverImageUrl && (
        <div className="aspect-video relative rounded-lg overflow-hidden mb-8">
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

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-12">
        {formattedDate && <time>{formattedDate}</time>}
        {post.category && (
          <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded-full text-xs">
            {post.category.name}
          </span>
        )}
        <span>{readTime} min read</span>
      </div>

      <div
        className="prose prose-invert max-w-none
          prose-headings:font-mono prose-headings:font-bold prose-headings:uppercase prose-headings:text-white prose-headings:tracking-tight
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-white prose-a:underline prose-a:decoration-gray-600 prose-a:underline-offset-4 hover:prose-a:decoration-white
          prose-strong:text-white
          prose-ul:text-gray-300 prose-ol:text-gray-300
          prose-li:marker:text-gray-600
          prose-blockquote:border-gray-800 prose-blockquote:text-gray-400
          prose-code:bg-gray-800 prose-code:text-gray-300 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg
          prose-img:rounded-lg
          prose-hr:border-gray-800"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
