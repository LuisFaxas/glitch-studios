export const dynamic = "force-dynamic"

import { MediaLibrary } from "@/components/admin/media-library"

export default function AdminMediaPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="font-mono font-bold text-[28px] uppercase tracking-[0.05em] mb-8">
        Media Library
      </h1>
      <MediaLibrary />
    </div>
  )
}
