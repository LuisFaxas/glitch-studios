export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { teamMembers } from "@/db/schema"
import { eq, asc } from "drizzle-orm"
import { ArtistCard } from "@/components/artists/artist-card"
import { ScrollSection } from "@/components/home/scroll-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the producers, engineers, and creatives behind Glitch Studios.",
}

export default async function ArtistsPage() {
  const members = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.isActive, true))
    .orderBy(asc(teamMembers.sortOrder))

  if (members.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="font-mono font-bold text-4xl uppercase mb-4 text-white">
          Team coming soon
        </h1>
        <p className="text-gray-400 text-lg">
          We are assembling our roster. Check back shortly.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
      <h1 className="font-mono font-bold text-4xl md:text-5xl uppercase tracking-tight mb-12 text-white">
        Our Team
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member, i) => (
          <ScrollSection key={member.id} delay={i * 0.1}>
            <ArtistCard member={member} />
          </ScrollSection>
        ))}
      </div>
    </div>
  )
}
