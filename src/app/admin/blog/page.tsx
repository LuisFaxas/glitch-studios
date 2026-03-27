export const dynamic = "force-dynamic"

import Link from "next/link"
import { getBlogPosts } from "@/actions/admin-blog"
import { BlogPostTable } from "@/components/admin/blog-post-table"

export default async function AdminBlogPage() {
  const { posts, totalPages, currentPage } = await getBlogPosts()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0]">
          Blog Posts
        </h1>
        <Link
          href="/admin/blog/new"
          className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
        >
          + New Post
        </Link>
      </div>
      <BlogPostTable
        initialPosts={posts}
        initialTotalPages={totalPages}
        initialPage={currentPage}
      />
    </div>
  )
}
