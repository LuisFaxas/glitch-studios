"use client"

import Image from "next/image"
import { useEffect, useMemo, useState, type KeyboardEvent } from "react"

type Product = {
  id: string
  name: string
  shortName: string
  designer: string
  brand: string
  category: string
  itemType: string
  ask: string
  askValue: number
  sku: string
  color: string
  size: string
  sizeFilters: string[]
  condition: string
  confidence: string
  verification: string
  note: string
  market: string
  featuredRank: number
  addedAt: string
  sources: string[][]
  images: string[]
}

type TrapDripzCatalogProps = {
  logoSrc: string
  products: Product[]
}

type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "designer" | "item"

type FilterState = {
  designer: string
  category: string
  size: string
  condition: string
}

const allValue = "All"

export function TrapDripzCatalog({ logoSrc, products }: TrapDripzCatalogProps) {
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("featured")
  const [filters, setFilters] = useState<FilterState>({
    designer: allValue,
    category: allValue,
    size: allValue,
    condition: allValue,
  })
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const totalPhotos = products.reduce((sum, product) => sum + product.images.length, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!selectedProduct) return

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setSelectedProduct(null)
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [selectedProduct])

  const filterOptions = useMemo(() => {
    const unique = (values: string[]) => [allValue, ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))]

    return {
      designers: unique(products.map((product) => product.designer)),
      categories: unique(products.map((product) => product.category)),
      sizes: unique(products.flatMap((product) => product.sizeFilters)),
      conditions: unique(products.map((product) => product.condition)),
    }
  }, [products])

  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return products
      .filter((product) => {
        const queryHit =
          !normalizedQuery ||
          [product.name, product.shortName, product.designer, product.category, product.itemType, product.sku, product.color]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)

        const designerHit = filters.designer === allValue || product.designer === filters.designer
        const categoryHit = filters.category === allValue || product.category === filters.category
        const sizeHit = filters.size === allValue || product.sizeFilters.includes(filters.size)
        const conditionHit = filters.condition === allValue || product.condition === filters.condition

        return queryHit && designerHit && categoryHit && sizeHit && conditionHit
      })
      .sort((a, b) => {
        switch (sort) {
          case "newest":
            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime() || a.featuredRank - b.featuredRank
          case "price-asc":
            return a.askValue - b.askValue
          case "price-desc":
            return b.askValue - a.askValue
          case "designer":
            return a.designer.localeCompare(b.designer) || a.shortName.localeCompare(b.shortName)
          case "item":
            return a.category.localeCompare(b.category) || a.shortName.localeCompare(b.shortName)
          case "featured":
          default:
            return a.featuredRank - b.featuredRank
        }
      })
  }, [filters, products, query, sort])

  const activeFilterCount = Object.values(filters).filter((value) => value !== allValue).length + (query.trim() ? 1 : 0)

  const resetFilters = () => {
    setQuery("")
    setFilters({ designer: allValue, category: allValue, size: allValue, condition: allValue })
    setSort("featured")
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(255,46,116,.16),transparent_28%),radial-gradient(circle_at_86%_8%,rgba(64,224,255,.12),transparent_24%),linear-gradient(180deg,#07070a,#090910_44%,#050506)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/82 px-4 backdrop-blur-xl transition-all duration-300">
        <div className={`mx-auto flex max-w-5xl flex-col items-center justify-center transition-all duration-300 ${scrolled ? "py-2" : "py-2.5"}`}>
          <a href="/trapdripz" className="group flex flex-col items-center" aria-label="TrapDripz catalog home">
            <Image
              src={logoSrc}
              alt="TrapDripz logo"
              width={240}
              height={240}
              priority
              className={`rounded-[1.2rem] border border-white/10 bg-black object-cover shadow-[0_0_34px_rgba(255,46,116,.22)] transition-all duration-300 ease-out ${
                scrolled ? "h-14 w-14 rounded-2xl" : "h-32 w-32 rounded-[1.65rem] sm:h-36 sm:w-36"
              }`}
            />
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-3 pt-3">
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#40e0ff]">Curated heat. Verified in hand. Priced to move.</p>
          <p className="mx-auto mt-1 max-w-sm text-[10px] leading-4 text-zinc-500">
            {products.length} listings · {totalPhotos} real photos · tap any piece for sizing, condition, and market notes.
          </p>
        </div>

        <div className="mt-3 rounded-[1.35rem] border border-white/10 bg-white/[.045] p-2.5 shadow-2xl shadow-black/35">
          <label className="sr-only" htmlFor="trapdripz-search">Search inventory</label>
          <input
            id="trapdripz-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search designer, item, SKU..."
            className="h-10 w-full rounded-2xl border border-white/10 bg-black/55 px-3 text-xs font-bold text-white outline-none transition placeholder:text-zinc-600 focus:border-[#40e0ff]/60 focus:ring-2 focus:ring-[#40e0ff]/15"
          />

          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SelectControl label="Sort" value={sort} onChange={(value) => setSort(value as SortKey)} options={[
              ["featured", "Featured"],
              ["newest", "Newest"],
              ["price-asc", "Price ↑"],
              ["price-desc", "Price ↓"],
              ["designer", "Designer A-Z"],
              ["item", "Item A-Z"],
            ]} />
            <SelectControl label="Designer" value={filters.designer} onChange={(value) => setFilters((current) => ({ ...current, designer: value }))} options={filterOptions.designers.map((value) => [value, value])} />
            <SelectControl label="Item" value={filters.category} onChange={(value) => setFilters((current) => ({ ...current, category: value }))} options={filterOptions.categories.map((value) => [value, value])} />
            <SelectControl label="Size" value={filters.size} onChange={(value) => setFilters((current) => ({ ...current, size: value }))} options={filterOptions.sizes.map((value) => [value, value])} />
            <SelectControl label="Condition" value={filters.condition} onChange={(value) => setFilters((current) => ({ ...current, condition: value }))} options={filterOptions.conditions.map((value) => [value, value])} />
          </div>

          <div className="mt-1 flex items-center justify-between gap-3 text-[11px] font-bold text-zinc-400">
            <span>{visibleProducts.length} showing</span>
            {activeFilterCount > 0 && (
              <button type="button" onClick={resetFilters} className="min-h-8 rounded-full border border-white/10 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#8ff0ff]">
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-5xl px-4 pb-24 pt-1">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 2} onOpen={() => setSelectedProduct(product)} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[.035] p-8 text-center">
            <p className="text-lg font-black tracking-[-0.04em]">No pieces match that filter.</p>
            <p className="mt-2 text-sm text-zinc-500">Clear the filters and run the catalog back.</p>
            <button type="button" onClick={resetFilters} className="mt-5 min-h-11 rounded-full bg-white px-5 text-sm font-black text-black">
              Reset catalog
            </button>
          </div>
        )}
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </main>
  )
}

function SelectControl({
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[][]
  className?: string
}) {
  return (
    <label className={`flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-black/55 px-3 ${className}`}>
      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-16 bg-transparent text-xs font-black text-white outline-none"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue} className="bg-black text-white">
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function ProductCard({ product, priority, onOpen }: { product: Product; priority: boolean; onOpen: () => void }) {
  const [activeImage, setActiveImage] = useState(0)

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onOpen()
    }
  }

  const moveImage = (direction: -1 | 1) => {
    setActiveImage((current) => (current + direction + product.images.length) % product.images.length)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="group overflow-hidden rounded-[1.45rem] border border-white/10 bg-[#101219] shadow-2xl shadow-black/35 outline-none transition duration-200 active:scale-[0.985] focus-visible:border-[#40e0ff]/70 focus-visible:ring-2 focus-visible:ring-[#40e0ff]/20"
      aria-label={`Open listing for ${product.name}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black/45">
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${activeImage * 100}%)` }}
        >
          {product.images.map((image, index) => (
            <Image
              key={image}
              src={`/trapdripz/${image}`}
              alt={`${product.name} thumbnail ${index + 1}`}
              width={520}
              height={700}
              sizes="(max-width: 640px) 48vw, 260px"
              priority={priority && index === 0}
              className="h-full w-full shrink-0 bg-white object-cover"
            />
          ))}
        </div>

        {product.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                moveImage(-1)
              }}
              className="absolute left-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-lg font-black text-white backdrop-blur transition active:scale-95"
              aria-label={`Previous photo for ${product.name}`}
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                moveImage(1)
              }}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/65 text-lg font-black text-white backdrop-blur transition active:scale-95"
              aria-label={`Next photo for ${product.name}`}
            >
              ›
            </button>
          </>
        )}

        <div className="pointer-events-none absolute bottom-2 left-2 rounded-full border border-white/10 bg-black/70 px-2 py-1 text-[10px] font-black text-white backdrop-blur">
          {activeImage + 1}/{product.images.length}
        </div>
        <div className="absolute bottom-2 right-2 flex gap-1">
          {product.images.slice(0, 5).map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={(event) => {
                event.stopPropagation()
                setActiveImage(index)
              }}
              className={`h-2 w-2 rounded-full transition ${index === activeImage ? "bg-white" : "bg-white/35"}`}
              aria-label={`Show photo ${index + 1} for ${product.name}`}
            />
          ))}
        </div>
      </div>

      <div className="p-3">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#ff2e74]">{product.designer}</p>
        <h2 className="mt-1 line-clamp-2 w-full text-[13px] font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-base">{product.shortName}</h2>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold leading-4 text-zinc-400">{product.category} · {product.sizeFilters.join("/")}</p>
          <p className="shrink-0 text-lg font-black tracking-[-0.05em] text-[#f5c542]">{product.ask}</p>
        </div>
        <p className="mt-1 line-clamp-1 text-[11px] font-bold leading-4 text-zinc-500">{product.condition}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="rounded-full border border-[#40e0ff]/20 bg-[#40e0ff]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#8ff0ff]">
            {product.verification}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">Details</span>
        </div>
      </div>
    </article>
  )
}

function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/76 px-3 pb-3 pt-10 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`${product.name} details`} onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0d12] shadow-2xl shadow-black" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff2e74]">{product.designer} · {product.category}</p>
            <p className="mt-1 text-sm font-black text-white">Full listing</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl font-black text-white" aria-label="Close product details">
            ×
          </button>
        </div>

        <div className="max-h-[calc(92vh-68px)] overflow-y-auto">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto bg-black/45 p-3">
            {product.images.map((image, index) => (
              <Image
                key={image}
                src={`/trapdripz/${image}`}
                alt={`${product.name} photo ${index + 1}`}
                width={1040}
                height={780}
                sizes="(max-width: 640px) 92vw, 640px"
                className="h-[72vw] max-h-[460px] min-h-[280px] w-[88vw] max-w-[640px] shrink-0 snap-center rounded-[1.35rem] bg-white object-cover"
              />
            ))}
          </div>

          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-black leading-tight tracking-[-0.055em] sm:text-4xl">{product.name}</h2>
                <p className="mt-2 text-sm font-bold text-zinc-400">{product.itemType} · {product.color}</p>
              </div>
              <div className="rounded-2xl border border-[#f5c542]/25 bg-[#f5c542]/10 px-4 py-3 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5c542]">Ask</p>
                <p className="text-3xl font-black text-[#f5c542]">{product.ask}</p>
              </div>
            </div>

            <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              {[
                ["Designer", product.designer],
                ["Item", product.category],
                ["SKU", product.sku],
                ["Size", product.size],
                ["Condition", product.condition],
                ["Verification", product.confidence],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                  <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</dt>
                  <dd className="mt-1 leading-5 text-zinc-100">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm leading-6 text-zinc-300">
              <p><strong className="text-white">Listing note:</strong> {product.note}</p>
              <p className="mt-2"><strong className="text-white">Market research:</strong> {product.market}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {product.sources.map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" className="min-h-11 rounded-full border border-[#40e0ff]/25 bg-[#40e0ff]/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#8ff0ff]">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
