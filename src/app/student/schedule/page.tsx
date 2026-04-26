"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, User, Loader2, Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
];

const timeSlots = ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const COLORS = [
  "bg-blue-100 border-blue-200 text-blue-800",
  "bg-violet-100 border-violet-200 text-violet-800",
  "bg-emerald-100 border-emerald-200 text-emerald-800",
  "bg-amber-100 border-amber-200 text-amber-800",
  "bg-rose-100 border-rose-200 text-rose-800",
  "bg-orange-100 border-orange-200 text-orange-800",
];

interface ScheduleItem {
  id: string;
  code: string;
  name: string;
  faculty: string;
  room: string;
  fullTime: string;
}

interface StudentInfo {
  course: string;
  year: number;
  section: string;
}

export default function StudentSchedulePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<Record<number, Record<string, ScheduleItem>>>({});
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);

  const todayNum = new Date().getDay();

  const fetchSchedule = useCallback(async () => {
    try {
      const cookies = typeof document !== 'undefined' ? document.cookie : '';
      const userId = cookies.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
      
      if (!userId) return;

      const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(`
          subject_id,
          students (
            courses (name), year_level, section
          ),
          subjects (
            code, name,
            faculty ( profiles (first_name, last_name) ),
            schedule_slots (*)
          )
        `)
        .eq("student_id", userId);

      if (error) throw error;

      if (enrollments?.[0]?.students) {
        const s = enrollments[0].students as any;
        setStudentInfo({
          course: s.courses?.name || "N/A",
          year: s.year_level,
          section: s.section
        });
      }

      const formatted: Record<number, Record<string, ScheduleItem>> = {};
      const colors: Record<string, string> = {};
      let colorIdx = 0;

      (enrollments || []).forEach((e: any) => {
        const sub = e.subjects;
        if (!sub) return;

        if (!colors[sub.code]) {
          colors[sub.code] = COLORS[colorIdx % COLORS.length];
          colorIdx++;
        }

        (sub.schedule_slots || []).forEach((slot: any) => {
          const day = slot.day_of_week;
          // Match to the nearest hour slot for the grid
          const hour = parseInt(slot.start_time.split(":")[0]);
          const ampm = hour >= 12 ? "PM" : "AM";
          const gridTime = `${hour % 12 || 12}:00 ${ampm}`;
          
          const startDisp = `${hour % 12 || 12}:${slot.start_time.split(":")[1]} ${ampm}`;
          const endHour = parseInt(slot.end_time.split(":")[0]);
          const endDisp = `${endHour % 12 || 12}:${slot.end_time.split(":")[1]} ${endHour >= 12 ? 'PM' : 'AM'}`;

          if (!formatted[day]) formatted[day] = {};
          formatted[day][gridTime] = {
            id: slot.id,
            code: sub.code,
            name: sub.name,
            faculty: sub.faculty?.profiles ? `${sub.faculty.profiles.first_name} ${sub.faculty.profiles.last_name}` : "TBA",
            room: slot.room,
            fullTime: `${startDisp} – ${endDisp}`
          };
        });
      });

      setScheduleData(formatted);
      setColorMap(colors);
    } catch (err: unknown) {
      toast.error("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Loading your academic calendar...</p>
      </div>
    );
  }

  const todayClasses = Object.entries(scheduleData[todayNum] ?? {}).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Schedule</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {studentInfo ? `${studentInfo.course} · Year ${studentInfo.year}–${studentInfo.section}` : "Your enrolled curriculum schedule."}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-bold text-blue-700">First Semester · AY 2024–2025</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Today&apos;s Classes</h2>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {todayClasses.length === 0 ? (
            <Card className="flex-1 border-dashed bg-slate-50/50">
              <CardContent className="p-8 text-center text-slate-400">
                <p className="text-sm font-medium italic">No classes scheduled for today. Take some time to study!</p>
              </CardContent>
            </Card>
          ) : (
            todayClasses.map(([time, cls]) => (
              <Card key={time} className={cn("shrink-0 min-w-[240px] border-none shadow-lg shadow-slate-200/50", colorMap[cls.code])}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="bg-white/50 border-none text-[10px] font-bold">
                      {cls.fullTime}
                    </Badge>
                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  </div>
                  <p className="font-black text-xs uppercase tracking-tighter opacity-80">{cls.code}</p>
                  <p className="font-bold text-sm leading-tight mt-1 truncate">{cls.name}</p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-black/5">
                    <div className="flex items-center gap-1.5 opacity-70">
                      <MapPin className="h-3 w-3" />
                      <span className="text-[10px] font-bold">{cls.room}</span>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-70">
                      <User className="h-3 w-3" />
                      <span className="text-[10px] font-bold truncate max-w-[100px]">{cls.faculty}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Weekly Time Grid
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="py-4 px-4 text-left font-bold text-slate-400 uppercase tracking-widest w-24">Time</th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th
                      key={day.value}
                      className={cn(
                        "py-4 px-2 font-black uppercase tracking-widest text-center min-w-[150px] border-l border-slate-100",
                        day.value === todayNum ? "bg-blue-600 text-white shadow-inner" : "text-slate-500"
                      )}
                    >
                      {day.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timeSlots.map((time, i) => (
                  <tr key={time} className={cn("group transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                    <td className="py-5 px-4 font-black text-slate-400 text-[10px] whitespace-nowrap">{time}</td>
                    {DAYS_OF_WEEK.map((day) => {
                      const slot = scheduleData[day.value]?.[time];
                      return (
                        <td key={day.value} className={cn(
                          "p-1.5 align-top border-l border-slate-50 group-hover:bg-slate-100/30",
                          day.value === todayNum && "bg-blue-50/20"
                        )}>
                          {slot ? (
                            <div className={cn(
                              "rounded-xl border p-3 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group/slot",
                              colorMap[slot.code]
                            )}>
                              <p className="font-black text-[10px] uppercase tracking-tighter">{slot.code}</p>
                              <p className="font-bold text-[11px] leading-tight mt-1">{slot.name}</p>
                              <div className="mt-3 pt-2 border-t border-black/5 space-y-1 opacity-70">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-2.5 w-2.5" />
                                  <span className="text-[9px] font-bold truncate">{slot.faculty}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-2.5 w-2.5" />
                                    <span className="text-[9px] font-bold">{slot.room}</span>
                                  </div>
                                  <span className="text-[8px] font-black opacity-40">{slot.fullTime.split(" – ")[0]}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16 border border-dashed border-slate-100/50 rounded-xl m-1" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
