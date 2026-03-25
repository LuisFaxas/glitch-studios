import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // For now, only check auth on /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("better-auth.session_token")
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
