export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import Link from "next/link"
import { getBlogPost, getCategories } from "@/actions/admin-blog"
import { BlogPostForm } from "@/components/admin/blog-post-form"

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const { id } = await params
  const [post, categories] = await Promise.all([
    getBlogPost(id),
    getCategories(),
  ])

  if (!post) {
    notFound()
  }

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
        <span className="text-[#f5f5f0]">Edit Post</span>
      </nav>
      <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
        Edit Post
      </h1>
      <BlogPostForm
        mode="edit"
        postId={id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        initialData={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          categoryId: post.categoryId,
          tagNames: post.tagNames,
          coverImageUrl: post.coverImageUrl,
          content: post.content,
          status: post.status,
          scheduledAt: post.scheduledAt,
        }}
      />
    </div>
  )
}
