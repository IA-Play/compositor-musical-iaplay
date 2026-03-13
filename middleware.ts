import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "EDITOR", "MODERATOR", "SUPPORT"]);

export default auth((req) => {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!req.auth?.user) {
      return NextResponse.redirect(new URL("/inscrever-se", req.url));
    }
    if (!ADMIN_ROLES.has(req.auth.user.role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"]
};
