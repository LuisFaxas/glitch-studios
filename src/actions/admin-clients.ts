"use server"

import { sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/permissions"
import { orders, orderItems, beats, bookings, services, rooms } from "@/db/schema"

export interface ClientRecord {
  id: string
  name: string
  email: string
  type: "registered" | "guest"
  createdAt: string
  purchaseCount: number
  totalSpend: number
  bookingCount: number
}

interface ClientListResult {
  clients: ClientRecord[]
  totalPages: number
  currentPage: number
}

const PAGE_SIZE = 20

export async function getClients(filters?: {
  search?: string
  type?: "all" | "registered" | "guest"
  page?: number
}): Promise<ClientListResult> {
  await requirePermission("view_clients")

  const search = filters?.search?.trim() || ""
  const typeFilter = filters?.type || "all"
  const page = filters?.page ?? 1

  // Step 1: Registered users with purchase/booking counts
  const registeredRows = await db.execute(sql`
    SELECT
      u.id,
      u.name,
      u.email,
      'registered' as type,
      u.created_at as created_at,
      COALESCE(o.purchase_count, 0)::int as purchase_count,
      COALESCE(o.total_spend, 0)::numeric as total_spend,
      COALESCE(b.booking_count, 0)::int as booking_count
    FROM "user" u
    LEFT JOIN (
      SELECT user_id, COUNT(*)::int as purchase_count, COALESCE(SUM(total_cents), 0) as total_spend
      FROM orders WHERE user_id IS NOT NULL GROUP BY user_id
    ) o ON o.user_id = u.id
    LEFT JOIN (
      SELECT user_id, COUNT(*)::int as booking_count
      FROM bookings WHERE user_id IS NOT NULL GROUP BY user_id
    ) b ON b.user_id = u.id
    WHERE u.role = 'user'
  `)

  // Step 2: Guest emails from orders (no user account)
  const guestOrderRows = await db.execute(sql`
    SELECT
      guest_email as email,
      COUNT(*)::int as purchase_count,
      COALESCE(SUM(total_cents), 0) as total_spend,
      MIN(created_at) as created_at
    FROM orders
    WHERE user_id IS NULL AND guest_email IS NOT NULL
    GROUP BY guest_email
  `)

  // Step 3: Guest emails from bookings (no user account)
  const guestBookingRows = await db.execute(sql`
    SELECT
      guest_email as email,
      guest_name as name,
      COUNT(*)::int as booking_count,
      MIN(created_at) as created_at
    FROM bookings
    WHERE user_id IS NULL AND guest_email IS NOT NULL
    GROUP BY guest_email, guest_name
  `)

  // Build registered user map by email for merging
  const registeredEmails = new Set<string>()
  const clientMap = new Map<string, ClientRecord>()

  for (const row of registeredRows as any[]) {
    const email = row.email as string
    registeredEmails.add(email.toLowerCase())
    clientMap.set(email.toLowerCase(), {
      id: row.id as string,
      name: (row.name as string) || email.split("@")[0],
      email,
      type: "registered",
      createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
      purchaseCount: Number(row.purchase_count) || 0,
      totalSpend: Number(row.total_spend) || 0,
      bookingCount: Number(row.booking_count) || 0,
    })
  }

  // Step 4: Merge guest orders
  for (const row of guestOrderRows as any[]) {
    const email = (row.email as string).toLowerCase()
    if (registeredEmails.has(email)) {
      // Attach to registered record
      const existing = clientMap.get(email)!
      existing.purchaseCount += Number(row.purchase_count) || 0
      existing.totalSpend += Number(row.total_spend) || 0
    } else {
      const existing = clientMap.get(email)
      if (existing) {
        existing.purchaseCount += Number(row.purchase_count) || 0
        existing.totalSpend += Number(row.total_spend) || 0
      } else {
        clientMap.set(email, {
          id: `guest-${row.email}`,
          name: (row.email as string).split("@")[0],
          email: row.email as string,
          type: "guest",
          createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
          purchaseCount: Number(row.purchase_count) || 0,
          totalSpend: Number(row.total_spend) || 0,
          bookingCount: 0,
        })
      }
    }
  }

  // Merge guest bookings
  for (const row of guestBookingRows as any[]) {
    const email = (row.email as string).toLowerCase()
    if (registeredEmails.has(email)) {
      const existing = clientMap.get(email)!
      existing.bookingCount += Number(row.booking_count) || 0
    } else {
      const existing = clientMap.get(email)
      if (existing) {
        existing.bookingCount += Number(row.booking_count) || 0
        // Update name if guest booking has a real name
        if (row.name && existing.name === existing.email.split("@")[0]) {
          existing.name = row.name as string
        }
      } else {
        clientMap.set(email, {
          id: `guest-${row.email}`,
          name: (row.name as string) || (row.email as string).split("@")[0],
          email: row.email as string,
          type: "guest",
          createdAt: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
          purchaseCount: 0,
          totalSpend: 0,
          bookingCount: Number(row.booking_count) || 0,
        })
      }
    }
  }

  // Convert to array and filter
  let clients = Array.from(clientMap.values())

  // Type filter
  if (typeFilter === "registered") {
    clients = clients.filter((c) => c.type === "registered")
  } else if (typeFilter === "guest") {
    clients = clients.filter((c) => c.type === "guest")
  }

  // Search filter
  if (search) {
    const term = search.toLowerCase()
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    )
  }

  // Sort by createdAt DESC
  clients.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Paginate
  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE))
  const offset = (page - 1) * PAGE_SIZE
  const paged = clients.slice(offset, offset + PAGE_SIZE)

  return { clients: paged, totalPages, currentPage: page }
}

export interface ClientDetailOrder {
  id: string
  date: string
  items: string
  total: string
  status: string
}

export interface ClientDetailBooking {
  id: string
  serviceName: string
  date: string
  startTime: string
  endTime: string
  status: string
  roomName: string
}

export interface ClientDetail {
  client: ClientRecord
  purchases: ClientDetailOrder[]
  bookings: ClientDetailBooking[]
}

export async function getClientDetail(
  clientId: string
): Promise<ClientDetail | null> {
  await requirePermission("view_clients")

  const isGuest = clientId.startsWith("guest-")
  const guestEmail = isGuest ? clientId.slice(6) : null

  let client: ClientRecord

  if (isGuest) {
    // Build client from orders/bookings
    const orderRows = await db.execute(sql`
      SELECT COUNT(*)::int as cnt, COALESCE(SUM(total_cents), 0) as total, MIN(created_at) as first
      FROM orders WHERE guest_email = ${guestEmail}
    `)
    const bookingRows = await db.execute(sql`
      SELECT COUNT(*)::int as cnt, guest_name, MIN(created_at) as first
      FROM bookings WHERE guest_email = ${guestEmail}
      GROUP BY guest_name
    `)

    const oRow = (orderRows as any[])[0] || {}
    const bRow = (bookingRows as any[])[0] || {}

    client = {
      id: clientId,
      name: (bRow.guest_name as string) || guestEmail!.split("@")[0],
      email: guestEmail!,
      type: "guest",
      createdAt: oRow.first
        ? new Date(oRow.first as string).toISOString()
        : bRow.first
          ? new Date(bRow.first as string).toISOString()
          : new Date().toISOString(),
      purchaseCount: Number(oRow.cnt) || 0,
      totalSpend: Number(oRow.total) || 0,
      bookingCount: Number(bRow.cnt) || 0,
    }
  } else {
    // Registered user
    const userRows = await db.execute(sql`
      SELECT id, name, email, created_at FROM "user" WHERE id = ${clientId}
    `)
    const uRow = (userRows as any[])[0]
    if (!uRow) return null

    const orderStats = await db.execute(sql`
      SELECT COUNT(*)::int as cnt, COALESCE(SUM(total_cents), 0) as total
      FROM orders WHERE user_id = ${clientId}
    `)
    const bookingStats = await db.execute(sql`
      SELECT COUNT(*)::int as cnt FROM bookings WHERE user_id = ${clientId}
    `)
    const os = (orderStats as any[])[0] || {}
    const bs = (bookingStats as any[])[0] || {}

    client = {
      id: uRow.id as string,
      name: (uRow.name as string) || (uRow.email as string).split("@")[0],
      email: uRow.email as string,
      type: "registered",
      createdAt: new Date(uRow.created_at as string).toISOString(),
      purchaseCount: Number(os.cnt) || 0,
      totalSpend: Number(os.total) || 0,
      bookingCount: Number(bs.cnt) || 0,
    }
  }

  // Fetch purchases
  let purchaseQuery
  if (isGuest) {
    purchaseQuery = await db.execute(sql`
      SELECT o.id, o.created_at, o.total_cents, o.status,
        STRING_AGG(b.title, ', ') as items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN beats b ON b.id = oi.beat_id
      WHERE o.guest_email = ${guestEmail}
      GROUP BY o.id, o.created_at, o.total_cents, o.status
      ORDER BY o.created_at DESC
      LIMIT 20
    `)
  } else {
    purchaseQuery = await db.execute(sql`
      SELECT o.id, o.created_at, o.total_cents, o.status,
        STRING_AGG(b.title, ', ') as items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN beats b ON b.id = oi.beat_id
      WHERE o.user_id = ${clientId}
      GROUP BY o.id, o.created_at, o.total_cents, o.status
      ORDER BY o.created_at DESC
      LIMIT 20
    `)
  }

  const purchases: ClientDetailOrder[] = (purchaseQuery as any[]).map((r) => ({
    id: r.id as string,
    date: new Date(r.created_at as string).toLocaleDateString(),
    items: (r.items as string) || "Unknown items",
    total: `$${(Number(r.total_cents) / 100).toFixed(2)}`,
    status: r.status as string,
  }))

  // Fetch bookings
  let bookingQuery
  if (isGuest) {
    bookingQuery = await db.execute(sql`
      SELECT bk.id, bk.date, bk.start_time, bk.end_time, bk.status,
        s.name as service_name, rm.name as room_name
      FROM bookings bk
      LEFT JOIN services s ON s.id = bk.service_id
      LEFT JOIN rooms rm ON rm.id = bk.room_id
      WHERE bk.guest_email = ${guestEmail}
      ORDER BY bk.date DESC
      LIMIT 20
    `)
  } else {
    bookingQuery = await db.execute(sql`
      SELECT bk.id, bk.date, bk.start_time, bk.end_time, bk.status,
        s.name as service_name, rm.name as room_name
      FROM bookings bk
      LEFT JOIN services s ON s.id = bk.service_id
      LEFT JOIN rooms rm ON rm.id = bk.room_id
      WHERE bk.user_id = ${clientId}
      ORDER BY bk.date DESC
      LIMIT 20
    `)
  }

  const clientBookings: ClientDetailBooking[] = (bookingQuery as any[]).map(
    (r) => ({
      id: r.id as string,
      serviceName: (r.service_name as string) || "Unknown",
      date: r.date as string,
      startTime: r.start_time as string,
      endTime: r.end_time as string,
      status: r.status as string,
      roomName: (r.room_name as string) || "Unknown",
    })
  )

  return { client, purchases, bookings: clientBookings }
}
