export const dynamic = "force-dynamic"

import { getAllBundlesAdmin } from "@/actions/admin-bundles"
import { AdminBundleTable } from "@/components/admin/bundles/bundle-table"
import Link from "next/link"

export default async function AdminBundlesPage() {
  const bundles = await getAllBundlesAdmin()
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em]">
          Bundles
        </h1>
        <Link
          href="/admin/bundles/new"
          className="bg-[#f5f5f0] text-[#000] font-mono font-bold text-sm uppercase px-6 py-2 rounded-none"
        >
          New Bundle
        </Link>
      </div>
      <AdminBundleTable bundles={bundles} />
    </div>
  )
}
