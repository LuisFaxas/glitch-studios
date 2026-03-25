"use client"

import { useCart } from "@/components/cart/cart-provider"
import { toast } from "sonner"
import type { getPublishedBundles } from "@/actions/bundles"

type BundleData = Awaited<ReturnType<typeof getPublishedBundles>>

export function BundleSection({ bundles }: { bundles: BundleData }) {
  const { addItem } = useCart()

  if (bundles.length === 0) return null

  function handleAddBundle(
    bundle: BundleData[number]
  ) {
    for (const beat of bundle.beats) {
      addItem({
        beatId: beat.id,
        beatTitle: beat.title,
        beatSlug: "",
        coverArtUrl: beat.coverArtUrl,
        licenseTier: "mp3_lease",
        licenseTierDisplay: "MP3 Lease",
        price: 0, // Price will be calculated at checkout with bundle discount
      })
    }
    toast.success(
      `Added ${bundle.title} (${bundle.beats.length} beats) to cart`
    )
  }

  return (
    <section className="mb-8">
      <h2 className="mb-1 font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
        BUNDLES
      </h2>
      <p className="mb-6 font-sans text-[15px] text-[#888]">
        Save with curated collections
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="border border-[#222] bg-[#111] p-4"
          >
            <h3 className="font-mono text-[15px] font-bold uppercase">
              {bundle.title}
            </h3>
            <p className="mt-1 font-sans text-[11px] text-[#888]">
              {bundle.beats.length} beats
            </p>

            {bundle.description && (
              <p className="mt-2 font-sans text-[13px] text-[#888]">
                {bundle.description}
              </p>
            )}

            {/* Beat thumbnails */}
            <div className="mt-3 flex gap-1">
              {bundle.beats.slice(0, 6).map((beat) => (
                <div
                  key={beat.id}
                  className="h-8 w-8 border border-[#222] bg-[#0a0a0a]"
                >
                  {beat.coverArtUrl && (
                    <img
                      src={beat.coverArtUrl}
                      alt={beat.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
              {bundle.beats.length > 6 && (
                <div className="flex h-8 w-8 items-center justify-center border border-[#222] bg-[#0a0a0a] font-mono text-[9px] text-[#888]">
                  +{bundle.beats.length - 6}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="mt-3 flex items-center gap-2">
              <span className="font-sans text-[13px] text-[#555] line-through">
                ${bundle.originalTotal.toFixed(2)}
              </span>
              <span className="font-mono text-[15px] font-bold">
                ${bundle.discountedTotal.toFixed(2)}
              </span>
              <span className="bg-[#333] px-2 py-0.5 font-mono text-[11px] uppercase text-[#f5f5f0]">
                {bundle.discountPercent}% OFF
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={() => handleAddBundle(bundle)}
              className="mt-4 w-full border border-[#f5f5f0] bg-[#f5f5f0] px-4 py-2.5 font-mono text-[13px] uppercase tracking-[0.05em] text-[#000] transition-colors hover:bg-[#e0e0d8]"
            >
              Add Bundle to Cart
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
