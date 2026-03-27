export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"

export type DepositType = "percentage" | "flat"

export type RefundPolicy = "full" | "partial" | "none"

export interface TimeSlot {
  roomId: string
  roomName: string
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
}

export interface BookingFormData {
  serviceId: string
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  roomId: string
  guestName: string
  guestEmail: string
  guestPhone: string
  notes?: string
  createAccount?: boolean
  isRecurring?: boolean
  recurringWeeks?: number
  packageId?: string
}

export interface BookingWithRelations {
  id: string
  serviceName: string
  roomName: string
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
  depositAmount: string
  totalPrice: string
  guestName: string
  guestEmail: string
  guestPhone: string
  notes: string | null
  seriesId: string | null
  createdAt: Date
  cancelledAt: Date | null
  cancellationReason: string | null
}

export interface ServiceBookingInfo {
  serviceId: string
  serviceName: string
  serviceSlug: string
  durationMinutes: number
  depositType: DepositType
  depositValue: number
  autoConfirm: boolean
  cancellationWindowHours: number
  refundPolicy: RefundPolicy
  maxAdvanceBookingDays: number
  prepInstructions: string | null
  priceLabel: string
}

export interface RoomInfo {
  id: string
  name: string
  slug: string
  description: string | null
  features: string[]
  hourlyRateOverride: number | null
  bufferMinutes: number
}

export interface PackageInfo {
  id: string
  name: string
  sessionCount: number
  discountPercent: number
  serviceId: string
}
