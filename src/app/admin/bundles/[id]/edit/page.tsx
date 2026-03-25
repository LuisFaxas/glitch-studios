export const dynamic = "force-dynamic"

import {
  getBundleById,
  getPublishedBeatsForSelection,
} from "@/actions/admin-bundles"
import { BundleForm } from "@/components/admin/bundles/bundle-form"
import { notFound } from "next/navigation"

export default async function EditBundlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [bundle, availableBeats] = await Promise.all([
    getBundleById(id),
    getPublishedBeatsForSelection(),
  ])
  if (!bundle) notFound()
  return (
    <div className="p-6 max-w-[640px] mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        Edit Bundle
      </h1>
      <BundleForm mode="edit" bundle={bundle} availableBeats={availableBeats} />
    </div>
  )
}
