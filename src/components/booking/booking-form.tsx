"use client"

import { useState } from "react"
import { z } from "zod"
import type { BookingFormData } from "@/types/booking"

const bookingFormSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Invalid email address"),
  guestPhone: z.string().min(7, "Invalid phone number"),
  notes: z.string().max(500).optional(),
  createAccount: z.boolean().optional(),
})

interface BookingFormProps {
  onSubmit: (data: Pick<BookingFormData, "guestName" | "guestEmail" | "guestPhone" | "notes" | "createAccount">) => void
  isLoggedIn: boolean
  userName?: string
  userEmail?: string
  isSubmitting: boolean
}

export function BookingForm({
  onSubmit,
  isLoggedIn,
  userName,
  userEmail,
  isSubmitting,
}: BookingFormProps) {
  const [guestName, setGuestName] = useState(userName ?? "")
  const [guestEmail, setGuestEmail] = useState(userEmail ?? "")
  const [guestPhone, setGuestPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [createAccount, setCreateAccount] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = bookingFormSchema.safeParse({
      guestName,
      guestEmail,
      guestPhone,
      notes: notes || undefined,
      createAccount,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setErrors({})
    onSubmit(result.data)
  }

  const inputClasses =
    "w-full bg-[#000000] border border-[#333333] px-4 py-3 text-[#f5f5f0] font-mono text-[14px] placeholder:text-[#555555] focus:border-[#f5f5f0] focus:shadow-[0_0_0_1px_rgba(245,245,240,0.2)] focus:outline-none transition-colors"
  const labelClasses =
    "font-mono text-[13px] font-bold uppercase tracking-[0.05em] text-[#888888]"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-mono text-[28px] font-bold uppercase tracking-[0.02em] text-[#f5f5f0]">
        YOUR DETAILS
      </h2>

      {isLoggedIn ? (
        <div className="border border-[#222222] bg-[#111111] px-4 py-3">
          <p className="font-mono text-[14px] text-[#f5f5f0]">
            Booking as <span className="font-bold">{userName}</span>
          </p>
          <p className="font-mono text-[13px] text-[#888888]">{userEmail}</p>
        </div>
      ) : (
        <>
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="guestName" className={labelClasses}>
              Full Name
            </label>
            <input
              id="guestName"
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your full name"
              className={inputClasses}
            />
            {errors.guestName && (
              <p className="font-mono text-[12px] text-red-400">{errors.guestName}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="guestEmail" className={labelClasses}>
              Email
            </label>
            <input
              id="guestEmail"
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="your@email.com"
              className={inputClasses}
            />
            {errors.guestEmail && (
              <p className="font-mono text-[12px] text-red-400">{errors.guestEmail}</p>
            )}
          </div>
        </>
      )}

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="guestPhone" className={labelClasses}>
          Phone
        </label>
        <input
          id="guestPhone"
          type="tel"
          required
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="(555) 555-5555"
          className={inputClasses}
        />
        {errors.guestPhone && (
          <p className="font-mono text-[12px] text-red-400">{errors.guestPhone}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label htmlFor="notes" className={labelClasses}>
          Notes <span className="font-normal normal-case text-[#555555]">(optional)</span>
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything we should know before your session?"
          maxLength={500}
          rows={3}
          className={inputClasses + " resize-none"}
        />
        <p className="font-mono text-[11px] text-[#555555] text-right">
          {notes.length}/500
        </p>
      </div>

      {/* Create Account checkbox (guest only) */}
      {!isLoggedIn && (
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={createAccount}
            onChange={(e) => setCreateAccount(e.target.checked)}
            className="w-4 h-4 accent-[#f5f5f0] bg-[#000000] border border-[#333333]"
          />
          <span className="font-mono text-[13px] text-[#888888] group-hover:text-[#f5f5f0] transition-colors">
            Create an account for easy rebooking
          </span>
        </label>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#f5f5f0] text-[#000000] font-mono font-bold uppercase px-6 py-3 tracking-[0.05em] hover:bg-[#ffffff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "PROCESSING..." : "CONTINUE TO PAYMENT"}
      </button>
    </form>
  )
}
