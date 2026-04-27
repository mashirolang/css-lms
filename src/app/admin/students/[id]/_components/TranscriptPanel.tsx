"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Printer, FileText, Trophy, 
  LayoutGrid, BarChart3, AlertCircle 
} from "lucide-react";
import { GradeDistributionChart } from "@/components/profiling/GradeDistributionChart";
import type { SubjectGrade, GPASummary } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  grades: SubjectGrade[];
  gpa: GPASummary;
}

const getGpaColor = (gpa: number | null) => {
  if (gpa === null) return "text-slate-400 border-slate-100";
  if (gpa <= 1.50) return "text-emerald-600 border-emerald-100";
  if (gpa <= 2.00) return "text-blue-600 border-blue-100";
  if (gpa <= 2.50) return "text-amber-600 border-amber-100";
  if (gpa <= 3.00) return "text-orange-600 border-orange-100";
  return "text-red-600 border-red-100";
};

export function TranscriptPanel({ grades, gpa }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 border-0 shadow-2xl shadow-slate-200/50 rounded-3xl bg-white overflow-hidden text-center p-8 flex flex-col items-center justify-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weighted Average</p>
          <div className={cn(
            "h-24 w-24 rounded-full flex items-center justify-center border-4 shadow-inner text-3xl font-black bg-slate-50",
            getGpaColor(gpa.gpa)
          )}>
            {gpa.gpa?.toFixed(2) || "N/A"}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-800">Cumulative GPA</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {gpa.graded_units} Units Graded
            </p>
          </div>
        </Card>

        <Card className="lg:col-span-3 border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Subject Performance Distribution
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handlePrint}
              className="h-9 gap-2 rounded-xl font-black text-[10px] uppercase border-slate-200 bg-white hover:bg-slate-50 shadow-sm print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Transcript
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <GradeDistributionChart grades={grades} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden print:shadow-none print:border-slate-100">
        <CardHeader className="border-b border-slate-50 px-8 py-6 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Official Academic Record
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className="bg-slate-900 text-white font-black text-[10px] px-3 py-1 uppercase">{gpa.subjects_count} Subjects</Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-4 px-8 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Subject Code</th>
                <th className="py-4 px-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Description</th>
                <th className="py-4 px-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Units</th>
                <th className="py-4 px-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Final Grade</th>
                <th className="py-4 px-8 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Letter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="font-black text-slate-600 uppercase tracking-tight">No grades recorded</p>
                    <p className="text-xs mt-1 font-medium">This student has no graded submissions yet.</p>
                  </td>
                </tr>
              ) : (
                grades.map((g) => (
                  <tr key={g.subject_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-8 font-mono font-bold text-slate-600 uppercase">{g.subject_code}</td>
                    <td className="py-5 px-4 font-black text-slate-900">{g.subject_name}</td>
                    <td className="py-5 px-4 text-center font-bold text-slate-600">{g.units}</td>
                    <td className="py-5 px-4 text-center">
                      <span className={cn(
                        "font-black text-lg",
                        g.grade_point && g.grade_point <= 3.0 ? "text-slate-900" : "text-red-500"
                      )}>
                        {g.grade_point?.toFixed(2) || "INC"}
                      </span>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <Badge className={cn(
                        "font-black text-[10px] px-2 py-0.5",
                        g.grade_point && g.grade_point <= 3.0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      )}>
                        {g.letter_grade}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {grades.length > 0 && (
              <tfoot className="bg-slate-900 text-white">
                <tr>
                  <td colSpan={2} className="py-6 px-8 font-black uppercase tracking-widest text-xs">Total Units / General Average</td>
                  <td className="py-6 px-4 text-center font-black text-lg">{gpa.total_units}</td>
                  <td className="py-6 px-4 text-center font-black text-2xl text-blue-400">{gpa.gpa?.toFixed(2) || "—"}</td>
                  <td className="py-6 px-8 text-right font-black uppercase tracking-widest text-xs">
                    {gpa.gpa && gpa.gpa <= 3.0 ? "Passed" : "Incomplete"}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </Card>

      <div className="hidden print:block fixed bottom-0 left-0 w-full p-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] border-t border-slate-100 bg-white">
        CCS Learning Management System • Official Academic Record Transcript • Generated on {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
