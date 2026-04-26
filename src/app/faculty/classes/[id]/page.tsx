"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Users, BookOpen, BarChart2, Check, X, Plus, 
  Loader2, Search, FileText, Send, Star, MoreVertical, ChevronRight,
  Clock, Calendar, Upload, Bell, ExternalLink
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getInitials, formatDate, cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ClassInfo {
  id: string;
  code: string;
  name: string;
  section: string;
  schedule: string;
  room: string;
}

interface Student {
  id: string;
  name: string;
  status: "present" | "absent";
}

interface Activity {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  submissions: number;
  total: number;
}

interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  content: string;
  fileUrl: string | null;
  score: number | null;
  status: string;
}

const typeColor: Record<string, string> = {
  assignment: "bg-blue-100 text-blue-700",
  quiz: "bg-amber-100 text-amber-700",
  exam: "bg-red-100 text-red-700",
};

// Helper for long filenames
const truncateName = (name: string, limit: number = 16) => {
  if (!name) return "";
  if (name.length <= limit) return name;
  const extIndex = name.lastIndexOf(".");
  if (extIndex !== -1 && name.length - extIndex <= 5) {
    const ext = name.slice(extIndex);
    return name.slice(0, limit - ext.length - 3) + "..." + ext;
  }
  return name.slice(0, limit) + "...";
};

export default function ClassDetailPage() {
  const { id } = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Modals
  const [gradingModal, setGradingModal] = useState(false);
  const [gradingSub, setGradingSub] = useState<Submission | null>(null);
  const [scoreInput, setScoreInput] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);

  const [postModal, setPostModal] = useState(false);
  const [postLoading, setPostLoading] = useState(false);

  const fetchClassData = useCallback(async () => {
    try {
      const { data: subject, error: sErr } = await supabase
        .from("subjects")
        .select(`
          *,
          courses(name),
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
        id: subject.id,
        code: subject.code,
        name: subject.name,
        section: `${courseName}-${subject.year_level}${subject.section}`,
        schedule: schedStr,
        room: slots[0]?.room || "TBA",
      });

      // Students
      const { data: enrolled } = await supabase
        .from("enrollments")
        .select(`student_id, students (profiles (id, first_name, last_name))`)
        .eq("subject_id", id);

      const studentList: Student[] = (enrolled || []).map((e: any) => ({
        id: e.student_id,
        name: `${e.students.profiles.first_name} ${e.students.profiles.last_name}`,
        status: "present" as const 
      }));
      setStudents(studentList);

      // Activities
      const { data: acts } = await supabase
        .from("activities")
        .select(`*, submissions(count)`)
        .eq("subject_id", id);
      
      setActivities((acts || []).map(a => ({
        id: a.id,
        title: a.title,
        type: a.type,
        dueDate: a.due_date,
        submissions: a.submissions?.[0]?.count || 0,
        total: studentList.length
      })));

    } catch (err: unknown) {
      toast.error("Failed to load class details");
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  const fetchSubmissions = async (actId: string) => {
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          *,
          students ( profiles (first_name, last_name) )
        `)
        .eq("activity_id", actId);

      if (error) throw error;
      setSubmissions((data || []).map(s => ({
        id: s.id,
        studentId: s.student_id,
        studentName: `${s.students.profiles.first_name} ${s.students.profiles.last_name}`,
        submittedAt: s.submitted_at,
        content: s.content || "",
        fileUrl: s.file_url,
        score: s.score,
        status: s.status
      })));
    } catch (err) {
      toast.error("Failed to load submissions");
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [fetchClassData]);

  const handleActivityClick = (act: Activity) => {
    setSelectedActivity(act);
    fetchSubmissions(act.id);
  };

  const handlePostActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId || !classInfo) return;

    setPostLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const type = formData.get("type") as string;
      const dueDate = formData.get("due_date") as string;
      const description = formData.get("description") as string;

      const actId = `act-${Date.now()}`;

      // 1. Create activity
      const { error: aErr } = await supabase.from("activities").insert({
        id: actId,
        subject_id: classInfo.id,
        title,
        type,
        description,
        due_date: new Date(dueDate).toISOString(),
        created_by: userId
      });
      if (aErr) throw aErr;

      // 2. Notify students
      if (students.length > 0) {
        const notifications = students.map(s => ({
          user_id: s.id,
          title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Posted`,
          message: `Prof. posted a new ${type} in ${classInfo.code}: ${title}`,
          type: "activity",
          link: `/student/classes/${classInfo.id}`
        }));
        await supabase.from("notifications").insert(notifications);
      }

      toast.success("Activity published successfully");
      setPostModal(false);
      fetchClassData();
    } catch (err) {
      toast.error("Failed to publish activity");
    } finally {
      setPostLoading(false);
    }
  };

  const submitGrade = async () => {
    if (!gradingSub || !scoreInput) return;
    setGradingLoading(true);
    try {
      const { error } = await supabase
        .from("submissions")
        .update({ score: parseFloat(scoreInput), status: 'graded' })
        .eq("id", gradingSub.id);

      if (error) throw error;

      // Notify Student
      await supabase.from("notifications").insert({
        user_id: gradingSub.studentId,
        title: "Grade Released 🌟",
        message: `Your work for ${selectedActivity?.title} has been graded: ${scoreInput}/100`,
        type: "grade",
        link: `/student/classes/${id}`
      });

      toast.success("Grade submitted and student notified");
      setGradingModal(false);
      if (selectedActivity) fetchSubmissions(selectedActivity.id);
    } catch (err) {
      toast.error("Failed to submit grade");
    } finally {
      setGradingLoading(false);
    }
  };

  const handleViewFile = (url: string) => {
    if (!url) return;
    toast.info("Opening document in new tab...");
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Syncing classroom data...</p>
      </div>
    );
  }

  if (!classInfo) return <div className="p-8 text-center font-bold text-slate-400">Class not found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/faculty/classes">
          <Button variant="ghost" size="icon" className="mt-0.5">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{classInfo.code}</p>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px]">
              {classInfo.section}
            </Badge>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{classInfo.name}</h1>
          <p className="text-slate-500 text-xs font-medium mt-1">{classInfo.schedule} · {classInfo.room}</p>
        </div>
        <Button onClick={() => setPostModal(true)} className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
          <Plus className="h-4 w-4" />
          Post Activity
        </Button>
      </div>

      <Tabs defaultValue="roster">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="roster" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5" />
            Roster
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen className="h-3.5 w-3.5" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="grades" className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BarChart2 className="h-3.5 w-3.5" />
            Grades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-6">
          <Card className="border-slate-200 overflow-hidden shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                Enrolled Students
                <span className="text-xs font-normal text-slate-400">{students.length} Total</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="text-left px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="text-right px-6 py-4 font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-white shadow-sm">
                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-600 font-bold">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-slate-700">{student.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold">Active</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Class Activities</h3>
              {activities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 border border-dashed rounded-xl">
                  <p className="text-xs italic">No activities yet.</p>
                </div>
              ) : (
                activities.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => handleActivityClick(act)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all relative group",
                      selectedActivity?.id === act.id 
                        ? "bg-blue-600 border-blue-600 shadow-lg shadow-blue-100 text-white" 
                        : "bg-white border-slate-200 hover:border-blue-300 text-slate-700"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                        selectedActivity?.id === act.id ? "bg-white/20 text-white" : typeColor[act.type]
                      )}>
                        {act.type}
                      </span>
                    </div>
                    <p className="font-bold text-sm leading-tight">{act.title}</p>
                    <div className={cn(
                      "mt-3 pt-3 border-t flex items-center justify-between",
                      selectedActivity?.id === act.id ? "border-white/10" : "border-slate-50"
                    )}>
                      <span className={cn("text-[10px] font-medium", selectedActivity?.id === act.id ? "text-blue-100" : "text-slate-400")}>
                        {act.submissions}/{act.total} Submissions
                      </span>
                      <ChevronRight className={cn("h-3 w-3 transition-transform", selectedActivity?.id === act.id && "translate-x-1")} />
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="lg:col-span-2">
              {!selectedActivity ? (
                <Card className="h-full border-dashed bg-slate-50/50 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Search className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="font-bold text-slate-500">Select an activity</p>
                  <p className="text-xs mt-1">Pick an assignment from the list to view and grade student submissions.</p>
                </Card>
              ) : (
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                  <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-900">{selectedActivity.title}</CardTitle>
                          <p className="text-xs text-slate-400 font-medium">Due {formatDate(selectedActivity.dueDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px]">
                          {selectedActivity.submissions} SUBMISSIONS
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {submissions.length === 0 ? (
                        <div className="py-20 text-center text-slate-400">
                          <p className="text-xs italic">No submissions yet.</p>
                        </div>
                      ) : (
                        submissions.map((sub) => (
                          <div key={sub.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="text-[11px] font-black bg-slate-100 text-slate-500">
                                  {getInitials(sub.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{sub.studentName}</p>
                                <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                                  <Clock className="h-3 w-3" />
                                  Submitted {formatDate(sub.submittedAt)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {sub.score !== null ? (
                                <div className="text-right">
                                  <p className="text-sm font-black text-emerald-600">{sub.score}/100</p>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Graded</p>
                                </div>
                              ) : (
                                <Badge variant="outline" className="text-[9px] font-black text-amber-600 bg-amber-50 border-amber-100 uppercase tracking-tighter">
                                  Pending Review
                                </Badge>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={() => {
                                setGradingSub(sub);
                                setScoreInput(sub.score?.toString() || "");
                                setGradingModal(true);
                              }}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="grades" className="mt-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-emerald-600" />
                Comprehensive Grade Sheet
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="py-24 text-center text-slate-400">
                <BarChart2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-bold text-slate-500">Grade Consolidation</p>
                <p className="text-xs mt-1">This sheet will automatically populate as you grade student submissions.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Post Activity Dialog */}
      <Dialog open={postModal} onOpenChange={setPostModal}>
        <DialogContent className="max-w-lg rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
          <DialogHeader className="bg-blue-600 p-6 text-white">
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Publish New Activity
            </DialogTitle>
            <p className="text-blue-100 text-xs font-medium mt-1">Create an assignment for {classInfo.code} students.</p>
          </DialogHeader>
          <form onSubmit={handlePostActivity} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Type</Label>
                <Select name="type" required>
                  <SelectTrigger id="type" className="h-11 font-bold">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due_date" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="due_date" name="due_date" type="date" className="pl-10 h-11 font-bold" required />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</Label>
              <Input id="title" name="title" placeholder="e.g. Midterm Lab Activity" className="h-11 font-bold" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 resize-none"
                placeholder="Write instructions..."
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-start gap-3">
              <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                Publishing this will instantly notify all {students.length} enrolled students via their dashboard and notification panel.
              </p>
            </div>

            <DialogFooter className="pt-2 gap-2 sm:gap-0">
              <Button type="button" variant="ghost" className="flex-1 font-bold text-slate-400" onClick={() => setPostModal(false)}>Cancel</Button>
              <Button type="submit" disabled={postLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 font-black">
                {postLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Now"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Review Submission Modal */}
      <Dialog open={gradingModal} onOpenChange={setGradingModal}>
        <DialogContent className="max-w-2xl rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
          <DialogHeader className="bg-slate-900 p-6 text-white flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-lg font-black tracking-tight">Reviewing Submission</DialogTitle>
            <Badge className="bg-blue-600 border-none font-bold text-[10px]">PREVIEW MODE</Badge>
          </DialogHeader>
          {gradingSub && (
            <div className="flex flex-col lg:flex-row divide-x divide-slate-100">
              {/* Left: Content Preview */}
              <div className="flex-1 p-6 bg-slate-50/30 overflow-y-auto max-h-[500px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Document Content</label>
                
                {gradingSub.fileUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-[4/3] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center p-8 text-center border-dashed">
                      <div className="h-20 w-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-4">
                        <FileText className="h-10 w-10 text-blue-600" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm mb-1">{truncateName(gradingSub.fileUrl, 16)}</p>
                      <p className="text-[10px] text-slate-400 max-w-[200px]">
                        The document has been securely fetched from the cloud. Click below to view the full version.
                      </p>
                      <Button variant="outline" size="sm" className="mt-6 gap-2 text-xs font-bold" onClick={() => handleViewFile(gradingSub.fileUrl || "")}>
                        <ExternalLink className="h-3 w-3" />
                        Open Document
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm italic text-slate-500 text-sm min-h-[200px]">
                    {gradingSub.content || "No text content provided."}
                  </div>
                )}
              </div>

              {/* Right: Grading Sidebar */}
              <div className="w-full lg:w-[280px] p-6 space-y-6 bg-white shrink-0">
                <div className="flex items-center gap-3 mb-6">
                  <Avatar className="h-12 w-12 border-2 border-slate-50">
                    <AvatarFallback className="font-bold text-blue-600 bg-blue-50">{getInitials(gradingSub.studentName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-black text-slate-800 leading-tight">{gradingSub.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Submitted {formatDate(gradingSub.submittedAt)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Grade</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={scoreInput}
                        onChange={(e) => setScoreInput(e.target.value)}
                        className="pl-10 h-12 font-black text-xl border-2 focus:border-blue-500 transition-all bg-slate-50/50"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-500 fill-amber-500" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback (Optional)</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Great job on the presentation..."
                    />
                  </div>
                </div>

                <div className="pt-6 space-y-2">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 font-black h-12 shadow-lg shadow-blue-100" 
                    onClick={submitGrade}
                    disabled={gradingLoading || !scoreInput}
                  >
                    {gradingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Grade"}
                  </Button>
                  <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => setGradingModal(false)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
