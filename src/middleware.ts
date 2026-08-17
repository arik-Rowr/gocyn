import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  if (host.startsWith("main.")) {
    // If already inside /admin, allow
    if (!url.pathname.startsWith("/admin")) {
      url.pathname = "/admin/login"; // 👈 IMPORTANT
      return NextResponse.rewrite(url);
    }
  }

  if (host === "mentor.gocyn.com" || host === "www.mentor.gocyn.com") {
    // Already on partner routes
    if (!url.pathname.startsWith("/partner")) {
      url.pathname = "/partner/login";

      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};
