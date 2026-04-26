"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BookOpen, Plus, Search, Filter, Hash, User, Clock, 
  MapPin, CheckCircle2, Loader2, AlertCircle, Info, Send, Lock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn, formatSchedule } from "@/lib/utils";

interface Course {
  id: string;
  code: string;
  name: string;
  units: number;
  faculty_name: string;
  schedule: string;
  room: string;
  program: string;
}

interface Enrollment {
  subject_id: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

export default function EnrollmentPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const cookies = typeof document !== 'undefined' ? document.cookie : '';
      const userId = cookies.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
      
      if (!userId) return;

      const { data: student, error: sErr } = await supabase
        .from("students")
        .select("*, courses(name)")
        .eq("id", userId)
        .maybeSingle();
      
      if (sErr) throw sErr;
      if (!student) return;
      setStudentInfo(student);

      // Only fetch subjects if they are in a state that allows enrollment or review
      const isEligible = student.status !== 'inactive';
      if (!isEligible) return;

      const { data: cData, error: cErr } = await supabase
        .from("subjects")
        .select(`
          *,
          courses (name),
          faculty (
            profiles (first_name, last_name)
          ),
          schedule_slots(*)
        `);
      
      if (cErr) throw cErr;

      const { data: eData, error: eErr } = await supabase
        .from("enrollments")
        .select("subject_id, status")
        .eq("student_id", userId);
      
      if (eErr) throw eErr;
      setMyEnrollments(eData || []);

      const formatted: Course[] = (cData || []).map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        units: s.units || 3,
        faculty_name: s.faculty?.profiles ? `${s.faculty.profiles.first_name} ${s.faculty.profiles.last_name}` : "TBA",
        schedule: formatSchedule(s.schedule_slots),
        room: s.schedule_slots?.[0]?.room || "TBA",
        program: s.courses?.name || s.course_id || "Unknown"
      }));

      setCourses(formatted);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEnroll = async (courseId: string) => {
    const userId = studentInfo?.id;
    if (!userId) return;

    setEnrollingId(courseId);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert({
          student_id: userId,
          subject_id: courseId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') throw new Error("Already selected.");
        throw error;
      }

      toast.success("Subject added to selection");
      setMyEnrollments(prev => [...prev, { subject_id: courseId, status: 'pending' }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const handleRemove = async (courseId: string) => {
    const userId = studentInfo?.id;
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("student_id", userId)
        .eq("subject_id", courseId);

      if (error) throw error;
      setMyEnrollments(prev => prev.filter(e => e.subject_id !== courseId));
    } catch (err) {
      toast.error("Failed to remove subject");
    }
  };

  const handleSubmitSelection = async () => {
    if (myEnrollments.length === 0) {
      toast.error("Please select at least one subject.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("submit_enrollment_review", {
        p_student_id: studentInfo.id
      });

      if (error) throw error;
      toast.success("Selection submitted for review!");
      fetchData();
    } catch (err) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Checking enrollment status...</p>
      </div>
    );
  }

  // 1. BLOCKED: Officially Enrolled
  if (studentInfo?.status === "enrolled") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-emerald-100 bg-emerald-50/30 shadow-xl shadow-emerald-500/5 overflow-hidden rounded-3xl">
          <div className="h-2 bg-emerald-500 w-full" />
          <CardContent className="p-10 text-center">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
              <Lock className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Registration Closed</h2>
            <div className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed font-medium">
              You are currently officially <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 uppercase font-black px-2 py-0.5">Enrolled</Badge>. 
              Enrollment for this semester is now finalized and locked.
            </div>
            <div className="bg-white/80 rounded-2xl p-6 border border-emerald-100/50 shadow-sm">
              <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
                <Info className="h-4 w-4 text-emerald-500" />
                Enrollment will reopen next semester. Contact the <strong>Registrar</strong> for concerns.
              </p>
            </div>
            <div className="mt-8">
              <Button onClick={() => window.location.href = '/student'} variant="outline" className="gap-2 font-bold">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. PENDING REVIEW: Selection Submitted
  if (studentInfo?.selection_submitted) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8 bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm shadow-amber-200/20">
          <Clock className="h-6 w-6 text-amber-600 animate-pulse" />
          <div>
            <h2 className="text-lg font-black text-amber-900 tracking-tight">Application Under Review</h2>
            <p className="text-sm text-amber-700 font-medium">Your subject selection has been submitted and is waiting for administrator approval.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 px-1">Selected Subjects</h3>
          <div className="grid grid-cols-1 gap-3">
            {myEnrollments.map(en => {
              const course = courses.find(c => c.id === en.subject_id);
              if (!course) return null;
              return (
                <Card key={course.id} className="border-slate-200 bg-white/50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-xs text-slate-400">
                        {course.code.slice(-3)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{course.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{course.code} · {course.units} Units</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-100 font-bold px-3">
                      PENDING APPROVAL
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. SELECTION MODE: Not yet submitted
  const selectedIds = myEnrollments.map(e => e.subject_id);
  const totalUnits = courses.filter(c => selectedIds.includes(c.id)).reduce((acc, c) => acc + c.units, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Course Selection</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Choose your subjects for AY 2024–2025.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 shadow-sm">
            <div className="text-center pr-4 border-r border-blue-100">
              <p className="text-xl font-black text-blue-700 leading-none">{selectedIds.length}</p>
              <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">Subjects</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-blue-700 leading-none">{totalUnits}</p>
              <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">Units</p>
            </div>
          </div>
          <Button 
            onClick={handleSubmitSelection}
            disabled={selectedIds.length === 0 || submitting}
            className="h-12 px-6 gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 font-black"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for Review
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by code or subject name..." 
            className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-blue-500 font-medium" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-11 px-5 rounded-xl gap-2 font-bold">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course) => {
          const isSelected = selectedIds.includes(course.id);
          return (
            <Card key={course.id} className={cn(
              "transition-all duration-300 border-slate-200 group relative overflow-hidden rounded-2xl shadow-sm",
              isSelected ? "bg-blue-50/30 border-blue-200 ring-1 ring-blue-100" : "hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5"
            )}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] text-blue-600 font-black uppercase tracking-widest">{course.code}</p>
                    <h3 className="font-bold text-slate-900 leading-tight mt-1 truncate group-hover:text-blue-600 transition-colors">{course.name}</h3>
                  </div>
                  <Badge variant="outline" className="gap-1 border-blue-100 text-blue-600 bg-blue-50/50 shrink-0 font-bold">
                    {course.units} Units
                  </Badge>
                </div>

                <div className="space-y-3 mb-6 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-500 font-medium">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{course.faculty_name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-blue-700 font-black uppercase tracking-tighter">
                    <Clock className="h-3.5 w-3.5 text-blue-400" />
                    <span>{course.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-medium italic">
                    <MapPin className="h-3.5 w-3.5 text-slate-300" />
                    <span className="truncate">{course.room}</span>
                  </div>
                </div>

                {isSelected ? (
                  <Button 
                    variant="outline" 
                    className="w-full h-10 gap-2 border-rose-100 text-rose-500 bg-rose-50/50 hover:bg-rose-100 font-bold rounded-xl"
                    onClick={() => handleRemove(course.id)}
                  >
                    Remove Selection
                  </Button>
                ) : (
                  <Button 
                    className="w-full h-10 gap-2 bg-slate-900 hover:bg-blue-600 font-black rounded-xl transition-all shadow-md active:scale-95"
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollingId === course.id}
                  >
                    {enrollingId === course.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add to Selection
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 flex items-start gap-3 mt-8 shadow-inner">
        <Info className="h-5 w-5 text-slate-400 mt-0.5" />
        <div className="text-xs text-slate-500 leading-relaxed font-medium">
          <p className="font-bold text-slate-700 mb-1">How Selection Works:</p>
          <ul className="list-disc pl-4 space-y-1 opacity-80">
            <li>Select all the subjects you are required to take for this semester.</li>
            <li>Once finished, click <strong>"Submit for Review"</strong> at the top.</li>
            <li>An administrator will review your selections. You cannot change your subjects once submitted.</li>
            <li>After confirmation, you will be officially enrolled and can view your classes in the dashboard.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
