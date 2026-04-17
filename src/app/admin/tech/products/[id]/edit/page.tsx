export const dynamic = "force-dynamic"

import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"
import { mediaAssets } from "@/db/schema"
import { getProduct } from "@/actions/admin-tech-products"
import { listCategoriesTree } from "@/actions/admin-tech-categories"
import { ProductForm } from "@/components/admin/tech/product-form"

export default async function EditTechProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [product, tree] = await Promise.all([getProduct(id), listCategoriesTree()])
  if (!product) notFound()

  let heroImageUrl: string | null = null
  if (product.heroImageId) {
    const asset = await db.query.mediaAssets.findFirst({
      where: eq(mediaAssets.id, product.heroImageId),
    })
    heroImageUrl = asset?.url ?? null
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-[13px] font-mono text-[#888888] mb-6">
        <Link href="/admin/tech/products" className="hover:text-[#f5f5f0]">Products</Link>
        <span>/</span>
        <span className="text-[#f5f5f0]">Edit</span>
      </nav>
      <h1 className="font-mono font-bold text-[28px] uppercase text-[#f5f5f0] mb-6">
        Edit Product — {product.name}
      </h1>
      <ProductForm
        mode="edit"
        productId={id}
        tree={tree}
        initial={{
          name: product.name,
          slug: product.slug,
          manufacturer: product.manufacturer,
          categoryId: product.categoryId,
          heroImageId: product.heroImageId,
          heroImageUrl,
          summary: product.summary,
          priceUsd: product.priceUsd !== null ? Number(product.priceUsd) : null,
          affiliateUrl: product.affiliateUrl,
          releaseDate: product.releaseDate,
          specs: product.specs,
        }}
      />
    </div>
  )
}
