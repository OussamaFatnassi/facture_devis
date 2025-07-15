import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get("auth-token")?.value;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/user-auth",
    "/user-auth/login",
    "/user-auth/signup",
    "/api/auth/login",
    "/api/auth/register",
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token is present and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL("/user-auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token is present, allow access to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
