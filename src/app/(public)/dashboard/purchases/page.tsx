export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { getUserOrders } from "@/actions/orders"
import { PurchaseHistory } from "@/components/dashboard/purchase-history"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Purchase History",
  description: "View and download your purchased beats.",
}

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const orders = await getUserOrders(session.user.id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-mono font-bold text-[28px] leading-[1.2] uppercase tracking-[0.05em] text-[#f5f5f0] mb-8">
        Purchase History
      </h1>
      <PurchaseHistory orders={orders} />
    </div>
  )
}
