export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import { teamMembers } from "@/db/schema"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { ArtistProfile } from "@/components/artists/artist-profile"
import type { Metadata } from "next"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [member] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.slug, slug))
    .limit(1)

  if (!member) {
    return { title: "Not Found" }
  }

  return {
    title: member.name,
    description: `${member.role} at Glitch Studios. ${member.bio?.slice(0, 150) || ""}`,
  }
}

export async function generateStaticParams() {
  try {
    const members = await db
      .select({ slug: teamMembers.slug })
      .from(teamMembers)
      .where(eq(teamMembers.isActive, true))

    return members.map((m) => ({ slug: m.slug }))
  } catch {
    return []
  }
}

export default async function ArtistDetailPage({ params }: Props) {
  const { slug } = await params
  const [member] = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.slug, slug))
    .limit(1)

  if (!member) {
    notFound()
  }

  return <ArtistProfile member={member} />
}
