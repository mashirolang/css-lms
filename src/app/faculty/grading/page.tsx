"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart2, Save, Calculator, Search, 
  ChevronRight, ArrowLeft, Loader2, Star,
  AlertCircle, CheckCircle2, GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Subject {
  id: string;
  code: string;
  name: string;
  section: string;
}

interface StudentGradeRow {
  student_id: string;
  name: string;
  assign_avg: number;
  quiz_avg: number;
  exam_avg: number;
  weighted_avg: number;
  grade_point: number;
}

export default function GradingModulePage() {
  const supabase = createClient();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [students, setStudents] = useState<StudentGradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubjects = useCallback(async () => {
    // In a real app, this would filter by the current faculty's ID
    const { data } = await supabase.from("subjects").select("id, code, name, section");
    setSubjects(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const fetchStudents = useCallback(async (subId: string) => {
    setLoading(true);
    try {
      // 1. Get enrolled students
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`student_id, students(profiles(first_name, last_name))`)
        .eq("subject_id", subId);

      // 2. Get existing manual grades
      const { data: manualGrades } = await supabase
        .from("manual_subject_grades")
        .select("*")
        .eq("subject_id", subId);

      const mapped = (enrollments || []).map((e: any) => {
        const existing = (manualGrades || []).find(g => g.student_id === e.student_id);
        const assign = existing?.assign_avg || 0;
        const quiz = existing?.quiz_avg || 0;
        const exam = existing?.exam_avg || 0;
        const wavg = assign * 0.3 + quiz * 0.3 + exam * 0.4;
        
        return {
          student_id: e.student_id,
          name: `${e.students.profiles.first_name} ${e.students.profiles.last_name}`,
          assign_avg: assign,
          quiz_avg: quiz,
          exam_avg: exam,
          weighted_avg: wavg,
          grade_point: calculateGP(wavg)
        };
      });

      setStudents(mapped);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (selectedSubject) fetchStudents(selectedSubject);
  }, [selectedSubject, fetchStudents]);

  function calculateGP(wavg: number) {
    if (wavg === 0) return 0;
    if (wavg >= 97) return 1.00;
    if (wavg >= 94) return 1.25;
    if (wavg >= 91) return 1.50;
    if (wavg >= 88) return 1.75;
    if (wavg >= 85) return 2.00;
    if (wavg >= 82) return 2.25;
    if (wavg >= 79) return 2.50;
    if (wavg >= 76) return 2.75;
    if (wavg >= 75) return 3.00;
    return 5.00;
  }

  const handleGradeChange = (studentId: string, field: 'assign_avg' | 'quiz_avg' | 'exam_avg', val: string) => {
    const num = parseFloat(val) || 0;
    setStudents(prev => prev.map(s => {
      if (s.student_id !== studentId) return s;
      const updated = { ...s, [field]: num };
      updated.weighted_avg = updated.assign_avg * 0.3 + updated.quiz_avg * 0.3 + updated.exam_avg * 0.4;
      updated.grade_point = calculateGP(updated.weighted_avg);
      return updated;
    }));
  };

  const handleSave = async () => {
    if (!selectedSubject) return;
    setSaving(true);
    try {
      const payload = students.map(s => ({
        student_id: s.student_id,
        subject_id: selectedSubject,
        assign_avg: s.assign_avg,
        quiz_avg: s.quiz_avg,
        exam_avg: s.exam_avg,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from("manual_subject_grades")
        .upsert(payload, { onConflict: 'student_id,subject_id' });

      if (error) throw error;
      toast.success("Grades consolidated and saved successfully");
    } catch (err) {
      toast.error("Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="h-6 w-6 text-emerald-600" />
            Academic Performance Module
          </h1>
          <p className="text-slate-500 text-sm font-medium">Consolidated grade entry with automated GPA calculation and reporting.</p>
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold bg-white">
              <SelectValue placeholder="Select Class/Subject" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedSubject ? (
        <Card className="border-dashed border-2 bg-slate-50/50 rounded-3xl py-32 text-center text-slate-400">
          <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-10" />
          <p className="font-black text-slate-600 uppercase tracking-tight">Select a subject to start grading</p>
          <p className="text-xs mt-1 font-medium">Choose from the dropdown above to load the student roster.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6 flex flex-row items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filter student list..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 bg-white border-slate-200 rounded-xl font-bold"
                />
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="border-slate-200 bg-white font-black text-[10px] py-1 px-3 uppercase tracking-widest text-slate-400">
                  {filteredStudents.length} Students
                </Badge>
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl px-6 gap-2 h-11 shadow-xl shadow-slate-200"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save All Grades
                </Button>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="py-4 px-8 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Student Name</th>
                    <th className="py-4 px-4 text-center font-black text-blue-500 uppercase tracking-widest text-[10px]">Assign (30%)</th>
                    <th className="py-4 px-4 text-center font-black text-violet-500 uppercase tracking-widest text-[10px]">Quiz (30%)</th>
                    <th className="py-4 px-4 text-center font-black text-amber-500 uppercase tracking-widest text-[10px]">Exam (40%)</th>
                    <th className="py-4 px-4 text-center font-black text-slate-900 uppercase tracking-widest text-[10px]">Weighted Avg</th>
                    <th className="py-4 px-8 text-center font-black text-slate-900 uppercase tracking-widest text-[10px]">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-8">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-[10px]">
                              {getInitials(s.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold text-slate-800">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Input 
                          type="number" 
                          min="0" max="100"
                          value={s.assign_avg}
                          onChange={e => handleGradeChange(s.student_id, 'assign_avg', e.target.value)}
                          className="h-10 w-24 mx-auto text-center font-black border-blue-100 focus:border-blue-500 rounded-lg"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <Input 
                          type="number" 
                          min="0" max="100"
                          value={s.quiz_avg}
                          onChange={e => handleGradeChange(s.student_id, 'quiz_avg', e.target.value)}
                          className="h-10 w-24 mx-auto text-center font-black border-violet-100 focus:border-violet-500 rounded-lg"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <Input 
                          type="number" 
                          min="0" max="100"
                          value={s.exam_avg}
                          onChange={e => handleGradeChange(s.student_id, 'exam_avg', e.target.value)}
                          className="h-10 w-24 mx-auto text-center font-black border-amber-100 focus:border-amber-500 rounded-lg"
                        />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-black text-slate-900">
                          {s.weighted_avg.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-8 text-center">
                        <Badge className={cn(
                          "font-black text-sm px-4 py-1 rounded-xl shadow-sm border-none",
                          s.grade_point <= 3.0 && s.grade_point > 0 ? "bg-emerald-500 text-white" : 
                          s.grade_point === 5.0 ? "bg-red-500 text-white" : "bg-slate-200 text-slate-400"
                        )}>
                          {s.grade_point === 0 ? "—" : s.grade_point.toFixed(2)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <Star className="absolute -top-4 -right-4 h-24 w-24 text-white/5 rotate-12" />
              <div className="relative z-10 space-y-4">
                <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                  <Calculator size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tight">Automated Calculation</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  The system uses the formula: <span className="text-emerald-400 font-black">GPA = Σ(Grade × Units) / ΣUnits</span>.
                  Weighted averages are derived from the 30/30/40 institutional standard.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Compliant</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 space-y-4">
              <div className="h-12 w-12 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center justify-center text-blue-600">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Consolidated Progress Reports</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">
                Once saved, these grades will be instantly available in the Student Analytics Dashboard and Personal Profile, replacing paper-based reporting methods.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
