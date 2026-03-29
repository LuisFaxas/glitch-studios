export const dynamic = "force-dynamic"

import { db } from "@/lib/db"
import {
  orders,
  bookings,
  contactSubmissions,
  newsletterSubscribers,
} from "@/db/schema"
import { eq, sql, and, gte, lte, desc } from "drizzle-orm"
import { DollarSign, CalendarDays, Inbox, Mail } from "lucide-react"
import { StatTile } from "@/components/admin/stat-tile"
import { QuickActions } from "@/components/admin/quick-actions"
import { ActivityFeed } from "@/components/admin/activity-feed"

export default async function AdminDashboardPage() {
  // Stat queries
  const [revenueResult] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${orders.totalCents}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`)
      )
    )

  const revenue = Math.floor(parseInt(revenueResult?.total ?? "0") / 100)
  const revenueFormatted = `$${revenue.toLocaleString("en-US")}`

  // Bookings this week
  const now = new Date()
  const dayOfWeek = now.getDay()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - dayOfWeek)
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const weekStartStr = weekStart.toISOString().slice(0, 10)
  const weekEndStr = weekEnd.toISOString().slice(0, 10)

  const bookingsThisWeek = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(gte(bookings.date, weekStartStr), lte(bookings.date, weekEndStr)))

  // Pending messages
  const [pendingMessagesResult] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.isRead, false))

  // Newsletter subscribers
  const [subscriberResult] = await db
    .select({ value: sql<number>`COUNT(*)::int` })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, true))

  // Recent activity feed
  const recentOrders = await db
    .select({
      id: orders.id,
      totalCents: orders.totalCents,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.status, "completed"))
    .orderBy(desc(orders.createdAt))
    .limit(5)

  const recentBookings = await db
    .select({
      id: bookings.id,
      guestName: bookings.guestName,
      date: bookings.date,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .orderBy(desc(bookings.createdAt))
    .limit(5)

  const recentMessages = await db
    .select({
      id: contactSubmissions.id,
      name: contactSubmissions.name,
      createdAt: contactSubmissions.createdAt,
    })
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(5)

  type RawActivityItem = {
    type: "order" | "booking" | "message"
    description: string
    date: Date
  }

  const activityItems: RawActivityItem[] = [
    ...recentOrders.map((o) => ({
      type: "order" as const,
      description: `New order: $${(o.totalCents / 100).toFixed(2)}`,
      date: o.createdAt,
    })),
    ...recentBookings.map((b) => ({
      type: "booking" as const,
      description: `Booking from ${b.guestName} for ${b.date}`,
      date: b.createdAt,
    })),
    ...recentMessages.map((m) => ({
      type: "message" as const,
      description: `Message from ${m.name}`,
      date: m.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)

  const serializedItems = activityItems.map((item) => ({
    ...item,
    date: item.date.toISOString(),
  }))

  return (
    <div>
      <h1 className="mb-6 font-mono text-[28px] font-bold text-[#f5f5f0]">
        Dashboard
      </h1>

      {/* Stat tiles */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Revenue (30d)"
          value={revenueFormatted}
          icon={<DollarSign size={16} />}
          index={0}
        />
        <StatTile
          label="Bookings This Week"
          value={bookingsThisWeek.length}
          icon={<CalendarDays size={16} />}
          index={1}
        />
        <StatTile
          label="Pending Messages"
          value={pendingMessagesResult?.value ?? 0}
          icon={<Inbox size={16} />}
          index={2}
        />
        <StatTile
          label="Subscribers"
          value={subscriberResult?.value ?? 0}
          icon={<Mail size={16} />}
          index={3}
        />
      </div>

      {/* Two-column layout: Quick Actions + Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="mb-4 border-b border-[#222] pb-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555555]">
            Quick Actions
          </h2>
          <QuickActions />
        </div>
        <div>
          <h2 className="mb-4 border-b border-[#222] pb-2 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#555555]">
            Recent Activity
          </h2>
          <ActivityFeed items={serializedItems} />
        </div>
      </div>
    </div>
  )
}
