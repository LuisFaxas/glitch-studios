export const dynamic = "force-dynamic"

import Link from "next/link"
import { Package, Star, FolderTree, BarChart3 } from "lucide-react"
import { listProducts } from "@/actions/admin-tech-products"
import { listReviews } from "@/actions/admin-tech-reviews"
import { listCategoriesTree } from "@/actions/admin-tech-categories"
import { listBenchmarkRuns } from "@/actions/admin-tech-benchmarks"

function StatTile({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string
  value: number
  href: string
  icon: typeof Package
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 bg-[#111111] border border-[#222222] p-6 hover:bg-[#1a1a1a] transition-colors"
    >
      <div className="flex items-center gap-2 text-[#555555]">
        <Icon size={14} />
        <span className="font-mono text-[11px] uppercase tracking-[0.1em]">
          {label}
        </span>
      </div>
      <div className="font-mono text-[28px] font-bold text-[#f5f5f0]">
        {value}
      </div>
    </Link>
  )
}

function countTreeNodes(tree: { children: unknown[] }[]): number {
  const queue = [...tree]
  let n = 0
  while (queue.length) {
    const node = queue.shift()!
    n++
    queue.push(...(node as { children: { children: unknown[] }[] }).children)
  }
  return n
}

export default async function AdminTechDashboardPage() {
  const [products, reviews, tree, runs] = await Promise.all([
    listProducts(),
    listReviews(),
    listCategoriesTree(),
    listBenchmarkRuns(),
  ])
  const publishedCount = reviews.filter((r) => r.status === "published").length
  const categoryCount = countTreeNodes(tree)

  return (
    <div>
      <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
        Tech Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile label="Products" value={products.length} href="/admin/tech/products" icon={Package} />
        <StatTile label="Published Reviews" value={publishedCount} href="/admin/tech/reviews" icon={Star} />
        <StatTile label="Categories" value={categoryCount} href="/admin/tech/categories" icon={FolderTree} />
        <StatTile label="Benchmark Runs" value={runs.length} href="/admin/tech/benchmarks" icon={BarChart3} />
      </div>
    </div>
  )
}
