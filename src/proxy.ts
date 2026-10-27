import { decodeJwt } from "jose";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/register", "/verify-email", "/forgot-password", "/reset-password", "/change-password"];
const isPublicRoute = (pathname: string) => publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
const screeningRoute = "/patient/screening/new";

const destinationForRole = (role: string) =>
  role === "ADMIN"
    ? "/admin/dashboard"
    : role === "DOCTOR"
      ? "/doctor"
      : role === "PATIENT"
        ? "/patient/dashboard"
        : "/user";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  let role = "";
  if (token) {
    try {
      const claims = decodeJwt(token);
      if (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now()) throw new Error("expired");
      role = typeof claims.role === "string" ? claims.role.toUpperCase() : "";
    } catch {
      const response = NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}&session=expired`, request.url));
      response.cookies.delete("token");
      return response;
    }
  }
  const protectedRoute = pathname.startsWith("/patient") || pathname.startsWith("/doctor") || pathname.startsWith("/admin") || pathname.startsWith("/user");
  if (protectedRoute && !token) return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
  if (role) {
    if (pathname.startsWith("/admin") && role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
    if (pathname === screeningRoute && role !== "PATIENT" && role !== "USER") {
      return NextResponse.redirect(new URL(destinationForRole(role), request.url));
    }
    if (pathname.startsWith("/patient") && pathname !== screeningRoute && role !== "PATIENT") return NextResponse.redirect(new URL("/", request.url));
    const applicantRoute = pathname === "/doctor/application" || pathname === "/doctor/pending-approval";
    if (pathname.startsWith("/doctor") && role !== "DOCTOR" && !(role === "USER" && applicantRoute)) return NextResponse.redirect(new URL("/", request.url));
    if (isPublicRoute(pathname)) {
      return NextResponse.redirect(new URL(destinationForRole(role), request.url));
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/user/:path*", "/patient/:path*", "/doctor/:path*", "/login", "/register", "/verify-email", "/forgot-password/:path*", "/reset-password", "/change-password"] };
