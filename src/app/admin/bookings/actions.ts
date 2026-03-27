"use server"

import { eq, and, gte, lte, ilike, or, desc, ne } from "drizzle-orm"
import { db } from "@/lib/db"
import { bookings, services, rooms, serviceBookingConfig } from "@/db/schema"

export type AdminBookingRow = {
  id: string
  serviceName: string
  serviceType: string
  roomName: string
  roomId: string
  date: string
  startTime: string
  endTime: string
  status: string
  depositAmount: string
  totalPrice: string
  guestName: string
  guestEmail: string
  guestPhone: string
  notes: string | null
  seriesId: string | null
  serviceId: string
  stripePaymentIntentId: string | null
  createdAt: Date
  cancelledAt: Date | null
  cancellationReason: string | null
}

/**
 * Query bookings for a 7-day week starting from startDate.
 * Joined with services and rooms for display.
 * Excludes cancelled bookings.
 */
export async function getBookingsForWeek(startDate: string): Promise<AdminBookingRow[]> {
  // Calculate end date (6 days after start = 7 day span)
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const endDate = end.toISOString().split("T")[0]

  const rows = await db
    .select({
      id: bookings.id,
      serviceName: services.name,
      serviceType: services.type,
      roomName: rooms.name,
      roomId: bookings.roomId,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      depositAmount: bookings.depositAmount,
      totalPrice: bookings.totalPrice,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      guestPhone: bookings.guestPhone,
      notes: bookings.notes,
      seriesId: bookings.seriesId,
      serviceId: bookings.serviceId,
      stripePaymentIntentId: bookings.stripePaymentIntentId,
      createdAt: bookings.createdAt,
      cancelledAt: bookings.cancelledAt,
      cancellationReason: bookings.cancellationReason,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(
      and(
        gte(bookings.date, startDate),
        lte(bookings.date, endDate),
        ne(bookings.status, "cancelled")
      )
    )
    .orderBy(bookings.date, bookings.startTime)

  return rows as AdminBookingRow[]
}

/**
 * Query all bookings with optional status filter and search.
 * Ordered by createdAt descending.
 */
export async function getBookingsFiltered(filters: {
  status?: string
  search?: string
}): Promise<AdminBookingRow[]> {
  const conditions = []

  if (filters.status && filters.status !== "all") {
    conditions.push(eq(bookings.status, filters.status as any))
  }

  if (filters.search) {
    const term = `%${filters.search}%`
    conditions.push(
      or(
        ilike(bookings.guestName, term),
        ilike(bookings.guestEmail, term)
      )!
    )
  }

  const rows = await db
    .select({
      id: bookings.id,
      serviceName: services.name,
      serviceType: services.type,
      roomName: rooms.name,
      roomId: bookings.roomId,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      depositAmount: bookings.depositAmount,
      totalPrice: bookings.totalPrice,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      guestPhone: bookings.guestPhone,
      notes: bookings.notes,
      seriesId: bookings.seriesId,
      serviceId: bookings.serviceId,
      stripePaymentIntentId: bookings.stripePaymentIntentId,
      createdAt: bookings.createdAt,
      cancelledAt: bookings.cancelledAt,
      cancellationReason: bookings.cancellationReason,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bookings.createdAt))

  return rows as AdminBookingRow[]
}

/**
 * Full booking detail for admin sheet view.
 * Includes service booking config for policy info.
 */
export async function getBookingDetail(bookingId: string) {
  const [row] = await db
    .select({
      id: bookings.id,
      serviceName: services.name,
      serviceType: services.type,
      roomName: rooms.name,
      roomId: bookings.roomId,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      depositAmount: bookings.depositAmount,
      totalPrice: bookings.totalPrice,
      guestName: bookings.guestName,
      guestEmail: bookings.guestEmail,
      guestPhone: bookings.guestPhone,
      notes: bookings.notes,
      seriesId: bookings.seriesId,
      serviceId: bookings.serviceId,
      stripePaymentIntentId: bookings.stripePaymentIntentId,
      createdAt: bookings.createdAt,
      cancelledAt: bookings.cancelledAt,
      cancellationReason: bookings.cancellationReason,
      // Config fields
      cancellationWindowHours: serviceBookingConfig.cancellationWindowHours,
      refundPolicy: serviceBookingConfig.refundPolicy,
      autoConfirm: serviceBookingConfig.autoConfirm,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .leftJoin(serviceBookingConfig, eq(serviceBookingConfig.serviceId, bookings.serviceId))
    .where(eq(bookings.id, bookingId))
    .limit(1)

  return row || null
}

/**
 * Get all active rooms for calendar row headers.
 */
export async function getRoomsForCalendar() {
  const rows = await db
    .select({
      id: rooms.id,
      name: rooms.name,
      slug: rooms.slug,
    })
    .from(rooms)
    .where(eq(rooms.isActive, true))
    .orderBy(rooms.sortOrder)

  return rows
}
