"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Users, UserPlus, Search, Filter, Mail, 
  ChevronRight, MoreVertical, Loader2, CheckCircle2,
  Clock, XCircle, GraduationCap, Eye, AlertCircle, Info, Settings, Trash2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

// Helper for generating student numbers
const generateRandomID = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${year}-${random}`;
};

interface StudentRow {
  id: string;
  name: string;
  email: string;
  status: string;
  program: string;
  yearLevel: number;
  section: string;
  studentNumber: string | null;
  joinedDate: string;
  selectionSubmitted: boolean;
}

interface SelectedSubject {
  id: string;
  code: string;
  name: string;
  units: number;
  status?: string;
}

export default function AdminStudentsPage() {
  const supabase = createClient();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Review Modal State
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [pendingSubjects, setPendingSubjects] = useState<SelectedSubject[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [assignedStudentNumber, setAssignedStudentNumber] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchStudents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          id,
          status,
          year_level,
          section,
          student_number,
          selection_submitted,
          profiles (
            first_name,
            last_name,
            email,
            created_at
          ),
          courses (
            name,
            code
          )
        `);

      if (error) throw error;
      
      type SupabaseStudent = {
        id: string;
        status: string;
        year_level: number;
        section: string;
        student_number: string | null;
        selection_submitted: boolean;
        profiles: { first_name: string; last_name: string; email: string; created_at: string };
        courses: { name: string; code: string } | null;
      };

      const formatted: StudentRow[] = (data as unknown as SupabaseStudent[] || []).map((s) => ({
        id: s.id,
        name: `${s.profiles.first_name} ${s.profiles.last_name}`,
        email: s.profiles.email,
        status: s.status,
        program: s.courses?.code || "N/A",
        yearLevel: s.year_level,
        section: s.section,
        studentNumber: s.student_number,
        joinedDate: new Date(s.profiles.created_at).toLocaleDateString(),
        selectionSubmitted: s.selection_submitted
      }));

      setStudents(formatted);
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents();
  }, [fetchStudents]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("students")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;

      // Create notification for the student
      let title = "Account Status Updated";
      let message = `Your account status has been changed to ${newStatus}.`;
      
      if (newStatus === 'accepted') {
        title = "Application Accepted! 🎉";
        message = "Welcome to CCS! Your application has been accepted. You can now proceed with enrollment.";
      } else if (newStatus === 'enrolled') {
        title = "Enrollment Confirmed 🎓";
        message = "Congratulations! You are now officially enrolled for this semester.";
      }

      await supabase.from("notifications").insert({
        user_id: id,
        title,
        message,
        type: "enrollment",
        link: "/student"
      });

      toast.success(`Student status updated to ${newStatus}`);
      fetchStudents();
    } catch {
      toast.error("Status update failed");
    }
  };

  const handleReviewSelection = async (student: StudentRow) => {
    setSelectedStudent(student);
    if (!student.studentNumber) {
      setAssignedStudentNumber(generateRandomID());
    } else {
      setAssignedStudentNumber(student.studentNumber);
    }
    setReviewLoading(true);
    try {
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          status,
          subjects (
            id,
            code,
            name,
            units
          )
        `)
        .eq("student_id", student.id)
        .in("status", ["pending", "confirmed"]);

      if (error) throw error;
      setPendingSubjects((data || []).map((e: { status: string; subjects: unknown }) => ({
        ...(Array.isArray(e.subjects) ? e.subjects[0] : e.subjects as SelectedSubject),
        status: e.status
      })));
    } catch {
      toast.error("Failed to load subjects");
      setSelectedStudent(null);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleWithdraw = async (subjectId: string) => {
    if (!selectedStudent) return;
    if (!confirm("Are you sure you want to withdraw this student from this subject?")) return;
    
    try {
      const { error } = await supabase.rpc("withdraw_student_subject", {
        p_student_id: selectedStudent.id,
        p_subject_id: subjectId
      });

      if (error) throw error;
      toast.success("Student withdrawn from subject");
      
      // Refresh local list
      setPendingSubjects(prev => prev.filter(s => s.id !== subjectId));
    } catch {
      toast.error("Withdrawal failed");
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!selectedStudent) return;
    setConfirming(true);
    try {
      const { error } = await supabase.rpc("confirm_student_enrollment", {
        p_student_id: selectedStudent.id,
        p_student_number: assignedStudentNumber || null
      });

      if (error) throw error;
      toast.success("Enrollment confirmed!");
      setSelectedStudent(null);
      fetchStudents();
    } catch {
      toast.error("Failed to confirm enrollment");
    } finally {
      setConfirming(false);
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.studentNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  // Statistics
  const stats = {
    total: students.length,
    enrolled: students.filter(s => s.status === 'enrolled').length,
    pending: students.filter(s => s.status === 'pending' || s.selectionSubmitted).length,
    inactive: students.filter(s => s.status === 'inactive').length
  };

  // Pagination Logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filtered.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [search]);

  const getStatusBadge = (status: string, selectionSubmitted: boolean) => {
    if (selectionSubmitted && status !== 'enrolled') {
      return <Badge className="bg-amber-500 text-white border-amber-600 font-black uppercase text-[9px] shadow-sm animate-pulse">Awaiting Review</Badge>;
    }
    switch (status) {
      case "enrolled": return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase text-[9px]">Enrolled</Badge>;
      case "active": return <Badge className="bg-blue-50 text-blue-700 border-blue-100 font-bold uppercase text-[9px]">Active</Badge>;
      case "pending": return <Badge className="bg-amber-50 text-amber-700 border-amber-100 font-bold uppercase text-[9px]">Pending</Badge>;
      case "accepted": return <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold uppercase text-[9px]">Accepted</Badge>;
      default: return <Badge variant="outline" className="text-[9px] font-bold uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5 font-medium">Manage records and enrollment status for all students.</p>
        </div>
        {/* Add Student button removed per user request */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats.total, color: "text-blue-600", bg: "bg-blue-50", icon: Users },
          { label: "Enrolled", value: stats.enrolled, color: "text-emerald-600", bg: "bg-emerald-50", icon: GraduationCap },
          { label: "Pending Review", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Inactive", value: stats.inactive, color: "text-rose-600", bg: "bg-rose-50", icon: XCircle },
        ].map((stat, i) => (
          <Card key={i} className="p-4 border-slate-100 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name, email or ID number..." 
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

      <Card className="border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-4 px-6 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Student Info</th>
                <th className="py-4 px-6 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Academic Program</th>
                <th className="py-4 px-6 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                <th className="py-4 px-6 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Joined Date</th>
                <th className="py-4 px-6 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-500" />
                    <p className="text-slate-400 mt-4 font-bold">Fetching directory records...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-400">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-10" />
                    <p className="font-black text-slate-600 uppercase tracking-tight">No students found</p>
                    <p className="text-xs mt-1 font-medium">Try adjusting your search filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-lg shadow-blue-500/10 shrink-0">
                          <AvatarFallback className="bg-blue-600 text-white font-black text-xs">{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">{student.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-medium">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="font-black text-slate-900 text-xs">Year {student.yearLevel} – {student.section}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{student.program}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(student.status, student.selectionSubmitted)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-xs text-slate-500 font-medium">{student.joinedDate}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {student.selectionSubmitted && student.status !== 'enrolled' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReviewSelection(student)}
                            className="h-8 gap-1.5 text-[10px] font-black uppercase border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100"
                          >
                            <Eye className="h-3 w-3" /> Review
                          </Button>
                        )}
                        {student.status === 'enrolled' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReviewSelection(student)}
                            className="h-8 gap-1.5 text-[10px] font-black uppercase border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
                          >
                            <Settings className="h-3 w-3" /> Manage
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-2xl border-slate-100">
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 p-3">Management</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/students/${student.id}`} className="gap-2 p-3 font-bold cursor-pointer">
                                <GraduationCap className="h-4 w-4 text-blue-600" /> View Academic Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] uppercase font-black text-slate-400 p-3">Status Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => updateStatus(student.id, 'accepted')} className="gap-2 p-3 font-bold cursor-pointer text-indigo-600">
                              <CheckCircle2 className="h-4 w-4" /> Accept Application
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(student.id, 'enrolled')} className="gap-2 p-3 font-bold cursor-pointer text-emerald-600">
                              <GraduationCap className="h-4 w-4" /> Mark as Enrolled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(student.id, 'inactive')} className="gap-2 p-3 font-bold cursor-pointer text-rose-600">
                              <XCircle className="h-4 w-4" /> Set as Inactive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
            Showing <span className="text-slate-900">{startIndex + 1}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filtered.length)}</span> of <span className="text-slate-900">{filtered.length}</span> students
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest px-4 border-slate-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                const delta = 1;
                const range = [];
                for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                  range.push(i);
                }

                if (currentPage > 1 + delta + 1) range.unshift("...");
                range.unshift(1);
                if (currentPage < totalPages - delta - 1) range.push("...");
                if (totalPages > 1) range.push(totalPages);

                return range.map((p, i) => (
                  <button
                    key={i}
                    disabled={p === "..."}
                    onClick={() => typeof p === "number" && setCurrentPage(p)}
                    className={cn(
                      "h-8 min-w-[32px] px-2 rounded-lg text-[10px] font-black transition-all",
                      currentPage === p 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : p === "..."
                          ? "bg-transparent text-slate-300 cursor-default"
                          : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-100"
                    )}
                  >
                    {p}
                  </button>
                ));
              })()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg font-black text-[10px] uppercase tracking-widest px-4 border-slate-200"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center justify-between shadow-2xl shadow-slate-900/20">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white/10 rounded-2xl border border-white/10 flex items-center justify-center text-blue-400 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-black text-white uppercase tracking-widest opacity-60">Directory Insights</p>
            <p className="text-sm text-blue-100 font-black">{filtered.length} Students Total</p>
          </div>
        </div>
        <Link href="/admin/student-schedule">
          <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase bg-white/5 border-white/10 text-white hover:bg-white hover:text-slate-900 transition-all">
            Global Schedule Manager
            <ChevronRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Enrollment Review Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
        <DialogContent className="max-w-md rounded-3xl overflow-hidden p-0 border-0 shadow-2xl">
          <div className="h-2 bg-amber-500 w-full" />
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl font-black text-slate-900">Review Subject Selection</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Reviewing subjects for <span className="text-slate-900 font-bold">{selectedStudent?.name}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="rev-student-number" className="text-[10px] font-black uppercase text-slate-400">Official Student Number</Label>
                <button 
                  onClick={() => setAssignedStudentNumber(generateRandomID())}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                >
                  Regenerate
                </button>
              </div>
              <Input 
                id="rev-student-number"
                placeholder="e.g. 2024-10001"
                className="h-10 bg-slate-50 border-slate-200 rounded-xl font-bold"
                value={assignedStudentNumber}
                onChange={(e) => setAssignedStudentNumber(e.target.value)}
              />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Courses</h4>
                <Badge className="bg-white border-slate-200 text-slate-600 font-black text-[9px]">{pendingSubjects.length} Total</Badge>
              </div>
              
              {reviewLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-500" />
                </div>
              ) : pendingSubjects.length === 0 ? (
                <div className="py-4 text-center text-slate-400 flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8 opacity-20" />
                  <p className="text-xs font-bold">No pending subjects found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingSubjects.map(subject => (
                    <div key={subject.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 truncate">{subject.name}</p>
                        <p className="text-[9px] font-mono text-slate-400">{subject.code} · {subject.units} Units</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {subject.status === 'confirmed' ? (
                          <>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[8px] font-black uppercase px-1.5 py-0">Enrolled</Badge>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleWithdraw(subject.id)}
                              className="h-7 w-7 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                              title="Withdraw Student"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse shrink-0 ml-3" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
                Confirming will officially enroll the student, update their status, and notify them via the dashboard.
              </p>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full font-bold rounded-xl" onClick={() => setSelectedStudent(null)}>
              Cancel
            </Button>
            <Button 
              className="w-full font-black bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 rounded-xl"
              onClick={handleConfirmEnrollment}
              disabled={confirming || pendingSubjects.length === 0}
            >
              {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Enrollment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
