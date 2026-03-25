import Link from "next/link"
import { ArrowLeft, Globe, AtSign, ExternalLink, Music } from "lucide-react"
import type { TeamMember } from "@/types"

type SocialLink = {
  platform: string
  url: string
}

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

function parseSocialLinks(json: string | null): SocialLink[] {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) return parsed
    // Handle object format: { instagram: "url", twitter: "url" }
    if (typeof parsed === "object") {
      return Object.entries(parsed).map(([platform, url]) => ({
        platform,
        url: url as string,
      }))
    }
    return []
  } catch {
    return []
  }
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
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-mono">Back to Team</span>
      </Link>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Photo */}
        <div className="flex-shrink-0">
          <div className="relative w-full md:w-96 aspect-square rounded-lg overflow-hidden bg-gray-800">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <span className="font-mono font-bold text-6xl text-gray-600">
                  {getInitials(member.name)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-mono font-bold uppercase text-white">
              {member.name}
            </h1>
            <p className="text-xl text-gray-400 mt-2">{member.role}</p>
          </div>

          <p className="text-white leading-relaxed text-lg">{member.bio}</p>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-2"
                  aria-label={link.platform}
                >
                  <SocialIcon platform={link.platform} />
                </a>
              ))}
            </div>
          )}

          {/* Featured Track */}
          {member.featuredTrackUrl && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-gray-400" />
                <span className="font-mono font-bold text-sm uppercase text-white">
                  Featured Track
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2 break-all">
                {member.featuredTrackUrl}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Credits & Work */}
      {credits.length > 0 && (
        <div className="mt-12">
          <h2 className="font-mono font-bold text-2xl uppercase tracking-tight mb-6 text-white">
            Credits & Work
          </h2>
          <div className="space-y-0">
            {credits.map((credit, i) => (
              <div
                key={i}
                className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 py-4 border-b border-gray-800 last:border-b-0"
              >
                <span className="font-mono font-bold text-white">
                  {credit.title}
                </span>
                <span className="text-gray-400 text-sm">{credit.artist}</span>
                <span className="text-gray-600 text-sm">{credit.year}</span>
                <span className="text-gray-400 text-sm italic md:ml-auto">
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
