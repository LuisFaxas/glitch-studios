"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import type { PortfolioNeighbor } from "@/lib/portfolio/get-portfolio-neighbors"

interface PrevNextFooterProps {
  prev: PortfolioNeighbor
  next: PortfolioNeighbor
}

export function PrevNextFooter({ prev, next }: PrevNextFooterProps) {
  const router = useRouter()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return
        }
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === "ArrowLeft") {
        router.push(`/portfolio/${prev.slug}`)
      } else if (e.key === "ArrowRight") {
        router.push(`/portfolio/${next.slug}`)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prev.slug, next.slug, router])

  return (
    <nav
      aria-label="Portfolio navigation"
      className="sticky bottom-0 z-40 bg-[#111111] border-t border-[#222222] text-[#f5f5f0]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12 py-4 md:py-6 flex items-center justify-between gap-4">
        <Link
          href={`/portfolio/${prev.slug}`}
          aria-label={`Previous portfolio item: ${prev.title}`}
          className="group flex items-center gap-2 min-w-0 hover:text-[#f5f5f0]/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="hidden md:inline font-mono text-[13px] font-bold uppercase tracking-wide truncate">
            PREV · {prev.title}
          </span>
        </Link>
        <Link
          href={`/portfolio/${next.slug}`}
          aria-label={`Next portfolio item: ${next.title}`}
          className="group flex items-center gap-2 min-w-0 justify-end hover:text-[#f5f5f0]/80 transition-colors"
        >
          <span className="hidden md:inline font-mono text-[13px] font-bold uppercase tracking-wide truncate">
            {next.title} · NEXT
          </span>
          <ArrowRight className="w-5 h-5 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  )
}
