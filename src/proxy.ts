import { NextRequest, NextResponse } from "next/server";

interface IUser {
  id: string;
  email: string;
  role: "ADMIN" | "USER" | string;
}

const roleBasedRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/user": ["USER", "ADMIN"],
};

const publicRoutes = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const user: IUser | null = null;

  // if (!accessToken) {
  //   if (publicRoutes.includes(pathname)) {
  //     return NextResponse.next();
  //   }
  //   return NextResponse.redirect(
  //     new URL(`/login?redirect=${pathname}`, request.url),
  //   );
  // }

  // // 2. Token decode
  // try {
  //   user = decodeJwt(accessToken) as IUser;
  // } catch {
  //   return NextResponse.redirect(
  //     new URL(`/login?redirect=${pathname}`, request.url),
  //   );
  // }

  // if (user && publicRoutes.includes(pathname)) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // // 4. Role-based route check
  // if (user) {
  //   const matchedRouteKey = Object.keys(roleBasedRoutes).find((route) =>
  //     pathname.startsWith(route),
  //   );

  //   if (matchedRouteKey) {
  //     const allowedRoles = roleBasedRoutes[matchedRouteKey];

  //     const userRole = user.role?.toUpperCase();
  //     if (!allowedRoles.includes(userRole)) {
  //       return NextResponse.redirect(new URL("/unauthorized", request.url));
  //     }
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
    "/reset-password",
  ],
};
