import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Only guard premium pages; let /premium/lock itself pass
  if (pathname.startsWith("/premium") && pathname !== "/premium/lock") {
    const cookie = req.cookies.get("pr_access");
    if (!cookie || cookie.value !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/premium/lock";
      url.searchParams.set("next", pathname + (search || ""));
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/premium/:path*"],
};
