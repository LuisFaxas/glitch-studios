// TODO(Phase 14): replace Lucide social icons with brand SVGs (POLISH-01)

import Link from "next/link"
import Image from "next/image"
import { AtSign, Globe, Music, ExternalLink } from "lucide-react"
import { parseSocialLinks } from "@/lib/parse-social-links"
import type { TeamMember } from "@/types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p.includes("instagram")) return <AtSign className="w-4 h-4" />
  if (p.includes("twitter") || p.includes("x")) return <AtSign className="w-4 h-4" />
  if (p.includes("youtube")) return <Globe className="w-4 h-4" />
  if (p.includes("soundcloud") || p.includes("music")) return <Music className="w-4 h-4" />
  return <ExternalLink className="w-4 h-4" />
}

export function ArtistCard({ member }: { member: TeamMember }) {
  const socialLinks = parseSocialLinks(member.socialLinks)
  const specialties = (member.specialties ?? []).slice(0, 3)

  return (
    <article className="group relative bg-[#111111] border border-[#222222] rounded-none overflow-hidden transition-colors duration-200 h-full flex flex-col hover:border-[#444444]">
      {/* Whole-card click target — sits behind content so social <a>s can opt out */}
      <Link
        href={`/artists/${member.slug}`}
        aria-label={`View ${member.name}`}
        className="absolute inset-0 z-10"
      />

      <div
        className="pointer-events-none absolute inset-0 z-20 bg-[#f5f5f0]/5 opacity-0 group-hover:opacity-100 group-hover:animate-glitch-hover motion-reduce:hidden transition-opacity"
        style={{ animationDuration: "100ms" }}
        aria-hidden="true"
      />

      <div className="relative aspect-[4/3] bg-[#111111]">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono font-bold text-4xl text-[#555555]">
              {getInitials(member.name)}
            </span>
          </div>
        )}
      </div>

      {/* Content — pointer-events-none so clicks fall through to the overlay Link;
          social row re-enables pointer events so its <a>s remain clickable */}
      <div className="relative p-4 flex flex-col flex-1 pointer-events-none">
        <span className="bg-[#222222] text-[#888888] text-[11px] font-mono font-bold uppercase tracking-wide px-2 py-1 self-start mb-2">
          {member.role}
        </span>

        <h3 className="font-mono font-bold text-lg text-[#f5f5f0] leading-tight mb-2">
          {member.name}
        </h3>

        {member.bio && (
          <p className="text-[#888888] font-sans text-[13px] leading-relaxed line-clamp-3 mb-3">
            {member.bio}
          </p>
        )}

        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {specialties.map((s) => (
              <span
                key={s}
                className="bg-[#0a0a0a] border border-[#222222] text-[#555555] text-[10px] font-mono uppercase tracking-wide px-2 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {socialLinks.length > 0 && (
          <div className="relative z-30 mt-auto pt-3 flex gap-3 pointer-events-auto">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#555555] hover:text-[#f5f5f0] transition-colors"
                aria-label={link.platform}
              >
                <SocialIcon platform={link.platform} />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
