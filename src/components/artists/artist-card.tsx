"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import clsx from "clsx"
import type { TeamMember } from "@/types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ArtistCard({ member }: { member: TeamMember }) {
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  return (
    <Link
      href={`/artists/${member.slug}`}
      className="block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={clsx(
          "relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200",
          isHovered && "border-[#444444]",
        )}
      >
        {/* Glitch hover animation overlay */}
        {isHovered && (
          <div
            className="pointer-events-none absolute inset-0 z-10 bg-[#f5f5f0]/5 animate-glitch-hover motion-reduce:hidden"
            style={{ animationDuration: "100ms" }}
            aria-hidden="true"
          />
        )}

        {/* Photo area */}
        <div className="relative aspect-square bg-[#111111]">
          {member.photoUrl ? (
            <img
              src={member.photoUrl}
              alt={member.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
              <span className="font-mono font-bold text-4xl text-[#555555]">
                {getInitials(member.name)}
              </span>
            </div>
          )}
        </div>

        {/* Info area */}
        <div className="p-4 space-y-1">
          <h3 className="font-mono font-bold text-lg text-[#f5f5f0]">
            {member.name}
          </h3>
          <p className="text-[#888888] font-sans text-[13px]">{member.role}</p>
          {member.bio && (
            <p className="text-[#888888] font-sans text-[13px] line-clamp-2">
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
