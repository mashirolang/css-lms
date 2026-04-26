import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/shared/AppShell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session-user-id")?.value;

  if (!userId) redirect("/student/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name, avatar_url, email, force_password_change")
    .eq("id", userId)
    .single();

  if (!profile || profile.role !== "student") redirect("/student/login");

  if (profile.force_password_change) redirect("/first-login");

  return (
    <AppShell
      role="student"
      userName={`${profile.first_name} ${profile.last_name}`}
      userEmail={profile.email ?? ""}
      userAvatar={profile.avatar_url ?? undefined}
    >
      {children}
    </AppShell>
  );
}
