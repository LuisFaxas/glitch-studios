/**
 * Smoke test: hits every route and checks for successful rendering.
 * Usage: npx tsx scripts/smoke-test.ts
 * Requires dev server running on localhost:3000
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3004"

// Public routes (should return 200)
const publicRoutes = [
  "/",
  "/beats",
  "/services",
  "/book",
  "/portfolio",
  "/artists",
  "/blog",
  "/contact",
  "/login",
]

// Auth-gated routes (should return 200 if logged in, or 302/redirect if not)
const authRoutes = [
  "/dashboard",
  "/dashboard/purchases",
  "/dashboard/bookings",
]

// Admin routes (should return 200 if admin logged in, or 302/redirect if not)
const adminRoutes = [
  "/admin",
  "/admin/beats",
  "/admin/beats/new",
  "/admin/blog",
  "/admin/blog/new",
  "/admin/bookings",
  "/admin/services",
  "/admin/clients",
  "/admin/inbox",
  "/admin/newsletter",
  "/admin/media",
  "/admin/team",
  "/admin/testimonials",
  "/admin/settings",
  "/admin/roles",
  "/admin/homepage",
]

interface TestResult {
  route: string
  status: number
  pass: boolean
  error?: string
  redirectTo?: string
}

async function testRoute(route: string, expectRedirect = false): Promise<TestResult> {
  try {
    const res = await fetch(`${BASE_URL}${route}`, { redirect: "manual" })
    const pass = expectRedirect
      ? res.status === 302 || res.status === 307 || res.status === 308
      : res.status === 200

    const result: TestResult = { route, status: res.status, pass }

    if (res.status >= 300 && res.status < 400) {
      result.redirectTo = res.headers.get("location") || undefined
    }

    // For 200 responses, check for error indicators in HTML
    if (res.status === 200) {
      const html = await res.text()
      if (html.includes("Internal Server Error") || html.includes("Application error")) {
        result.pass = false
        result.error = "Server error in HTML body"
      }
    }

    return result
  } catch (err) {
    return { route, status: 0, pass: false, error: String(err) }
  }
}

async function runTests() {
  console.log(`\nSmoke Testing: ${BASE_URL}\n`)
  console.log("=".repeat(60))

  let passed = 0
  let failed = 0
  const failures: TestResult[] = []

  // Test public routes
  console.log("\n--- Public Routes ---")
  for (const route of publicRoutes) {
    const result = await testRoute(route)
    const icon = result.pass ? "PASS" : "FAIL"
    console.log(`  ${icon}  ${result.status}  ${route}${result.error ? ` (${result.error})` : ""}`)
    if (result.pass) passed++
    else { failed++; failures.push(result) }
  }

  // Test auth routes (expect redirect when not logged in)
  console.log("\n--- Auth Routes (expect redirect) ---")
  for (const route of authRoutes) {
    const result = await testRoute(route, true)
    const icon = result.pass ? "PASS" : "FAIL"
    console.log(`  ${icon}  ${result.status}  ${route}${result.redirectTo ? ` -> ${result.redirectTo}` : ""}`)
    if (result.pass) passed++
    else { failed++; failures.push(result) }
  }

  // Test admin routes (expect redirect when not logged in)
  console.log("\n--- Admin Routes (expect redirect) ---")
  for (const route of adminRoutes) {
    const result = await testRoute(route, true)
    const icon = result.pass ? "PASS" : "FAIL"
    console.log(`  ${icon}  ${result.status}  ${route}${result.redirectTo ? ` -> ${result.redirectTo}` : ""}`)
    if (result.pass) passed++
    else { failed++; failures.push(result) }
  }

  // Summary
  console.log("\n" + "=".repeat(60))
  console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`)

  if (failures.length > 0) {
    console.log("\nFailures:")
    for (const f of failures) {
      console.log(`  ${f.route}: ${f.status} ${f.error || ""}`)
    }
    process.exit(1)
  }

  console.log("\nAll routes passed!")
}

runTests()
