export const dynamic = "force-dynamic"

import {
  getHomepageSections,
  getAvailableBeats,
  getAvailablePortfolioItems,
} from "@/actions/admin-homepage"
import { HomepageEditor } from "@/components/admin/homepage-editor"

export default async function AdminHomepagePage() {
  const [sections, beats, portfolioItems] = await Promise.all([
    getHomepageSections(),
    getAvailableBeats(),
    getAvailablePortfolioItems(),
  ])

  return (
    <div className="mx-auto max-w-3xl p-6">
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
    </div>
  )
}
