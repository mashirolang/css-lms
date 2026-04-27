"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, BookOpen, GraduationCap, 
  BarChart3, LayoutGrid, Info
} from "lucide-react";
import { GradeDistributionChart } from "@/components/profiling/GradeDistributionChart";
import { GpaTrendChart } from "@/components/profiling/GpaTrendChart";
import type { SubjectGrade, GPASummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  studentId: string;
  grades: SubjectGrade[];
  gpa: GPASummary;
}

const getGpaColor = (gpa: number | null) => {
  if (gpa === null) return "text-slate-400 bg-slate-50 border-slate-100";
  if (gpa <= 1.50) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (gpa <= 2.00) return "text-blue-600 bg-blue-50 border-blue-100";
  if (gpa <= 2.50) return "text-amber-600 bg-amber-50 border-amber-100";
  if (gpa <= 3.00) return "text-orange-600 bg-orange-50 border-orange-100";
  return "text-red-600 bg-red-50 border-red-100";
};

const getStatusBadge = (grade: number | null) => {
  if (grade === null) return <Badge className="bg-slate-50 text-slate-400 border-slate-100 uppercase text-[9px] font-black">INC</Badge>;
  if (grade <= 3.00) return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[9px] font-black">Passed</Badge>;
  return <Badge className="bg-red-50 text-red-700 border-red-100 uppercase text-[9px] font-black">Failed</Badge>;
};

export function AcademicPerformanceTab({ studentId, grades, gpa }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* GPA Main Card */}
        <Card className="md:col-span-1 border-0 shadow-2xl shadow-blue-500/10 rounded-3xl bg-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
            <Trophy className="h-24 w-24" />
          </div>
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">General Average</p>
            <div className={cn(
              "h-24 w-24 rounded-full flex items-center justify-center border-4 shadow-inner",
              getGpaColor(gpa.gpa)
            )}>
              <span className="text-3xl font-black">{gpa.gpa?.toFixed(2) || "N/A"}</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-800">
                {gpa.gpa ? (gpa.gpa <= 3.0 ? "Good Academic Standing" : "Academic Review Required") : "Pending Grades"}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">{gpa.graded_units} units graded out of {gpa.total_units}</p>
            </div>
          </CardContent>
        </Card>

        {/* GPA Trend */}
        <Card className="md:col-span-3 border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-4">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              GPA Progression Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pb-4">
            <GpaTrendChart studentId={studentId} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-indigo-600" />
              Subject Performance Detail
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-black px-2 py-0.5">{grades.length} Subjects</Badge>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="py-4 px-8 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Subject</th>
                  <th className="py-4 px-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Units</th>
                  <th className="py-4 px-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Score %</th>
                  <th className="py-4 px-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Grade</th>
                  <th className="py-4 px-8 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {grades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">No graded subjects found for this profile.</td>
                  </tr>
                ) : (
                  grades.map((g) => (
                    <tr key={g.subject_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-8">
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{g.subject_name}</p>
                          <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">{g.subject_code}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-600">{g.units}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          "font-black",
                          g.weighted_avg >= 75 ? "text-emerald-600" : "text-red-500"
                        )}>
                          {g.has_grades ? `${Number(g.weighted_avg).toFixed(1)}%` : "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-slate-900">{g.grade_point?.toFixed(2) || "INC"}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">{g.letter_grade}</span>
                        </div>
                      </td>
                      <td className="py-4 px-8 text-right">
                        {getStatusBadge(g.grade_point)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <GradeDistributionChart grades={grades} />
            </CardContent>
          </Card>

          <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute -bottom-6 -right-6 opacity-10 rotate-12">
              <GraduationCap className="h-32 w-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black leading-tight">Academic Standards</h3>
              <p className="text-blue-100 text-sm leading-relaxed font-medium">
                Grades are calculated based on the Philippine academic scale where 1.00 is Excellent and 3.00 is Passing. 5.00 indicates a failure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
