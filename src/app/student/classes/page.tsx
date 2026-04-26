"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  BookOpen, Users, Clock, Calendar, 
  ChevronRight, MapPin, Loader2, Info 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn, formatSchedule } from "@/lib/utils";

interface ClassItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
  schedule: string;
  room: string;
  units: number;
}

export default function StudentClassesPage() {
  const supabase = createClient();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    try {
      const cookies = typeof document !== 'undefined' ? document.cookie : '';
      const userId = cookies.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
      
      if (!userId) return;

      const { data: enrollments, error: eErr } = await supabase
        .from("enrollments")
        .select(`
          subject_id,
          subjects (
            id, name, code, units,
            faculty (
              profiles (first_name, last_name)
            ),
            schedule_slots (*)
          )
        `)
        .eq("student_id", userId);
      
      if (eErr) throw eErr;

      const formatted: ClassItem[] = (enrollments || []).map((e: any) => {
        const s = e.subjects;
        return {
          id: s.id,
          code: s.code,
          name: s.name,
          faculty: s.faculty?.profiles ? `${s.faculty.profiles.first_name} ${s.faculty.profiles.last_name}` : "TBA",
          schedule: formatSchedule(s.schedule_slots),
          room: s.schedule_slots?.[0]?.room || "TBA",
          units: s.units || 3
        };
      });

      setClasses(formatted);
    } catch (err: unknown) {
      toast.error("Failed to load your classes");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const totalUnits = classes.reduce((a, c) => a + c.units, 0);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Class Schedule</h1>
          <p className="text-slate-500 text-sm mt-0.5">AY 2024–2025 · First Semester</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="text-center border-r border-blue-200 pr-4">
            <p className="text-2xl font-black text-blue-700 leading-none">{classes.length}</p>
            <p className="text-[9px] uppercase font-bold text-blue-500 mt-1">Subjects</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-blue-700 leading-none">{totalUnits}</p>
            <p className="text-[9px] uppercase font-bold text-blue-500 mt-1">Total Units</p>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card className="border-dashed border-slate-200 bg-slate-50/50">
          <CardContent className="p-12 text-center text-slate-400">
            <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-10" />
            <p className="font-bold text-slate-600">No classes enrolled yet</p>
            <p className="text-sm mt-1 max-w-xs mx-auto">Visit the Enrollment portal to select your subjects for this semester.</p>
            <Link href="/student/enrollment">
              <Button className="mt-6 gap-2 bg-blue-600 hover:bg-blue-700">
                Go to Enrollment
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <Link key={cls.id} href={`/student/classes/${cls.id}`}>
              <Card className="hover:shadow-md transition-all border-slate-200 group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-lg shadow-blue-200">
                        {cls.code.slice(-3)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">{cls.name}</h3>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">{cls.code}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-slate-50 border-slate-100 text-[10px] px-2 py-0.5">
                      {cls.units} Units
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Schedule</p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Clock className="h-3.5 w-3.5 text-blue-500" />
                        <span>{cls.schedule}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Instructor</p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{cls.faculty}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span>{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Enter Classroom
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div className="text-xs text-blue-800 leading-relaxed">
          <p className="font-bold">Schedule Note:</p>
          <p className="mt-1 opacity-80">Final classroom assignments are subject to change by the Registrar. Please check your notifications for any emergency room reassignments.</p>
        </div>
      </div>
    </div>
  );
}
