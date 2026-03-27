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
import { formatDistanceToNow } from "date-fns"
import { StatTile } from "@/components/admin/stat-tile"

type ActivityItem = {
  type: "order" | "booking" | "message"
  description: string
  date: Date
}

export default async function AdminDashboardPage() {
  // Stat queries
  const [revenueResult] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${orders.totalAmount}::numeric), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.status, "completed"),
        gte(orders.createdAt, sql`NOW() - INTERVAL '30 days'`)
      )
    )

  const revenue = Math.floor(parseFloat(revenueResult?.total ?? "0"))
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
      totalAmount: orders.totalAmount,
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

  const activityItems: ActivityItem[] = [
    ...recentOrders.map((o) => ({
      type: "order" as const,
      description: `New order: $${parseFloat(o.totalAmount).toFixed(2)}`,
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

  const iconMap = {
    order: DollarSign,
    booking: CalendarDays,
    message: Inbox,
  }

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
          icon={DollarSign}
          index={0}
        />
        <StatTile
          label="Bookings This Week"
          value={bookingsThisWeek.length}
          icon={CalendarDays}
          index={1}
        />
        <StatTile
          label="Pending Messages"
          value={pendingMessagesResult?.value ?? 0}
          icon={Inbox}
          index={2}
        />
        <StatTile
          label="Subscribers"
          value={subscriberResult?.value ?? 0}
          icon={Mail}
          index={3}
        />
      </div>

      {/* Recent activity */}
      <h2 className="mb-4 font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]">
        Recent Activity
      </h2>
      {activityItems.length === 0 ? (
        <p className="text-[15px] text-[#555555]">No recent activity</p>
      ) : (
        <div className="flex flex-col gap-2">
          {activityItems.map((item, i) => {
            const Icon = iconMap[item.type]
            return (
              <div
                key={`${item.type}-${i}`}
                className="flex items-center gap-3 border border-[#222222] bg-[#111111] px-4 py-3"
              >
                <Icon size={16} className="shrink-0 text-[#888888]" />
                <span className="flex-1 text-[15px] text-[#f5f5f0]">
                  {item.description}
                </span>
                <span className="shrink-0 text-[13px] text-[#555555]">
                  {formatDistanceToNow(item.date, { addSuffix: true })}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
