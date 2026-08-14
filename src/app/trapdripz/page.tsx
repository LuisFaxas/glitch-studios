import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TrapDripz Sneaker Catalog | Glitch Studios",
  description: "Mobile-first TrapDripz sneaker catalog by Glitch Studios.",
  openGraph: {
    title: "TrapDripz Sneaker Catalog",
    description: "Verified sneaker photo sets, asking prices, and trusted resale-source notes.",
    images: ["/trapdripz/img_3a2afd2bc8c1.jpg"],
  },
}

const products = [
  {
    id: "af1-puerto-rico",
    name: "Nike Air Force 1 Low CMFT ‘Puerto Rico’",
    ask: "$220",
    sku: "579941-100",
    color: "White / Game Royal / University Red",
    size: "US 10 on box photo; inventory says US 9.5 — verify before listing",
    condition: "Brand new",
    confidence: "High — box/style code visible in set.",
    note: "Size conflict needs confirmation before final buyer handoff.",
    market: "Trusted pages found on StockX/GOAT. Live market numbers were not published because scrape access was blocked; no fake comps.",
    sources: [
      ["StockX", "https://stockx.com/nike-air-force-1-low-cmft-puerto-rico"],
      ["GOAT", "https://www.goat.com/sneakers/air-force-1-puerto-rico-579941-100"],
      ["Flight Club", "https://www.flightclub.com/catalogsearch/result/?q=579941-100"],
    ],
    images: ["img_3a2afd2bc8c1.jpg", "img_81058f0ab912.jpg", "img_efd20bdf3cff.jpg", "img_d58357ac5e11.jpg", "img_f481a20edd4c.jpg"],
  },
  {
    id: "af1-rayguns",
    name: "Nike Air Force 1 ’07 LV8 ‘Rayguns’ / Dark Sulfur",
    ask: "$170",
    sku: "CZ0337-700",
    color: "Black / University Gold / Team Orange-style palette",
    size: "US 9.5 per inventory",
    condition: "Brand new",
    confidence: "Medium-high — box label visible: AIR FORCE 1 ’07 LV8, CZ0337-700.",
    note: "Exact resale-site display name should be confirmed before publishing external market range.",
    market: "Trusted resale search links included. No clean live price result was available during this run.",
    sources: [
      ["StockX", "https://stockx.com/search?s=CZ0337-700"],
      ["GOAT", "https://www.goat.com/search?query=CZ0337-700"],
      ["Flight Club", "https://www.flightclub.com/catalogsearch/result/?q=CZ0337-700"],
    ],
    images: ["img_87069facafb5.jpg", "img_80ffcb4834a6.jpg", "img_6be137163037.jpg", "img_41d4daaec1c8.jpg", "img_fee81da90a73.jpg"],
  },
  {
    id: "af1-chinatown-lotus",
    name: "Nike Air Force 1 ’07 PRM ‘San Francisco Chinatown Lotus Flower’",
    ask: "$190",
    sku: "Needs style-code confirmation",
    color: "White / Pink with lotus/floral translucent outsole detail",
    size: "US 9.5 per inventory",
    condition: "Brand new",
    confidence: "Medium — visual match + inventory name; needs box/style code for final exact listing.",
    note: "White/pink AF1 Low with lotus/floral detailing. Confirm SKU before buyer-facing final copy.",
    market: "No external market range published until confirmed on trusted resale pages.",
    sources: [
      ["StockX", "https://stockx.com/search?s=Air%20Force%201%20San%20Francisco%20Chinatown%20Lotus%20Flower"],
      ["GOAT", "https://www.goat.com/search?query=Air%20Force%201%20San%20Francisco%20Chinatown%20Lotus%20Flower"],
      ["Flight Club", "https://www.flightclub.com/catalogsearch/result/?q=Air%20Force%201%20San%20Francisco%20Chinatown%20Lotus%20Flower"],
    ],
    images: ["img_32661d65bd44.jpg", "img_9140711eddef.jpg", "img_4c7c3843670f.jpg"],
  },
  {
    id: "black-jordan-candidate",
    name: "Black Metallic Air Jordan Candidate — needs verification",
    ask: "$150",
    sku: "Unknown",
    color: "Black / Metallic Silver with icy/yellowed outsole sections",
    size: "US 9.5 per inventory",
    condition: "Brand new with yellowing frost / verify",
    confidence: "Low-medium — resembles a black metallic Jordan 6-family shoe, but exact model is not proven.",
    note: "Needs box label or close tag photos. Exact model intentionally not guessed.",
    market: "No market price published because exact shoe is not verified.",
    sources: [
      ["StockX", "https://stockx.com/search?s=Air%20Jordan%206%20Black%20Metallic%20Silver%20Low%20Chrome"],
      ["GOAT", "https://www.goat.com/search?query=Air%20Jordan%206%20Black%20Metallic%20Silver%20Low%20Chrome"],
      ["Flight Club", "https://www.flightclub.com/catalogsearch/result/?q=Air%20Jordan%206%20Black%20Metallic%20Silver%20Low%20Chrome"],
    ],
    images: ["img_dac1d62d8f08.jpg", "img_f2d0388c0c9c.jpg"],
  },
]

export default function TrapDripzPage() {
  const totalPhotos = products.reduce((sum, product) => sum + product.images.length, 0)

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,46,116,.22),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(64,224,255,.18),transparent_26%),linear-gradient(180deg,#07070a,#0b0b10_48%,#050506)]" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#ff2e74]">Glitch Studios presents</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.08em] text-white">TrapDripz</h1>
          </div>
          <a href="#catalog" className="rounded-full border border-white/15 bg-white px-4 py-3 text-sm font-black text-black shadow-[0_0_30px_rgba(255,255,255,.15)]">
            View pairs
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 pb-4 pt-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[.04] p-5 shadow-2xl shadow-black/40">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#40e0ff]">Mobile sneaker catalog</p>
          <h2 className="mt-3 text-5xl font-black leading-[0.9] tracking-[-0.1em] sm:text-7xl">Verified photo sets. Clean ask prices. No sketchy comps.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
            {products.length} products · {totalPhotos} photos accounted for · pricing notes restricted to reputable sneaker resale sources.
          </p>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {products.map((product) => (
              <a key={product.id} href={`#${product.id}`} className="min-h-11 shrink-0 rounded-full border border-white/10 bg-black/45 px-4 py-3 text-xs font-bold text-zinc-100">
                {product.ask} · {product.name.split("—")[0]}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-2">
        {products.map((product) => (
          <article key={product.id} id={product.id} className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#11131a] shadow-2xl shadow-black/40">
            <div className="flex snap-x gap-3 overflow-x-auto bg-black/45 p-3">
              {product.images.map((image, index) => (
                <img
                  key={image}
                  src={`/trapdripz/${image}`}
                  alt={`${product.name} photo ${index + 1}`}
                  loading="lazy"
                  className="h-[74vw] max-h-[430px] min-h-[300px] w-[86vw] max-w-[520px] shrink-0 snap-center rounded-[1.2rem] bg-white object-cover sm:h-[420px] sm:w-[520px]"
                />
              ))}
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ff2e74]">{product.images.length} photos · verified set</p>
                  <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">{product.name}</h3>
                </div>
                <div className="rounded-2xl border border-[#f5c542]/25 bg-[#f5c542]/10 px-4 py-3 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f5c542]">Ask</p>
                  <p className="text-3xl font-black text-[#f5c542]">{product.ask}</p>
                </div>
              </div>

              <dl className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                {[['SKU', product.sku], ['Color', product.color], ['Size', product.size], ['Condition', product.condition], ['Verification', product.confidence]].map(([label, value]) => (
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
