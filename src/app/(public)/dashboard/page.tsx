export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { bookings, services } from "@/db/schema"
import { eq, or, asc } from "drizzle-orm"
import { getUserOrders } from "@/actions/orders"
import { GlitchHeading } from "@/components/ui/glitch-heading"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "My Account",
  description: "Your Glitch Studios account — purchases and bookings.",
}

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const name = session.user.name?.split(" ")[0] ?? session.user.email.split("@")[0]

  const orders = await getUserOrders(session.user.id)
  const recentOrders = orders.slice(0, 5)

  const today = new Date().toISOString().split("T")[0]
  const upcomingBookings = await db
    .select({
      id: bookings.id,
      serviceName: services.name,
      date: bookings.date,
      startTime: bookings.startTime,
      status: bookings.status,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(
      or(
        eq(bookings.userId, session.user.id),
        eq(bookings.guestEmail, session.user.email)
      )
    )
    .orderBy(asc(bookings.date), asc(bookings.startTime))
    .limit(5)

  const upcoming = upcomingBookings.filter(
    (b) => b.date >= today && (b.status === "pending" || b.status === "confirmed")
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="font-mono text-[28px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0] mb-8">
        Welcome back, {name}
      </p>

      <div className="space-y-10">
        <section>
          <div className="flex items-center justify-between mb-4">
            <GlitchHeading text="My Purchases">
              <h2 className="font-mono text-[16px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                My Purchases
              </h2>
            </GlitchHeading>
            {recentOrders.length > 0 && (
              <Link
                href="/dashboard/purchases"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888888] hover:text-[#f5f5f0] transition-colors"
              >
                View All
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <p className="font-mono text-[13px] text-[#888888] border border-[#222222] bg-[#111111] px-4 py-6">
              No purchases yet. Browse the beat catalog to get started.
            </p>
          ) : (
            <ul className="space-y-1">
              {recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between border border-[#222222] bg-[#111111] px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                      {order.items.map((i) => i.beat.title).join(", ")}
                    </p>
                    <p className="font-mono text-[11px] text-[#888888] mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888888]">
                    ${((order.totalCents ?? 0) / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <GlitchHeading text="My Bookings">
              <h2 className="font-mono text-[16px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                My Bookings
              </h2>
            </GlitchHeading>
            {upcoming.length > 0 && (
              <Link
                href="/dashboard/bookings"
                className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888888] hover:text-[#f5f5f0] transition-colors"
              >
                View All
              </Link>
            )}
          </div>

          {upcoming.length === 0 ? (
            <p className="font-mono text-[13px] text-[#888888] border border-[#222222] bg-[#111111] px-4 py-6">
              No bookings yet. Book a studio session to get started.
            </p>
          ) : (
            <ul className="space-y-1">
              {upcoming.map((booking) => (
                <li
                  key={booking.id}
                  className="flex items-center justify-between border border-[#222222] bg-[#111111] px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#f5f5f0]">
                      {booking.serviceName}
                    </p>
                    <p className="font-mono text-[11px] text-[#888888] mt-0.5">
                      {new Date(booking.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      at {booking.startTime}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[#888888]">
                    {booking.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
