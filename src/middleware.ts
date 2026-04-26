import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/admin/login",
  "/faculty/login",
  "/faculty/register",
  "/student/login",
  "/login",
  "/register",
  "/pending-approval",
  "/first-login",
  "/api/auth",
];

const ROLE_PATHS: Record<string, string> = {
  admin: "/admin",
  faculty: "/faculty",
  student: "/student",
};

const LOGIN_PAGES = ["/admin/login", "/faculty/login", "/student/login", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userId = request.cookies.get("session-user-id")?.value;
  const role   = request.cookies.get("user-role")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // No session → gate protected routes
  if (!userId && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Logged-in user hitting login pages or root → send to dashboard
  const isLoginOrRoot = pathname === "/" || LOGIN_PAGES.some((p) => pathname === p);
  if (userId && isLoginOrRoot) {
    const dest = role ? (ROLE_PATHS[role] ?? "/") : "/";
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
