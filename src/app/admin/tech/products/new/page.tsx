export const dynamic = "force-dynamic"

import Link from "next/link"
import { listCategoriesTree } from "@/actions/admin-tech-categories"

export default async function NewTechProductPage() {
  const tree = await listCategoriesTree()
  return (
    <div>
      <nav className="flex items-center gap-2 text-[13px] font-mono text-[#888888] mb-6">
        <Link href="/admin/tech/products" className="hover:text-[#f5f5f0]">Products</Link>
        <span>/</span>
        <span className="text-[#f5f5f0]">New Product</span>
      </nav>
      <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
        New Product
      </h1>
      <p className="font-sans text-[13px] text-[#555555]">
        Form scaffold — fully wired in Plan 05. Categories loaded: {tree.length} root node(s).
      </p>
    </div>
  )
}
