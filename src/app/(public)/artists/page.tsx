export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { teamMembers } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ArtistHeroBanner } from "@/components/artists/artist-hero-banner"
import { ArtistsSection } from "@/components/artists/artists-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Artists",
  description:
    "Meet the producers, engineers, and creatives behind Glitch Studios — and the collaborating artists in our network.",
}

export default async function ArtistsPage() {
  const members = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(asc(teamMembers.sortOrder))

  const team = members.filter((m) => m.kind === "internal")
  const collabs = members.filter((m) => m.kind === "collaborator")
  const featured = team.find((m) => m.isFeatured) ?? null

  if (members.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-[#f5f5f0]">
          Artists coming soon
        </h1>
        <p className="text-[#888888] text-lg">
          We are assembling our roster. Check back shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold uppercase tracking-wide text-[#f5f5f0] mb-8 text-[clamp(28px,5vw,48px)] leading-[1.1]">
        ARTISTS
      </h1>

      <ArtistHeroBanner member={featured} />

      <ArtistsSection title="TEAM" members={team} />

      <ArtistsSection
        title="COLLABORATORS"
        members={collabs}
        className="mt-16 pt-8 border-t border-[#222222]"
      />
    </div>
  )
}
