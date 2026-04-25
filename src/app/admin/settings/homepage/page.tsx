export const dynamic = "force-dynamic"

import {
  getHomepageSections,
  getAvailableBeats,
  getAvailablePortfolioItems,
} from "@/actions/admin-homepage"
import { HomepageEditor } from "@/components/admin/homepage-editor"
import { db } from "@/lib/db"
import { mediaItems } from "@/db/schema"
import { ne, asc } from "drizzle-orm"
import { getAllHomeFeatureMedia } from "@/lib/media/queries"
import { HomeFeaturesAdmin } from "@/components/media/home-features-admin"

export default async function AdminHomepagePage() {
  const [sections, beats, portfolioItems, homeFeatureRows, pinnableSources] =
    await Promise.all([
      getHomepageSections(),
      getAvailableBeats(),
      getAvailablePortfolioItems(),
      getAllHomeFeatureMedia(),
      db
        .select({
          id: mediaItems.id,
          externalId: mediaItems.externalId,
          title: mediaItems.title,
          thumbnailUrl: mediaItems.thumbnailUrl,
          attachedToType: mediaItems.attachedToType,
        })
        .from(mediaItems)
        .where(ne(mediaItems.attachedToType, "home_feature"))
        .orderBy(asc(mediaItems.title)),
    ])

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-8">
      <div className="mb-8">
        <h1 className="font-mono text-[28px] font-bold uppercase tracking-[0.05em]">
          Homepage
        </h1>
      </div>

      <HomepageEditor
        initialSections={sections}
        availableBeats={beats}
        availablePortfolioItems={portfolioItems}
      />

      <HomeFeaturesAdmin
        initialFeatures={homeFeatureRows.map((f) => ({
          id: f.id,
          externalId: f.externalId,
          title: f.title,
          thumbnailUrl: f.thumbnailUrl,
          sortOrder: f.sortOrder,
        }))}
        pinnableSources={pinnableSources}
      />
    </div>
  )
}
