"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Cpu } from "lucide-react"

interface AdminContextSwitcherProps {
  onNavigate?: () => void
}

export function AdminContextSwitcher({ onNavigate }: AdminContextSwitcherProps) {
  const pathname = usePathname()
  const isTech = pathname.startsWith("/admin/tech")

  const studiosClass = !isTech
    ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
    : "bg-[#111111] text-[#888888] border-[#222222] hover:bg-[#1a1a1a] hover:text-[#f5f5f0] hover:border-[#444444]"
  const techClass = isTech
    ? "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
    : "bg-[#111111] text-[#888888] border-[#222222] hover:bg-[#1a1a1a] hover:text-[#f5f5f0] hover:border-[#444444]"

  const pillBase =
    "flex-1 flex items-center justify-center gap-2 min-h-[36px] px-3 border font-mono text-[13px] font-bold uppercase tracking-[0.05em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f5f5f0] focus-visible:outline-offset-2"

  return (
    <div
      role="tablist"
      aria-label="Admin context"
      className="flex gap-1 px-4 py-2 border-b border-[#222222]"
    >
      <Link
        href="/admin"
        role="tab"
        aria-selected={!isTech}
        title="Switch to Glitch Studios admin"
        onClick={onNavigate}
        className={`${pillBase} ${studiosClass}`}
      >
        <Music size={14} className="shrink-0" />
        <span>Studios</span>
      </Link>
      <Link
        href="/admin/tech"
        role="tab"
        aria-selected={isTech}
        title="Switch to Glitch Tech admin"
        onClick={onNavigate}
        className={`${pillBase} ${techClass}`}
      >
        <Cpu size={14} className="shrink-0" />
        <span>Tech</span>
      </Link>
    </div>
  )
}
