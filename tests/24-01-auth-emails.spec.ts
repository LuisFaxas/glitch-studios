import { test, expect } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"

test.describe("24-01 Auth emails wired to Resend", () => {
  test("POST /api/auth/request-password-reset returns 200 for unknown email (timing-safe)", async ({
    request,
  }) => {
    const res = await request.post(
      `${BASE_URL}/api/auth/request-password-reset`,
      {
        data: {
          email: `nobody-24-01-${Date.now()}@example.com`,
          redirectTo: `${BASE_URL}/reset-password`,
        },
      },
    )
    // Better Auth returns 200 + { status: true } for ALL emails (timing-attack mitigation).
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe(true)
  })

  test("POST /api/auth/request-password-reset returns 200 for real user email (triggers Resend send)", async ({
    request,
  }) => {
    const adminEmail = process.env.ADMIN_EMAIL
    test.skip(!adminEmail, "Admin email not set")
    const res = await request.post(
      `${BASE_URL}/api/auth/request-password-reset`,
      {
        data: {
          email: adminEmail!,
          redirectTo: `${BASE_URL}/reset-password`,
        },
      },
    )
    expect(res.status()).toBe(200)
  })
})
