import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import { eq } from "drizzle-orm"
import { beats, beatPricing, beatProducers } from "./schema"

/**
 * Seed script for real beat testing.
 * Inserts "BREAK 5" by Trap Snyder into the database with R2 URLs.
 *
 * Usage:
 *   npx tsx src/db/seed-beat.ts           # Insert/update beat
 *   npx tsx src/db/seed-beat.ts --clean   # Remove test beat
 *
 * Prerequisite: Upload files to R2 first (optional -- falls back to null):
 *   npx wrangler r2 object put glitch-beats/beats/audio/break-5.mp3 --file="_RESOURECES/BEATS/TRAP_SNYDER/BREAK 5.mp3"
 *   npx wrangler r2 object put glitch-beats/beats/covers/break-5-cover.png --file="_RESOURECES/BEATS/TRAP_SNYDER/trap_snyder_logo.png"
 */

const BEAT_ID = "00000000-0000-4000-a000-000000000001"
const PRICING_MP3_ID = "00000000-0000-4000-a000-000000000011"
const PRICING_WAV_ID = "00000000-0000-4000-a000-000000000012"
const PRODUCER_ID = "00000000-0000-4000-a000-000000000021"

async function main() {
  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client)

  const isClean = process.argv.includes("--clean")

  try {
    if (isClean) {
      console.log("Cleaning test beat...")
      await db.delete(beatProducers).where(eq(beatProducers.beatId, BEAT_ID))
      await db.delete(beatPricing).where(eq(beatPricing.beatId, BEAT_ID))
      await db.delete(beats).where(eq(beats.id, BEAT_ID))
      console.log("Test beat removed.")
    } else {
      console.log("Seeding BREAK 5 by Trap Snyder...")

      // Upsert beat
      await db
        .insert(beats)
        .values({
          id: BEAT_ID,
          title: "BREAK 5",
          slug: "break-5",
          bpm: 140,
          key: "Am",
          genre: "Hip-Hop",
          moods: ["Dark", "Aggressive"],
          description: "Hard-hitting trap beat with dark atmospherics and aggressive 808 patterns.",
          coverArtKey: null, // R2 not configured -- uses Music icon fallback
          previewAudioKey: null, // R2 not configured -- no audio preview
          status: "published",
          sortOrder: 1,
        })
        .onConflictDoUpdate({
          target: beats.id,
          set: {
            title: "BREAK 5",
            slug: "break-5",
            bpm: 140,
            key: "Am",
            genre: "Hip-Hop",
            moods: ["Dark", "Aggressive"],
            description: "Hard-hitting trap beat with dark atmospherics and aggressive 808 patterns.",
            status: "published",
            sortOrder: 1,
            updatedAt: new Date(),
          },
        })

      // Upsert pricing - mp3 lease
      await db
        .insert(beatPricing)
        .values({
          id: PRICING_MP3_ID,
          beatId: BEAT_ID,
          tier: "mp3_lease",
          price: "29.00",
          isActive: true,
        })
        .onConflictDoUpdate({
          target: beatPricing.id,
          set: {
            price: "29.00",
            isActive: true,
          },
        })

      // Upsert pricing - wav lease
      await db
        .insert(beatPricing)
        .values({
          id: PRICING_WAV_ID,
          beatId: BEAT_ID,
          tier: "wav_lease",
          price: "49.00",
          isActive: true,
        })
        .onConflictDoUpdate({
          target: beatPricing.id,
          set: {
            price: "49.00",
            isActive: true,
          },
        })

      // Upsert producer
      await db
        .insert(beatProducers)
        .values({
          id: PRODUCER_ID,
          beatId: BEAT_ID,
          name: "Trap Snyder",
          splitPercent: 100,
        })
        .onConflictDoUpdate({
          target: beatProducers.id,
          set: {
            name: "Trap Snyder",
            splitPercent: 100,
          },
        })

      console.log("BREAK 5 seeded successfully!")
      console.log("  Beat ID:", BEAT_ID)
      console.log("  Pricing: mp3_lease=$29, wav_lease=$49")
      console.log("  Producer: Trap Snyder (100%)")
      console.log("")
      console.log("NOTE: R2 not configured. Cover art and audio preview are null.")
      console.log("The beat will render with the Music icon fallback in the catalog.")
      console.log("Upload files to R2 later and update coverArtKey/previewAudioKey.")
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
