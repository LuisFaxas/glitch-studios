/**
 * Phase 16.1 Plan 04 + 05 — canonical public-route inventory.
 *
 * Single source of truth shared by the audit-sweep spec (Plan 04) and the
 * responsive-breakpoint spec (Plan 05). Both specs iterate over ROUTES —
 * DO NOT redefine the list inline in either spec or the two will drift.
 *
 * Dynamic segments ([slug]) are represented by one real seeded slug so the
 * page renders meaningful content during the sweep instead of a loading/404
 * state.
 *
 * Middleware (src/middleware.ts) rewrites glitchtech.io → /tech internally;
 * on localhost both brands share one origin and the /tech/* paths route
 * directly. No middleware-only virtual routes exist beyond that rewrite.
 *
 * Auth-gated routes (/dashboard*, /checkout) redirect to /login on an
 * unauthenticated session — the sweep still visits them and captures the
 * resulting landing page, which IS the user-facing behavior.
 */
export interface Route {
  url: string
  /** Short label for the audit report. */
  label: string
  /** "dynamic" marks routes where the slug is a representative sample. */
  kind: "static" | "dynamic"
  /** Auth-required routes redirect to /login; noted so the report is honest
   *  about what the sweep actually captured. */
  authGated?: boolean
  /** Some routes live outside the default sidebar (e.g. checkout success) —
   *  noted so layout regressions are diagnosed against the right shell. */
  layoutGroup?: "public" | "tech" | "bare"
}

export const ROUTES: readonly Route[] = [
  // === Studios public (root origin on prod) ===
  { url: "/", label: "Studios home", kind: "static", layoutGroup: "public" },
  { url: "/beats", label: "Beats catalog", kind: "static", layoutGroup: "public" },
  { url: "/services", label: "Services", kind: "static", layoutGroup: "public" },
  { url: "/book", label: "Book session", kind: "static", layoutGroup: "public" },
  { url: "/book/confirmation", label: "Booking confirmation", kind: "static", layoutGroup: "public" },
  { url: "/portfolio", label: "Portfolio", kind: "static", layoutGroup: "public" },
  { url: "/portfolio/midnight-run-music-video", label: "Portfolio detail", kind: "dynamic", layoutGroup: "public" },
  { url: "/artists", label: "Artists", kind: "static", layoutGroup: "public" },
  { url: "/artists/trap-snyder", label: "Artist detail", kind: "dynamic", layoutGroup: "public" },
  { url: "/blog", label: "Blog index", kind: "static", layoutGroup: "public" },
  { url: "/blog/welcome-to-glitch-studios", label: "Blog post", kind: "dynamic", layoutGroup: "public" },
  { url: "/contact", label: "Contact", kind: "static", layoutGroup: "public" },
  { url: "/unsubscribe", label: "Unsubscribe", kind: "static", layoutGroup: "bare" },
  { url: "/checkout", label: "Checkout", kind: "static", authGated: true, layoutGroup: "public" },
  { url: "/checkout/success", label: "Checkout success", kind: "static", layoutGroup: "public" },
  { url: "/dashboard", label: "Dashboard home", kind: "static", authGated: true, layoutGroup: "public" },
  { url: "/dashboard/bookings", label: "Dashboard bookings", kind: "static", authGated: true, layoutGroup: "public" },
  { url: "/dashboard/purchases", label: "Dashboard purchases", kind: "static", authGated: true, layoutGroup: "public" },

  // === GlitchTech (glitchtech.io on prod, /tech/* on localhost) ===
  { url: "/tech", label: "Tech home", kind: "static", layoutGroup: "tech" },
  { url: "/tech/reviews", label: "Tech reviews index", kind: "static", layoutGroup: "tech" },
  { url: "/tech/reviews/macbook-pro-m4", label: "Tech review detail", kind: "dynamic", layoutGroup: "tech" },
  { url: "/tech/categories", label: "Tech categories", kind: "static", layoutGroup: "tech" },
  { url: "/tech/categories/laptops", label: "Tech category detail", kind: "dynamic", layoutGroup: "tech" },
  { url: "/tech/compare", label: "Tech compare", kind: "static", layoutGroup: "tech" },
  { url: "/tech/benchmarks", label: "Tech benchmarks", kind: "static", layoutGroup: "tech" },
  { url: "/tech/blog", label: "Tech blog (stub)", kind: "static", layoutGroup: "tech" },
  { url: "/tech/about", label: "Tech about", kind: "static", layoutGroup: "tech" },
] as const

/** Viewports for the Plan 04 medium-depth sweep — D-13: mobile / laptop / desktop. */
export const SWEEP_VIEWPORTS: ReadonlyArray<{
  name: string
  width: number
  height: number
}> = [
  { name: "mobile-375", width: 375, height: 667 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "desktop-1920", width: 1920, height: 1080 },
] as const

/** Full Plan 05 breakpoint matrix (D-15): 375/393/768/1024/1280/1366/1440/1920. */
export const BREAKPOINT_VIEWPORTS: ReadonlyArray<{
  name: string
  width: number
  height: number
}> = [
  { name: "mobile-375", width: 375, height: 667 },
  { name: "mobile-393", width: 393, height: 852 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "tablet-1024", width: 1024, height: 768 },
  { name: "laptop-1280", width: 1280, height: 800 },
  { name: "laptop-1366", width: 1366, height: 768 },
  { name: "laptop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
] as const
