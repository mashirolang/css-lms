"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, MapPin, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const COLORS = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-emerald-100 border-emerald-300 text-emerald-800",
  "bg-violet-100 border-violet-300 text-violet-800",
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-rose-100 border-rose-300 text-rose-800",
  "bg-orange-100 border-orange-300 text-orange-800",
];

export default function FacultySchedulePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<any>({});
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [stats, setStats] = useState({ total: 0, subjects: 0, sections: 0, rooms: 0 });

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
      if (!userId) return;

      const { data: subjects, error } = await supabase
        .from("subjects")
        .select(`
          *,
          courses (code),
          schedule_slots (*)
        `)
        .eq("faculty_id", userId);

      if (error) throw error;

      const formatted: any = {};
      const colors: Record<string, string> = {};
      const uniqueRooms = new Set();
      const uniqueSections = new Set();
      let totalSlots = 0;
      let colorIdx = 0;

      (subjects || []).forEach((sub: any) => {
        if (!colors[sub.code]) {
          colors[sub.code] = COLORS[colorIdx % COLORS.length];
          colorIdx++;
        }

        const sectionStr = `${sub.courses?.code || 'N/A'}-${sub.year_level}${sub.section}`;
        uniqueSections.add(sectionStr);

        (sub.schedule_slots || []).forEach((slot: any) => {
          totalSlots++;
          uniqueRooms.add(slot.room);
          const day = days[slot.day_of_week];
          const time = `${parseInt(slot.start_time.split(":")[0]) % 12 || 12}:00 ${parseInt(slot.start_time.split(":")[0]) >= 12 ? 'PM' : 'AM'}`;
          
          if (!formatted[day]) formatted[day] = {};
          formatted[day][time] = {
            code: sub.code,
            name: sub.name,
            section: sectionStr,
            room: slot.room,
            duration: 90 // Placeholder or calculate from end_time
          };
        });
      });

      setScheduleData(formatted);
      setColorMap(colors);
      setStats({
        total: totalSlots,
        subjects: subjects?.length || 0,
        sections: uniqueSections.size,
        rooms: uniqueRooms.size
      });
    } catch (err: any) {
      toast.error("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Schedule</h1>
        <p className="text-slate-500 text-sm mt-0.5">Your weekly teaching timetable</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Classes/Week", value: String(stats.total), icon: <Calendar className="h-4 w-4" />, color: "text-blue-600" },
          { label: "Subjects", value: String(stats.subjects), icon: <Clock className="h-4 w-4" />, color: "text-emerald-600" },
          { label: "Sections", value: String(stats.sections), icon: <Users className="h-4 w-4" />, color: "text-violet-600" },
          { label: "Rooms Used", value: String(stats.rooms), icon: <MapPin className="h-4 w-4" />, color: "text-amber-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
            <div className={cn("p-2 rounded-lg bg-slate-100", stat.color)}>{stat.icon}</div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-3 text-left font-medium text-slate-500 w-24 bg-slate-50">Time</th>
                  {days.slice(1, 7).map((day) => (
                    <th key={day} className="py-3 px-2 font-semibold text-slate-600 text-center bg-slate-50 min-w-[130px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Loading schedule...</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  timeSlots.map((time, i) => (
                    <tr key={time} className={cn("border-b border-slate-50", i % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                      <td className="py-3 px-3 font-medium text-slate-500 whitespace-nowrap">{time}</td>
                      {days.slice(1, 7).map((day) => {
                        const slot = scheduleData[day]?.[time];
                        return (
                          <td key={day} className="py-1.5 px-1.5 align-top">
                            {slot ? (
                              <div className={cn("rounded-lg border p-2.5 hover:shadow-md transition-all cursor-pointer", colorMap[slot.code])}>
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <p className="font-bold text-[11px]">{slot.code}</p>
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 border-current opacity-70 h-auto">
                                    {slot.duration}m
                                  </Badge>
                                </div>
                                <p className="text-[10px] leading-tight opacity-80">{slot.name}</p>
                                <p className="text-[10px] mt-1 opacity-70 font-medium">{slot.section}</p>
                                <div className="flex items-center gap-1 mt-1 opacity-60">
                                  <MapPin className="h-2.5 w-2.5" />
                                  <span className="text-[10px]">{slot.room}</span>
                                </div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        {Object.entries(colorMap).map(([code, cls]) => (
          <div key={code} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium", cls)}>
            <div className="h-2 w-2 rounded-full bg-current opacity-60" />
            {code}
          </div>
        ))}
      </div>
    </div>
  );
}
