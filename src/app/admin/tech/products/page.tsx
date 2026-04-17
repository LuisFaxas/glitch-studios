export const dynamic = "force-dynamic"

import Link from "next/link"
import { listProducts } from "@/actions/admin-tech-products"

export default async function AdminTechProductsPage() {
  const products = await listProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0]">
          Products
        </h1>
        <Link
          href="/admin/tech/products/new"
          className="bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
        >
          New product
        </Link>
      </div>
      {products.length === 0 ? (
        <div className="border border-[#222222] bg-[#111111] p-12 text-center">
          <h2 className="font-mono text-[15px] uppercase text-[#888888] mb-2">
            No products yet
          </h2>
          <p className="font-sans text-[13px] text-[#555555] mb-6">
            Create your first product, then write a review for it.
          </p>
          <Link
            href="/admin/tech/products/new"
            className="inline-block bg-[#f5f5f0] text-[#000000] font-mono text-[13px] uppercase font-bold px-6 py-2"
          >
            New product
          </Link>
        </div>
      ) : (
        <table className="w-full border border-[#222222]">
          <thead>
            <tr className="bg-[#111111] border-b border-[#222222]">
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Name</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Category</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Manufacturer</th>
              <th className="text-left font-mono text-[11px] uppercase tracking-[0.1em] text-[#888888] p-3">Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#222222] hover:bg-[#111111]">
                <td className="p-3">
                  <Link
                    href={`/admin/tech/products/${p.id}/edit`}
                    className="font-mono text-[13px] uppercase text-[#f5f5f0] hover:underline"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="p-3 font-sans text-[13px] text-[#888888]">
                  {p.categoryName ?? "—"}
                </td>
                <td className="p-3 font-sans text-[13px] text-[#888888]">
                  {p.manufacturer ?? "—"}
                </td>
                <td className="p-3 font-mono text-[13px] text-[#888888]">
                  {p.priceUsd ? `$${p.priceUsd}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
