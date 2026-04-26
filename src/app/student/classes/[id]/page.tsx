"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, BarChart2, FileDown, Upload, CheckCircle2, AlertCircle, Clock, Star, X, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDate, cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const statusInfo = {
  not_started: { label: "Not Started", color: "bg-slate-100 text-slate-600", icon: <AlertCircle className="h-3.5 w-3.5" /> },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: <Upload className="h-3.5 w-3.5" /> },
  graded: { label: "Graded", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

const typeColor = {
  assignment: "bg-blue-100 text-blue-700",
  quiz: "bg-amber-100 text-amber-700",
  exam: "bg-red-100 text-red-700",
};

interface ActivityItem {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  status: "not_started" | "submitted" | "graded";
  score: number | null;
  maxScore: number;
}

export default function StudentClassDetailPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitActivity, setSubmitActivity] = useState<ActivityItem | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchClassData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
      if (!userId) return;

      // 1. Class Info
      const { data: subject, error: sErr } = await supabase
        .from("subjects")
        .select(`
          *,
          courses (name),
          faculty ( profiles (first_name, last_name) ),
          schedule_slots(*)
        `)
        .eq("id", id)
        .single();

      if (sErr) throw sErr;

      const slots = subject.schedule_slots || [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const schedStr = slots.length > 0 
        ? `${slots.map((sl: any) => days[sl.day_of_week]).join("/")} ${slots[0].start_time.slice(0,5)}–${slots[0].end_time.slice(0,5)}`
        : "TBA";

      const courseName = subject.courses?.name || subject.course_id || "Unknown";
      setClassInfo({
        code: subject.code,
        name: subject.name,
        faculty: subject.faculty?.profiles ? `${subject.faculty.profiles.first_name} ${subject.faculty.profiles.last_name}` : "TBA",
        section: `${courseName}-${subject.year_level}${subject.section}`,
        schedule: schedStr,
        room: slots[0]?.room || "TBA",
      });

      // 2. Activities & Submissions
      const { data: acts, error: aErr } = await supabase
        .from("activities")
        .select(`
          *,
          submissions(*)
        `)
        .eq("subject_id", id)
        .eq("submissions.student_id", userId);

      if (aErr) throw aErr;

      setActivities((acts || []).map(a => {
        const sub = a.submissions?.[0];
        let status: "not_started" | "submitted" | "graded" = "not_started";
        if (sub) {
          status = sub.score !== null ? "graded" : "submitted";
        }
        return {
          id: a.id,
          title: a.title,
          type: a.type,
          dueDate: a.due_date,
          status,
          score: sub?.score || null,
          maxScore: 100
        };
      }));

    } catch (err: any) {
      toast.error("Failed to load class details");
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchClassData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchClassData]);

  const openSubmit = (act: ActivityItem) => {
    setSubmitActivity(act);
    setSubmitOpen(true);
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
      if (!userId || !submitActivity || !file) return;

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${submitActivity.id}-${Date.now()}.${fileExt}`;
      const filePath = `activity-submissions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('submissions')
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await supabase.from("submissions").insert({
        activity_id: submitActivity.id,
        student_id: userId,
        content: `Attached: ${file.name}`,
        file_url: publicUrl,
        status: "submitted"
      });

      if (dbError) throw dbError;

      toast.success("Assignment submitted successfully");
      setSubmitOpen(false);
      fetchClassData();
    } catch (err: unknown) {
      const error = err as any;
      toast.error("Submission failed: " + (error.message || "Unknown error"));
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p>Loading class details...</p>
      </div>
    );
  }

  if (!classInfo) return <div className="p-8 text-center">Class not found</div>;

  const graded = activities.filter((a) => a.status === "graded");
  const average = graded.length > 0 ? Math.round(graded.reduce((acc, a) => acc + (a.score ?? 0), 0) / graded.length) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/student/classes">
          <Button variant="ghost" size="icon" className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-mono text-blue-600 font-medium">{classInfo.code}</p>
            <Badge variant="secondary">{classInfo.section}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{classInfo.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{classInfo.faculty} · {classInfo.schedule} · {classInfo.room}</p>
        </div>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="activities" className="gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="grades" className="gap-2">
            <BarChart2 className="h-3.5 w-3.5" />
            Grades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p>No activities yet</p>
              </div>
            ) : (
              activities.map((act) => (
                <Card key={act.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColor[act.type as keyof typeof typeColor]}`}>
                            {act.type}
                          </span>
                        </div>
                        <p className="font-medium text-slate-800">{act.title}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due {formatDate(act.dueDate)}
                          </span>
                          {act.score !== null && (
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <Star className="h-3 w-3" />
                              {act.score}/{act.maxScore}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full", statusInfo[act.status as keyof typeof statusInfo].color)}>
                          {statusInfo[act.status as keyof typeof statusInfo].icon}
                          {statusInfo[act.status as keyof typeof statusInfo].label}
                        </span>
                        {act.status === "not_started" && (
                          <Button size="sm" className="text-xs gap-1.5" onClick={() => openSubmit(act)}>
                            <Upload className="h-3.5 w-3.5" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="grades">
          <div className="space-y-4">
            {average !== null && (
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-700">{average}</p>
                    <p className="text-xs text-blue-500 font-medium">Current Average</p>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium">
                      {average >= 90 ? "Excellent!" : average >= 80 ? "Very Good" : average >= 75 ? "Good" : "Needs Improvement"}
                    </p>
                    <p className="text-xs text-blue-500 mt-0.5">Based on {graded.length} graded activities</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600 text-xs uppercase">Activity</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600 text-xs uppercase">Type</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600 text-xs uppercase">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-800">{act.title}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeColor[act.type as keyof typeof typeColor]}`}>
                            {act.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {act.score !== null ? (
                            <span className="font-semibold text-slate-800">{act.score}/{act.maxScore}</span>
                          ) : (
                            <span className="text-slate-400 text-xs">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Activity</DialogTitle>
          </DialogHeader>
          {submitActivity && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 mb-0.5">Submitting for:</p>
                <p className="font-medium text-slate-800 text-sm">{submitActivity.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Due {formatDate(submitActivity.dueDate)}
                </p>
              </div>

              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed transition-colors",
                  file ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                )}
              >
                {file ? (
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate" title={file.name}>
                        {file.name.length > 30 ? file.name.slice(0, 20) + "..." + file.name.slice(-7) : file.name}
                      </p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-red-50 rounded text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-600">
                      <label className="text-blue-600 hover:underline cursor-pointer">
                        Choose file
                        <input
                          type="file"
                          className="sr-only"
                          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                        />
                      </label>
                      {" "}or drag and drop
                    </p>
                    <p className="text-xs text-slate-400">PDF, DOC, ZIP up to 10MB</p>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!file || submitLoading} className="gap-2">
                  <Upload className="h-4 w-4" />
                  {submitLoading ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
