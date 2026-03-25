export const dynamic = "force-dynamic"

import { getPublishedBeatsForSelection } from "@/actions/admin-bundles"
import { BundleForm } from "@/components/admin/bundles/bundle-form"

export default async function NewBundlePage() {
  const availableBeats = await getPublishedBeatsForSelection()
  return (
    <div className="p-6 max-w-[640px] mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        New Bundle
      </h1>
      <BundleForm mode="create" availableBeats={availableBeats} />
    </div>
  )
}
