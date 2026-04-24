import { test, expect } from "@playwright/test"
import * as fs from "node:fs"
import * as path from "node:path"

const CANCEL_ROUTE = fs.readFileSync(
  path.resolve("src/app/api/bookings/cancel/route.ts"),
  "utf8",
)

const RESCHEDULE_ROUTE = fs.readFileSync(
  path.resolve("src/app/api/bookings/reschedule/route.ts"),
  "utf8",
)

const SEND_HELPER = fs.readFileSync(
  path.resolve("src/lib/email/send-booking-modification.ts"),
  "utf8",
)

test.describe("24-02 Booking modification email wired", () => {
  test("send helper imports BookingModificationEmail template", () => {
    expect(SEND_HELPER).toContain("BookingModificationEmail")
    expect(SEND_HELPER).toContain("[email:booking-mod] skipped")
  })

  test("cancel route fires email with newDate: null for admin path", () => {
    expect(CANCEL_ROUTE).toContain("sendBookingModificationEmail")
    expect(CANCEL_ROUTE).toContain("newDate: null")
    // Admin + client paths both fire — two call sites
    const matches = CANCEL_ROUTE.match(/sendBookingModificationEmail\(/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  test("reschedule route fires email with non-null newDate when date changed", () => {
    expect(RESCHEDULE_ROUTE).toContain("sendBookingModificationEmail")
    expect(RESCHEDULE_ROUTE).toContain("dateChanged")
    // Reschedule should pass newDate (from the request body) — confirm it's not null
    const hasNonNullNewDate = /sendBookingModificationEmail\([\s\S]*?newDate,/.test(
      RESCHEDULE_ROUTE,
    )
    expect(hasNonNullNewDate).toBe(true)
  })

  test("send helper is guarded against missing email + logs errors", () => {
    expect(SEND_HELPER).toContain("no recipient email")
    expect(SEND_HELPER).toContain("[email:booking-mod] Resend send failed")
    expect(SEND_HELPER).toContain("[email:booking-mod] Unexpected error")
  })
})
