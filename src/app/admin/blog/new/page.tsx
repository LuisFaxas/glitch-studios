import Link from "next/link"
import { getCategories } from "@/actions/admin-blog"
import { BlogPostForm } from "@/components/admin/blog-post-form"

export default async function NewBlogPostPage() {
  const categories = await getCategories()

  return (
    <div>
      <nav className="flex items-center gap-2 text-[13px] font-mono text-[#888888] mb-6">
        <Link
          href="/admin/blog"
          className="hover:text-[#f5f5f0] transition-colors"
        >
          Blog Posts
        </Link>
        <span>/</span>
        <span className="text-[#f5f5f0]">New Post</span>
      </nav>
      <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
        New Post
      </h1>
      <BlogPostForm
        mode="create"
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  )
}
