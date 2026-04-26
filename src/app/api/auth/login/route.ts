import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  if (!email || !password || !role) {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const supabase = await createClient();

  console.log("Login attempt for:", email, "with role:", role);

  const { data, error } = await supabase.rpc("verify_password", {
    p_email: email,
    p_password: password,
    p_role: role,
  });

  if (error) {
    console.error("RPC Error:", error);
  } else {
    console.log("RPC Data:", data);
  }

  if (error || !data || data.length === 0) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const user = data[0] as {
    id: string;
    role: string;
    first_name: string;
    last_name: string;
    force_password_change: boolean;
  };

  const redirect = user.force_password_change ? "/first-login" : `/${user.role}`;

  const res = NextResponse.json({ success: true, redirect });

  const cookieOpts = { httpOnly: true, path: "/", maxAge: 86400, sameSite: "lax" } as const;
  res.cookies.set("session-user-id", user.id, cookieOpts);
  res.cookies.set("user-id", user.id, { ...cookieOpts, httpOnly: false });
  res.cookies.set("user-role", user.role, { ...cookieOpts, httpOnly: false });
  res.cookies.set("user-name", `${user.first_name} ${user.last_name}`, { ...cookieOpts, httpOnly: false });

  return res;
}
