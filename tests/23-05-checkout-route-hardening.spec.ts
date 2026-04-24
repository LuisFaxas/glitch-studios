import { test, expect } from "@playwright/test"

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3004"

test.describe("23-05 Checkout route hardening", () => {
  test("POST /api/checkout with empty cart returns 400 + JSON error", async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/api/checkout`, {
      data: { items: [] },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty("error")
    expect(body.error).toMatch(/cart is empty|no items/i)
  })

  test("POST /api/checkout with missing items returns 400", async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/api/checkout`, { data: {} })
    expect([400, 422]).toContain(res.status())
    const body = await res.json()
    expect(body).toHaveProperty("error")
  })

  test("POST /api/checkout with invalid JSON returns 400 + structured error", async ({
    request,
  }) => {
    const res = await request.post(`${BASE_URL}/api/checkout`, {
      data: "not json" as unknown as object,
      headers: { "Content-Type": "application/json" },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body).toHaveProperty("error")
  })

  test("client /checkout with empty cart shows user-friendly message", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "domcontentloaded" })
    await expect(
      page.getByText(/cart is empty|browse beats|no items/i).first(),
    ).toBeVisible({ timeout: 5_000 })
  })
})
