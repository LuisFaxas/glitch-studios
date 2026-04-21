"use client"

import { useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { PrevNextFooter } from "./prev-next-footer"
import type { PortfolioNeighbor } from "@/lib/portfolio/get-portfolio-neighbors"

interface PortfolioDetailLayoutProps {
  neighbors: { prev: PortfolioNeighbor; next: PortfolioNeighbor } | null
  children: ReactNode
}

const SWIPE_THRESHOLD_PX = 60

export function PortfolioDetailLayout({
  neighbors,
  children,
}: PortfolioDetailLayoutProps) {
  const router = useRouter()
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!neighbors || !touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return
    if (Math.abs(dx) < Math.abs(dy)) return

    if (dx > 0) {
      router.push(`/portfolio/${neighbors.prev.slug}`)
    } else {
      router.push(`/portfolio/${neighbors.next.slug}`)
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      <div className="pb-24">
        {children}
      </div>
      {neighbors && (
        <PrevNextFooter prev={neighbors.prev} next={neighbors.next} />
      )}
    </div>
  )
}
