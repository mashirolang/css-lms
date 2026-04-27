import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.nextUrl.origin), {
    status: 302,
  });

  response.cookies.set("session-user-id", "", { maxAge: 0, path: "/" });
  response.cookies.set("user-role",        "", { maxAge: 0, path: "/" });
  response.cookies.set("user-name",        "", { maxAge: 0, path: "/" });

  return response;
}
