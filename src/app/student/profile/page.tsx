import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { UserCircle, Mail, GraduationCap, MapPin, Calendar } from "lucide-react";

import { PersonalInfoTab } from "./_components/PersonalInfoTab";
import { AcademicPerformanceTab } from "./_components/AcademicPerformanceTab";
import { SkillsTab } from "./_components/SkillsTab";
import { ActivitiesTab } from "./_components/ActivitiesTab";

export default async function StudentProfilePage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const userId = user.id;

  // Parallel data fetching
  const [
    { data: profile },
    { data: studentData },
    { data: extendedProfile },
    { data: grades },
    { data: gpaSummary },
    { data: skills },
    { data: activities }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("students").select("*, courses(name, code)").eq("id", userId).single(),
    supabase.from("student_extended_profiles").select("*").eq("student_id", userId).maybeSingle(),
    supabase.rpc("get_student_gpa", { p_student_id: userId }),
    supabase.rpc("get_student_gpa_summary", { p_student_id: userId }),
    supabase.from("student_skills").select("*").eq("student_id", userId).order("category"),
    supabase.from("student_cocurricular").select("*").eq("student_id", userId).order("start_date", { ascending: false })
  ]);

  const fullName = `${profile?.first_name} ${profile?.last_name}`;
  const student = studentData as any;
  const summary = gpaSummary?.[0] || { gpa: null, total_units: 0, graded_units: 0, subjects_count: 0 };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-slate-900 text-white rounded-3xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="h-48 w-48" />
        </div>
        
        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-white/10 shadow-2xl">
              {profile?.avatar_url && <AvatarImage src={profile.avatar_url} />}
              <AvatarFallback className="bg-blue-600 text-3xl font-black">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl shadow-lg border-4 border-slate-900">
              <UserCircle className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{fullName}</h1>
              <p className="text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 font-bold px-3 py-1">
                {student?.student_number || "NO ID ASSIGNED"}
              </Badge>
              <Badge variant="outline" className="text-slate-300 border-slate-700 font-bold px-3 py-1 uppercase tracking-wider text-[10px]">
                {student?.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-300 font-medium pt-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-500" />
                <span>{student?.courses?.name || "No Course"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />
                <span>Year {student?.year_level} · Section {student?.section}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full md:w-auto h-auto flex flex-wrap">
          <TabsTrigger value="personal" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            Personal Details
          </TabsTrigger>
          <TabsTrigger value="academic" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            Academic Performance
          </TabsTrigger>
          <TabsTrigger value="skills" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            Skills & Expertise
          </TabsTrigger>
          <TabsTrigger value="activities" className="rounded-xl px-6 py-2.5 font-bold text-sm data-[state=active]:bg-slate-900 data-[state=active]:text-white">
            Co-Curricular
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0">
          <PersonalInfoTab studentId={userId} extended={extendedProfile} />
        </TabsContent>

        <TabsContent value="academic" className="mt-0">
          <AcademicPerformanceTab 
            studentId={userId} 
            grades={grades || []} 
            gpa={summary} 
          />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <SkillsTab studentId={userId} skills={skills || []} />
        </TabsContent>

        <TabsContent value="activities" className="mt-0">
          <ActivitiesTab studentId={userId} activities={activities || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
