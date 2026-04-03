import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, LOGIN_PATH } from "@/features/auth/config";
import { getExpectedAuthToken } from "@/features/auth/utils";

function isPublicPath(pathname: string) {
  return (
    pathname === LOGIN_PATH ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/favicon.ico"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (pathname === LOGIN_PATH) {
      const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

      if (token) {
        try {
          const expectedToken = await getExpectedAuthToken();

          if (token === expectedToken) {
            return NextResponse.redirect(new URL("/", request.url));
          }
        } catch {
          return NextResponse.next();
        }
      }
    }

    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  try {
    const expectedToken = await getExpectedAuthToken();

    if (token !== expectedToken) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
  } catch {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
