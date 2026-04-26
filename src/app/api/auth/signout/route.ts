import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    { status: 302 }
  );

  response.cookies.set("session-user-id", "", { maxAge: 0, path: "/" });
  response.cookies.set("user-role",        "", { maxAge: 0, path: "/" });
  response.cookies.set("user-name",        "", { maxAge: 0, path: "/" });

  return response;
}
