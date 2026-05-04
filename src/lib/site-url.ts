import type { Brand } from "@/lib/brand"

function cleanSiteUrl(value: string | undefined, fallback: string): string {
  return (value || fallback).replace(/\\n/g, "").trim()
}

export function getSiteUrl(fallback = "https://glitchstudios.io"): string {
  return cleanSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, fallback)
}

export function getBrandSiteUrl(brand: Brand): string {
  if (brand === "tech") {
    return cleanSiteUrl(
      process.env.NEXT_PUBLIC_TECH_SITE_URL,
      "https://glitchtech.io"
    )
  }

  return cleanSiteUrl(
    process.env.NEXT_PUBLIC_STUDIOS_SITE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL,
    "https://glitchstudios.io"
  )
}
