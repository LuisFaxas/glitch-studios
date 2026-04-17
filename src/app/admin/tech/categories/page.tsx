export const dynamic = "force-dynamic"

import { listCategoriesTree } from "@/actions/admin-tech-categories"
import { CategoryTreeView } from "@/components/admin/tech/category-tree-view"

export default async function AdminTechCategoriesPage() {
  const tree = await listCategoriesTree()
  return <CategoryTreeView initialTree={tree} />
}
