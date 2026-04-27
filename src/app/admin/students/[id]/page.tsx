import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { 
  ChevronLeft, Mail, GraduationCap, 
  Calendar, ShieldCheck, UserCircle
} from "lucide-react";

import { ProfileInfoPanel } from "./_components/ProfileInfoPanel";
import { TranscriptPanel } from "./_components/TranscriptPanel";
import { SkillsActivitiesPanel } from "./_components/SkillsActivitiesPanel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminStudentDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Parallel data fetching
  const [
    { data: studentData },
    { data: profile },
    { data: extendedProfile },
    { data: grades },
    { data: gpaSummary },
    { data: skills },
    { data: activities }
  ] = await Promise.all([
    supabase.from("students").select("*, courses(name, code)").eq("id", id).single(),
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("student_extended_profiles").select("*").eq("student_id", id).maybeSingle(),
    supabase.rpc("get_student_gpa", { p_student_id: id }),
    supabase.rpc("get_student_gpa_summary", { p_student_id: id }),
    supabase.from("student_skills").select("*").eq("student_id", id).order("category"),
    supabase.from("student_cocurricular").select("*").eq("student_id", id).order("start_date", { ascending: false })
  ]);

  if (!studentData || !profile) {
    notFound();
  }

  const student = studentData as any;
  const fullName = `${profile.first_name} ${profile.last_name}`;
  const summary = gpaSummary?.[0] || { gpa: null, total_units: 0, graded_units: 0, subjects_count: 0 };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Profile</h1>
          <p className="text-slate-500 text-sm font-medium">Viewing record for <span className="text-slate-900 font-bold">{fullName}</span></p>
        </div>
      </div>

      <Card className="relative overflow-hidden border-0 shadow-2xl bg-white rounded-3xl">
        <div className="absolute top-0 left-0 w-full h-32 bg-slate-900" />
        <div className="relative pt-16 px-8 pb-8 flex flex-col md:flex-row items-end gap-6">
          <Avatar className="h-32 w-32 border-8 border-white shadow-2xl shrink-0">
            {profile.avatar_url && <AvatarImage src={profile.avatar_url} />}
            <AvatarFallback className="bg-blue-600 text-3xl font-black text-white">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900">{fullName}</h2>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black px-3 py-1 uppercase text-[10px] tracking-widest">
                {student.status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-slate-400" />
                <span className="text-slate-900 font-bold">{student.student_number || "PENDING"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-slate-400" />
                <span>{student.courses?.code} · Year {student.year_level} · {student.section}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-slate-50 font-black text-slate-600 gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Verified Record
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-full md:w-auto h-auto flex flex-wrap">
          <TabsTrigger value="info" className="rounded-xl px-8 py-2.5 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
            Student Information
          </TabsTrigger>
          <TabsTrigger value="transcript" className="rounded-xl px-8 py-2.5 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
            Academic Transcript
          </TabsTrigger>
          <TabsTrigger value="skills" className="rounded-xl px-8 py-2.5 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
            Skills & Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-0">
          <ProfileInfoPanel profile={profile} extended={extendedProfile} student={student} />
        </TabsContent>

        <TabsContent value="transcript" className="mt-0">
          <TranscriptPanel grades={grades || []} gpa={summary} />
        </TabsContent>

        <TabsContent value="skills" className="mt-0">
          <SkillsActivitiesPanel skills={skills || []} activities={activities || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
