"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

type Product = {
  id: string
  name: string
  ask: string
  sku: string
  color: string
  size: string
  condition: string
  confidence: string
  note: string
  market: string
  sources: string[][]
  images: string[]
}

type TrapDripzCatalogProps = {
  logoSrc: string
  products: Product[]
}

export function TrapDripzCatalog({ logoSrc, products }: TrapDripzCatalogProps) {
  const [scrolled, setScrolled] = useState(false)
  const totalPhotos = products.reduce((sum, product) => sum + product.images.length, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 42)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(255,46,116,.18),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(64,224,255,.14),transparent_25%),linear-gradient(180deg,#07070a,#090910_44%,#050506)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/80 px-4 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center py-3">
          <a href="/trapdripz" className="group flex flex-col items-center" aria-label="TrapDripz catalog home">
            <Image
              src={logoSrc}
              alt="TrapDripz logo"
              width={240}
              height={240}
              priority
              className={`rounded-[1.35rem] border border-white/10 bg-black object-cover shadow-[0_0_38px_rgba(255,46,116,.24)] transition-all duration-300 ease-out ${
                scrolled ? "h-14 w-14" : "h-32 w-32"
              }`}
            />
            <div className={`overflow-hidden text-center transition-all duration-300 ${scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"}`}>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.32em] text-[#ff2e74]">Glitch Studios presents</p>
            </div>
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-4 pt-6">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.035] p-5 text-center shadow-2xl shadow-black/40">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-[#40e0ff]">Mobile sneaker catalog</p>
          <h1 className="mx-auto mt-3 max-w-[16rem] text-2xl font-black leading-[1] tracking-[-0.055em] sm:max-w-none sm:text-4xl">
            Clean pairs. Fair asks. Verified photos.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-zinc-400 sm:text-sm">
            {products.length} products · {totalPhotos} photos accounted for · resale notes kept to trusted sneaker sources.
          </p>
          <a
            href="#catalog"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-black text-black shadow-[0_0_30px_rgba(255,255,255,.12)]"
          >
            View pairs
          </a>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 text-left">
            {products.map((product) => (
              <a key={product.id} href={`#${product.id}`} className="min-h-11 shrink-0 rounded-full border border-white/10 bg-black/45 px-4 py-3 text-xs font-bold text-zinc-100">
                {product.ask} · {product.name.split("—")[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-2">
        {products.map((product, productIndex) => (
          <article key={product.id} id={product.id} className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#11131a] shadow-2xl shadow-black/40">
            <div className="flex snap-x gap-3 overflow-x-auto bg-black/45 p-3">
              {product.images.map((image, index) => (
                <Image
                  key={image}
                  src={`/trapdripz/${image}`}
                  alt={`${product.name} photo ${index + 1}`}
                  width={1040}
                  height={780}
                  sizes="(max-width: 640px) 86vw, 520px"
                  priority={productIndex === 0 && index === 0}
                  loading={productIndex === 0 && index === 0 ? "eager" : "lazy"}
                  className="h-[74vw] max-h-[430px] min-h-[300px] w-[86vw] max-w-[520px] shrink-0 snap-center rounded-[1.2rem] bg-white object-cover sm:h-[420px] sm:w-[520px]"
                />
              ))}
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ff2e74]">{product.images.length} photos · verified set</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">{product.name}</h2>
                </div>
                <div className="rounded-2xl border border-[#f5c542]/25 bg-[#f5c542]/10 px-4 py-3 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5c542]">Ask</p>
                  <p className="text-3xl font-black text-[#f5c542]">{product.ask}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {[["SKU", product.sku], ["Color", product.color], ["Size", product.size], ["Condition", product.condition], ["Verification", product.confidence]].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                    <dt className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{label}</dt>
                    <dd className="mt-1 leading-5 text-zinc-100">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm leading-6 text-zinc-300">
                <p><strong className="text-white">Note:</strong> {product.note}</p>
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
          </article>
        ))}
      </section>
    </main>
  )
}
