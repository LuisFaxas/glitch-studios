"use client"

import { useMemo, useState } from "react"
import clsx from "clsx"
import { ArtistCard } from "./artist-card"
import type { TeamMember } from "@/types"

interface ArtistsSectionProps {
  title: string
  members: TeamMember[]
  className?: string
}

export function ArtistsSection({ title, members, className }: ArtistsSectionProps) {
  const [active, setActive] = useState<string | null>(null)

  const specialties = useMemo(
    () =>
      Array.from(
        new Set(members.flatMap((m) => m.specialties ?? []))
      ).filter(Boolean),
    [members]
  )

  const filtered = useMemo(
    () =>
      active
        ? members.filter((m) => (m.specialties ?? []).includes(active))
        : members,
    [members, active]
  )

  const chipBase =
    "px-4 py-2 rounded-none font-mono text-[11px] font-bold uppercase tracking-wide border whitespace-nowrap transition-colors duration-200"
  const chipActive = "bg-[#f5f5f0] text-[#000000] border-[#f5f5f0]"
  const chipInactive =
    "bg-[#111111] text-[#888888] border-[#222222] hover:text-[#f5f5f0] hover:border-[#444444]"

  return (
    <section className={className}>
      <h2 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] text-[clamp(20px,3vw,32px)] leading-[1.1] border-b border-[#222222] pb-4 mb-6">
        {title}{" "}
        <span className="text-[#555555]">({members.length})</span>
      </h2>

      {specialties.length > 0 && (
        <div className="flex gap-1 overflow-x-auto pb-2 mb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActive(null)}
            className={clsx(chipBase, !active ? chipActive : chipInactive)}
            aria-pressed={!active}
          >
            ALL
          </button>
          {specialties.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActive(s)}
              className={clsx(chipBase, active === s ? chipActive : chipInactive)}
              aria-pressed={active === s}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {members.length === 0 ? (
        <p className="text-[#555555] font-sans text-sm py-8">Coming soon.</p>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-mono font-bold uppercase text-[#f5f5f0] mb-2">
            NO MEMBERS WITH THIS SPECIALTY
          </p>
          <p className="text-[#888888] font-sans text-sm">
            Try a different specialty or tap ALL.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {filtered.map((m) => (
            <ArtistCard key={m.id} member={m} />
          ))}
        </div>
      )}
    </section>
  )
}
