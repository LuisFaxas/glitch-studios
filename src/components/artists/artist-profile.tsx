import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Globe, AtSign, ExternalLink, Music } from "lucide-react"
import { parseSocialLinks } from "@/lib/parse-social-links"
import type { TeamMember } from "@/types"

type Credit = {
  title: string
  artist: string
  year: string | number
  role: string
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function parseCredits(json: string | null): Credit[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase()
  if (p.includes("instagram")) return <AtSign className="w-5 h-5" />
  if (p.includes("twitter") || p.includes("x"))
    return <AtSign className="w-5 h-5" />
  if (p.includes("youtube")) return <Globe className="w-5 h-5" />
  if (p.includes("soundcloud") || p.includes("music"))
    return <Music className="w-5 h-5" />
  return <ExternalLink className="w-5 h-5" />
}

export function ArtistProfile({ member }: { member: TeamMember }) {
  const socialLinks = parseSocialLinks(member.socialLinks)
  const credits = parseCredits(member.credits)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <Link
        href="/artists"
        className="inline-flex items-center gap-2 text-[#888888] hover:text-[#f5f5f0] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-mono">Back to Artists</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        <div className="flex-shrink-0">
          <div className="relative w-full md:w-96 aspect-square rounded-none overflow-hidden bg-[#111111]">
            {member.photoUrl ? (
              <Image
                src={member.photoUrl}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#111111]">
                <span className="font-mono font-bold text-6xl text-[#555555]">
                  {getInitials(member.name)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-mono font-bold uppercase text-[#f5f5f0]">
              {member.name}
            </h1>
            <p className="text-xl text-[#888888] mt-2">{member.role}</p>
          </div>

          <p className="text-[#f5f5f0] leading-relaxed text-lg">{member.bio}</p>

          {socialLinks.length > 0 && (
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#888888] hover:text-[#f5f5f0] transition-colors p-2"
                  aria-label={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}

          {member.featuredTrackUrl && (
            <div className="bg-[#111111] border border-[#222222] rounded-none p-4">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-[#888888]" />
                <span className="font-mono font-bold text-sm uppercase text-[#f5f5f0]">
                  Featured Track
                </span>
              </div>
              <p className="text-[#888888] text-sm mt-2 break-all">
                {member.featuredTrackUrl}
              </p>
            </div>
          )}
        </div>
      </div>

      {credits.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono font-bold text-2xl uppercase tracking-tight mb-6 text-[#f5f5f0]">
            Credits & Work
          </h2>
          <div className="space-y-0">
            {credits.map((credit, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 py-4 border-b border-[#222222] last:border-b-0"
              >
                <span className="font-mono font-bold text-[#f5f5f0]">
                  {credit.title}
                </span>
                <span className="text-[#888888] text-sm">{credit.artist}</span>
                <span className="text-[#555555] text-sm">{credit.year}</span>
                <span className="text-[#888888] text-sm italic md:ml-auto">
                  {credit.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
