import Link from "next/link"
import { ScrollSection } from "@/components/home/scroll-section"
import { GlitchHeading } from "@/components/ui/glitch-heading"

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAt: Date | null
  createdAt: Date
}

interface BlogSectionProps {
  posts: BlogPost[]
}

export function BlogSection({ posts }: BlogSectionProps) {
  if (posts.length === 0) return null

  return (
    <ScrollSection className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="font-mono font-bold uppercase text-3xl md:text-4xl tracking-tight text-[#f5f5f0] mb-8">
          <GlitchHeading text="Latest News">Latest News</GlitchHeading>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[2px]">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={"/blog/" + post.slug}
              className="bg-[#111] border border-[#222] rounded-none overflow-hidden hover:border-[#444] hover:bg-[#1a1a1a] transition-colors group"
            >
              {post.coverImageUrl && (
                <div className="relative aspect-video bg-[#0a0a0a]">
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col gap-2">
                <p className="text-[#555] text-xs font-mono uppercase">
                  {(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="font-mono font-bold text-[#f5f5f0] text-base line-clamp-2">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-[#888] text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ScrollSection>
  )
}
