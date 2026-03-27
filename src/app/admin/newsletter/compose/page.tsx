export const dynamic = "force-dynamic"

import Link from "next/link"
import { getSegmentCounts } from "@/actions/admin-newsletter"
import { NewsletterComposer } from "@/components/admin/newsletter-composer"
import { ChevronRight } from "lucide-react"

export default async function ComposeNewsletterPage() {
  const segmentCounts = await getSegmentCounts()

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6 font-mono text-[13px] text-[#555]">
        <Link
          href="/admin/newsletter"
          className="hover:text-[#f5f5f0] transition-colors"
        >
          Newsletter
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-[#f5f5f0]">Compose</span>
      </nav>

      <h1 className="font-mono text-2xl font-bold text-[#f5f5f0] uppercase tracking-wider mb-6">
        Compose Newsletter
      </h1>

      <NewsletterComposer segmentCounts={segmentCounts} />
    </div>
  )
}
