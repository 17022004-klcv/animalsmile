import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";

const ADMIN_PATHS = /^\/admin(?:\/|$)/i;

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname;
  const isProtectedAdmin = ADMIN_PATHS.test(pathname);

  return getSession()
    .then((session) => {
      if (isProtectedAdmin) {
        if (!session || session.rol !== "Administrador") {
          const redirectUrl = new URL("/login", request.url);
          redirectUrl.searchParams.set("redirect", pathname);
          return NextResponse.redirect(redirectUrl);
        }
      }

      return NextResponse.next();
    })
    .catch(() => {
      if (isProtectedAdmin) {
        const redirectUrl = new URL("/login", request.url);
        redirectUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(redirectUrl);
      }
      return NextResponse.next();
    });
}
