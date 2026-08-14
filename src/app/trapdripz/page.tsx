import type { Metadata } from "next"
import { TrapDripzCatalog } from "./trapdripz-catalog"

const trapDripzLogo = "/trapdripz/trapdripz-logo.png"

export const metadata: Metadata = {
  title: "TrapDripz Sneaker Catalog | Glitch Studios",
  description: "Mobile-first TrapDripz sneaker catalog by Glitch Studios.",
  openGraph: {
    title: "TrapDripz Sneaker Catalog",
    description: "Verified sneaker photo sets, asking prices, and trusted resale-source notes.",
    images: [trapDripzLogo],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrapDripz Sneaker Catalog",
    description: "Verified sneaker photo sets, asking prices, and trusted resale-source notes.",
    images: [trapDripzLogo],
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
  return <TrapDripzCatalog logoSrc={trapDripzLogo} products={products} />
}
