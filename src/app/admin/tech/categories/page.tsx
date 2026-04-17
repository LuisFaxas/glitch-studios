export const dynamic = "force-dynamic"

import { listCategoriesTree } from "@/actions/admin-tech-categories"

export default async function AdminTechCategoriesPage() {
  const tree = await listCategoriesTree()
  return (
    <div>
      <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
        Categories
      </h1>
      <p className="font-sans text-[13px] text-[#555555]">
        Category tree — fully wired in Plan 04. Root nodes: {tree.length}.
      </p>
    </div>
  )
}
