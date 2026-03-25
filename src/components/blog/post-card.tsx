import Link from "next/link"
import Image from "next/image"
import type { BlogPost, BlogCategory } from "@/types"

interface PostCardProps {
  post: BlogPost & { category?: BlogCategory | null }
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 transition-colors hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]">
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
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
        </div>
        <div className="p-4">
          {post.category && (
            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full inline-block mb-2">
              {post.category.name}
            </span>
          )}
          <h2 className="font-mono font-bold text-xl text-white group-hover:text-gray-200 transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-3 text-gray-400 mt-2">{post.excerpt}</p>
          )}
          {formattedDate && (
            <p className="text-sm text-gray-600 mt-3">{formattedDate}</p>
          )}
        </div>
      </article>
    </Link>
  )
}
