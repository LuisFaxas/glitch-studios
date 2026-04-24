import { NextRequest, NextResponse } from "next/server"

const STUDIOS_HOSTS = new Set([
  "glitchstudios.io",
  "www.glitchstudios.io",
])
const TECH_HOSTS = new Set([
  "glitchtech.io",
  "www.glitchtech.io",
])
const APPAREL_HOSTS = new Set([
  "glitchapparel.com",
  "www.glitchapparel.com",
])
const REVIEWS_HOSTS = new Set([
  "glitch.reviews",
  "www.glitch.reviews",
])

function getHostname(request: NextRequest): string {
  const header = request.headers.get("host") ?? ""
  return header.split(":")[0].toLowerCase()
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = getHostname(request)

  // Admin auth gate — applies on ANY host that can reach /admin.
  // Per Phase 09 infra plan: both glitchstudios.io/admin and
  // glitchtech.io/admin work; a single login gates both.
  //
  // Cookie name varies: Better Auth adds the __Secure- prefix on HTTPS
  // (production), plain name on HTTP (local dev). Check both.
  if (url.pathname.startsWith("/admin")) {
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token")
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
  }

  // glitch.reviews — vanity redirect to glitchtech.io/reviews. Path is
  // preserved so glitch.reviews/rtx-5090 lands at glitchtech.io/reviews/rtx-5090.
  // 301 permanent so search engines forward link juice.
  if (REVIEWS_HOSTS.has(hostname)) {
    const suffix =
      url.pathname === "/" ? "" : url.pathname.replace(/^\/+/, "/")
    const targetUrl = `https://glitchtech.io/reviews${suffix}${url.search}`
    return NextResponse.redirect(targetUrl, 301)
  }

  // glitchapparel.com — rewrite everything to the coming-soon page.
  if (APPAREL_HOSTS.has(hostname)) {
    if (!url.pathname.startsWith("/apparel-coming-soon")) {
      return NextResponse.rewrite(
        new URL("/apparel-coming-soon", request.url)
      )
    }
    return NextResponse.next()
  }

  // Shared surfaces that must resolve identically on ALL brands
  // (auth flows, client dashboard). Skip the /tech rewrite below so
  // glitchtech.io/login doesn't get rewritten to /tech/login (which
  // doesn't exist, 404s).
  const SHARED_AUTH_PATHS = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/unsubscribe",
    "/dashboard",
  ]
  const isSharedAuthPath = SHARED_AUTH_PATHS.some((p) =>
    url.pathname === p || url.pathname.startsWith(p + "/")
  )

  // glitchtech.io — serve /tech/* pages at the domain root.
  // Two-way transform:
  //   - If user arrives at /tech/foo (internal link), 307 redirect to /foo
  //     so the browser URL stays clean.
  //   - Rewrite root paths /foo -> /tech/foo internally.
  //   - EXCEPT shared-auth paths above, which must render as-is.
  if (TECH_HOSTS.has(hostname)) {
    if (isSharedAuthPath) {
      return NextResponse.next()
    }
    if (url.pathname.startsWith("/tech")) {
      const cleanPath = url.pathname.replace(/^\/tech/, "") || "/"
      const redirectUrl = new URL(cleanPath, request.url)
      redirectUrl.search = url.search
      return NextResponse.redirect(redirectUrl, 307)
    }
    const targetPath = url.pathname === "/" ? "/tech" : `/tech${url.pathname}`
    const rewriteUrl = new URL(targetPath, request.url)
    rewriteUrl.search = url.search
    return NextResponse.rewrite(rewriteUrl)
  }

  // glitchstudios.io (or unrecognised host incl. Vercel preview URLs) —
  // serve the main public site as-is. The (public) route group in
  // src/app/(public) is transparent to the URL.
  void STUDIOS_HOSTS
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all request paths except:
    // - Next internals (/_next/*)
    // - API routes (keep CORS/rewrite out of the middleware hot path)
    // - Next.js generated icon routes (icon, apple-icon, opengraph-image, etc.)
    //   These are served from /icon-<hash> without a file extension, so they
    //   would otherwise match the default "page path" rule and get rewritten.
    // - Static image extensions and favicon
    "/((?!_next/static|_next/image|api|favicon.ico|icon|apple-icon|opengraph-image|twitter-image|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|webmanifest)$).*)",
  ],
}
