export const dynamic = "force-dynamic"

import { getCategories, getTags } from "@/actions/admin-blog"
import { BlogCategoryManager } from "@/components/admin/blog-category-manager"
import { BlogTagManager } from "@/components/admin/blog-tag-manager"

export default async function BlogCategoriesPage() {
  const [categories, tags] = await Promise.all([getCategories(), getTags()])

  return (
    <div className="space-y-12">
      <section>
        <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
          Categories
        </h1>
        <BlogCategoryManager categories={categories} />
      </section>

      <section>
        <h2 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
          Tags
        </h2>
        <BlogTagManager tags={tags} />
      </section>
    </div>
  )
}
