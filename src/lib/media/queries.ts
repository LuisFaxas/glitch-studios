import { db } from "@/lib/db"
import { mediaItems } from "@/db/schema"
import { and, asc, eq } from "drizzle-orm"

/**
 * Fetch all media_item rows attached to a given entity, ordered by sort_order asc.
 * No FK enforcement on attached_to_id; trust the discriminator + zod validation
 * in the actions that wrote the row.
 *
 * Used by both public surfaces (Plan 27-07) and admin attachment lists (Plan 27-05).
 */
export async function getMediaForEntity(
  attachedToType: string,
  attachedToId: string,
) {
  return db
    .select()
    .from(mediaItems)
    .where(
      and(
        eq(mediaItems.attachedToType, attachedToType),
        eq(mediaItems.attachedToId, attachedToId),
      ),
    )
    .orderBy(asc(mediaItems.sortOrder))
}

/**
 * Fetch home_feature media_items, hard-capped at 3 per CONTEXT D-17.
 * Sort_order asc; only the top 3 ever render publicly.
 */
export async function getHomeFeatureMedia() {
  return db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.attachedToType, "home_feature"))
    .orderBy(asc(mediaItems.sortOrder))
    .limit(3)
}

/**
 * Like getHomeFeatureMedia but no limit — used by the admin home-features
 * picker so admin can see every pinned video and reorder. UI surfaces a
 * "Live on home" chip on the top 3 only.
 */
export async function getAllHomeFeatureMedia() {
  return db
    .select()
    .from(mediaItems)
    .where(eq(mediaItems.attachedToType, "home_feature"))
    .orderBy(asc(mediaItems.sortOrder))
}
