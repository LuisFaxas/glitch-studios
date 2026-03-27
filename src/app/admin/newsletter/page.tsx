export const dynamic = "force-dynamic"

import Link from "next/link"
import { getBroadcasts, getSubscribers } from "@/actions/admin-newsletter"
import { NewsletterListTable } from "@/components/admin/newsletter-list-table"
import { SubscriberListTable } from "@/components/admin/subscriber-list-table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function NewsletterPage() {
  const [broadcastsData, subscribersData] = await Promise.all([
    getBroadcasts(),
    getSubscribers(),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono text-2xl font-bold text-[#f5f5f0] uppercase tracking-wider">
          Newsletter
        </h1>
        <Link href="/admin/newsletter/compose">
          <Button className="bg-[#f5f5f0] text-[#000] hover:bg-[#e5e5e0] gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em]">
            <Plus className="size-4" />
            Compose
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="broadcasts">
        <TabsList className="bg-[#111111] border border-[#222222] mb-6">
          <TabsTrigger value="broadcasts" className="font-mono text-[13px] uppercase tracking-[0.05em]">
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="font-mono text-[13px] uppercase tracking-[0.05em]">
            Subscribers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts">
          <NewsletterListTable
            initialBroadcasts={broadcastsData.broadcasts}
            initialTotalPages={broadcastsData.totalPages}
          />
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscriberListTable
            initialSubscribers={subscribersData.subscribers}
            initialTotalPages={subscribersData.totalPages}
            initialTotal={subscribersData.total}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
