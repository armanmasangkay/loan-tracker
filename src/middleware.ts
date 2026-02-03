import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session");
  const pathname = request.nextUrl.pathname;

  // Public routes - let the page handle auth checks
  // (cookie may exist but be invalid/expired)
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Root - let the page handle auth and redirect appropriately
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
