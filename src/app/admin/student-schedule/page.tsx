"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Users, Clock, Plus, Loader2, MapPin, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { label: "M", full: "Monday", value: 1 },
  { label: "T", full: "Tuesday", value: 2 },
  { label: "W", full: "Wednesday", value: 3 },
  { label: "Th", full: "Thursday", value: 4 },
  { label: "F", full: "Friday", value: 5 },
  { label: "S", full: "Saturday", value: 6 },
];

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const COLORS = [
  "bg-blue-100 border-blue-300 text-blue-800",
  "bg-violet-100 border-violet-300 text-violet-800",
  "bg-emerald-100 border-emerald-300 text-emerald-800",
  "bg-amber-100 border-amber-300 text-amber-800",
  "bg-rose-100 border-rose-300 text-rose-800",
  "bg-orange-100 border-orange-300 text-orange-800",
];

interface ScheduleItem {
  id: string;
  subject_id: string;
  code: string;
  name: string;
  room: string;
  section: string;
}

interface CourseOption {
  id: string;
  name: string;
  code: string;
  course_id: string;
  year_level: number;
  section: string;
  courses?: { name: string } | { name: string }[];
}

export default function StudentSchedulePage() {
  const supabase = createClient();
  const [section, setSection] = useState("BSCS-2A");
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<Record<string, Record<string, ScheduleItem>>>({});
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<CourseOption[]>([]);
  
  const [open, setOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const { data: sData, error: sErr } = await supabase
        .from("schedule_slots")
        .select("*, subjects (*, courses(id, name))");

      if (sErr) throw sErr;

      const formatted: Record<string, Record<string, ScheduleItem>> = {};
      const colors: Record<string, string> = {};
      let colorIdx = 0;

      (sData || []).forEach((slot) => {
        const day = days[slot.day_of_week];
        const time = `${parseInt(slot.start_time.split(":")[0]) % 12 || 12}:00 ${parseInt(slot.start_time.split(":")[0]) >= 12 ? 'PM' : 'AM'}`;
        
        if (!formatted[day]) formatted[day] = {};
        const subject = slot.subjects;
        const course = Array.isArray(subject?.courses) ? subject.courses[0] : subject?.courses;
        const courseName = course?.name || subject?.course_id || "Unknown";

        formatted[day][time] = {
          id: slot.id,
          subject_id: slot.subject_id,
          code: subject?.code,
          name: subject?.name,
          room: slot.room,
          section: `${courseName}-${subject?.year_level}${subject?.section}`
        };

        if (subject?.code && !colors[subject.code]) {
          colors[subject.code] = COLORS[colorIdx % COLORS.length];
          colorIdx++;
        }
      });

      setScheduleData(formatted);
      setColorMap(colors);

      const { data: cData } = await supabase.from("subjects").select("*, courses(id, name)");
      setCourses((cData as any[]) || []);

    } catch (err: unknown) {
      toast.error("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleDay = (dayValue: number) => {
    setSelectedDays(prev => 
      prev.includes(dayValue) ? prev.filter(d => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day");
      return;
    }
    setSaveLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const subject_id = formData.get("subject_id") as string;
      const start_time = formData.get("start_time") as string;
      const end_time = formData.get("end_time") as string;
      const room = formData.get("room") as string;

      const inserts = selectedDays.map(day => ({
        subject_id,
        day_of_week: day,
        start_time: `${start_time}:00`,
        end_time: `${end_time}:00`,
        room
      }));

      const { error } = await supabase.from("schedule_slots").insert(inserts);

      if (error) throw error;

      toast.success(`Schedule assigned for ${selectedDays.length} days!`);
      setOpen(false);
      setSelectedDays([]);
      fetchData();
    } catch (err: unknown) {
      toast.error("Failed to assign schedule.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this slot?")) return;
    await supabase.from("schedule_slots").delete().eq("id", id);
    fetchData();
  };

  const getSlot = (day: string, time: string) => {
    const slot = scheduleData[day]?.[time];
    if (slot && slot.section === section) return slot;
    return null;
  };

  const uniqueSections = Array.from(new Set(courses.map(c => {
    const course = Array.isArray(c.courses) ? c.courses[0] : c.courses;
    return `${course?.name || c.course_id}-${c.year_level}${c.section}`;
  }))).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Schedule Manager</h1>
          <p className="text-slate-500 text-sm mt-0.5">Assign days and times (MWF, TTh, etc.) to your courses</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shadow-lg shadow-blue-200">
          <Plus className="h-4 w-4" />
          Assign Day/Time
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-slate-700">Filter by Section:</span>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger className="w-48 bg-slate-50 border-none font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {uniqueSections.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="bg-slate-50/50 border-b border-slate-100 p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Weekly Timetable — {section}
          </CardTitle>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="py-4 px-4 text-left font-bold text-slate-400 uppercase tracking-wider w-24 bg-slate-50/80">Time</th>
                  {days.slice(1, 7).map((day) => (
                    <th key={day} className="py-4 px-2 font-bold text-slate-700 uppercase tracking-wider text-center bg-slate-50/80 min-w-[140px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-32 text-center">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-500" />
                    </td>
                  </tr>
                ) : (
                  timeSlots.map((time, i) => (
                    <tr key={time} className={cn("group transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/20")}>
                      <td className="py-4 px-4 font-bold text-slate-400 text-[10px]">{time}</td>
                      {days.slice(1, 7).map((day) => {
                        const slot = getSlot(day, time);
                        return (
                          <td key={day} className="py-1 px-1 align-top relative">
                            {slot ? (
                              <div 
                                onClick={() => handleDelete(slot.id)}
                                className={cn(
                                  "rounded-xl border p-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group/slot relative",
                                  colorMap[slot.code] || "bg-slate-100 border-slate-200 text-slate-700"
                                )}
                              >
                                <p className="font-black text-[10px] uppercase tracking-tighter">{slot.code}</p>
                                <p className="font-bold text-[11px] leading-tight mt-0.5">{slot.name}</p>
                                <div className="flex items-center gap-1 mt-1.5 opacity-70">
                                  <MapPin className="h-3 w-3" />
                                  <span className="text-[10px] font-medium">{slot.room}</span>
                                </div>
                                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover/slot:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                                  <span className="text-[10px] font-bold text-red-600 bg-white px-2 py-1 rounded-md shadow-sm border border-red-100">Remove</span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-12 border border-dashed border-slate-100 rounded-xl group-hover:border-blue-100 transition-colors" />
                            )}
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

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if(!v) setSelectedDays([]); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Schedule Slots</DialogTitle>
            <DialogDescription>
              Assign one or more days to this course at once (e.g. MWF).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Select Course</Label>
              <Select name="subject_id" required>
                <SelectTrigger><SelectValue placeholder="Choose a course..." /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => {
                    const course = Array.isArray(c.courses) ? c.courses[0] : c.courses;
                    const courseName = course?.name || c.course_id || "Unknown";
                    return (
                      <SelectItem key={c.id} value={c.id}>[{c.code}] {c.name} ({courseName}-{c.year_level}{c.section})</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Select Days (MWF, TTh, etc.)</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={cn(
                      "h-10 w-10 rounded-xl border font-bold text-xs transition-all flex items-center justify-center relative",
                      selectedDays.includes(d.value) 
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
                    )}
                  >
                    {d.label}
                    {selectedDays.includes(d.value) && (
                      <Check className="h-2 w-2 absolute top-1 right-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Time</Label>
                <Input name="start_time" type="time" defaultValue="08:00" required />
              </div>
              <div className="space-y-1.5">
                <Label>End Time</Label>
                <Input name="end_time" type="time" defaultValue="09:00" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Room / Location</Label>
              <Input name="room" placeholder="Lab 101" required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveLoading} className="bg-blue-600 hover:bg-blue-700">
                {saveLoading ? "Saving..." : `Assign to ${selectedDays.length} Days`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
