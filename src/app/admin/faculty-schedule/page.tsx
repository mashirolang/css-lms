"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CalendarDays, Plus, Clock, MapPin, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { cn, getInitials } from "@/lib/utils";
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
  faculty_id: string;
  code: string;
  name: string;
  room: string;
  section: string;
  units: number;
}

interface FacultyProfile {
  id: string;
  first_name: string;
  last_name: string;
}

interface SubjectItem {
  id: string;
  name: string;
  code: string;
  course_id: string;
  year_level: number;
  section: string;
  faculty_id?: string;
}

export default function FacultyScheduleManager() {
  const supabase = createClient();
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [facultyList, setFacultyList] = useState<FacultyProfile[]>([]);
  const [scheduleData, setScheduleData] = useState<Record<string, Record<string, ScheduleItem>>>({});
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const { data: fData } = await supabase.from("profiles").select("id, first_name, last_name").eq("role", "faculty");
      const list = (fData as FacultyProfile[]) || [];
      setFacultyList(list);
      if (list.length > 0 && !facultyId) setFacultyId(list[0].id);

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
          faculty_id: subject?.faculty_id,
          code: subject?.code,
          name: subject?.name,
          room: slot.room,
          section: `${courseName}-${subject?.year_level}${subject?.section}`,
          units: subject?.units || 3
        };

        if (slot.subjects?.code && !colors[slot.subjects.code]) {
          colors[slot.subjects.code] = COLORS[colorIdx % COLORS.length];
          colorIdx++;
        }
      });

      setScheduleData(formatted);
      setColorMap(colors);

      const { data: cData } = await supabase.from("subjects").select("*, courses(id, name)");
      setCourses((cData as any[]) || []);

    } catch (err: unknown) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [supabase, facultyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const subject_id = formData.get("subject_id") as string;
      const day_of_week = parseInt(formData.get("day_of_week") as string);
      const start_time = formData.get("start_time") as string;
      const end_time = formData.get("end_time") as string;
      const room = formData.get("room") as string;

      const { error } = await supabase.from("schedule_slots").insert({
        subject_id, day_of_week, start_time: `${start_time}:00`, end_time: `${end_time}:00`, room
      });

      if (error) throw error;
      toast.success("Schedule assigned");
      setOpen(false);
      fetchData();
    } catch (err: unknown) {
      toast.error("Failed to assign schedule");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this slot?")) return;
    await supabase.from("schedule_slots").delete().eq("id", id);
    fetchData();
  };

  const selectedFaculty = facultyList.find(f => f.id === facultyId);
  const facultyName = selectedFaculty ? `${selectedFaculty.first_name} ${selectedFaculty.last_name}` : "Select Faculty";

  const getSlot = (day: string, time: string) => {
    const slot = scheduleData[day]?.[time];
    if (slot && slot.faculty_id === facultyId) return slot;
    return null;
  };

  const totalUnits = Object.values(scheduleData)
    .flatMap(daySlots => Object.values(daySlots))
    .filter(s => s.faculty_id === facultyId)
    .reduce((acc, s) => acc + s.units, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Schedule Manager</h1>
          <p className="text-slate-500 text-sm mt-0.5">Assign teaching loads per faculty member</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shadow-lg shadow-blue-200">
          <Plus className="h-4 w-4" />
          Assign Class
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-white shadow-md">
            <AvatarFallback className="bg-blue-600 text-white font-bold">{getInitials(facultyName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Teaching Load For:</p>
            <Select value={facultyId || ""} onValueChange={setFacultyId}>
              <SelectTrigger className="w-56 border-none bg-slate-50 font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {facultyList.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.first_name} {f.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="md:ml-auto flex gap-8">
          <div className="text-center">
            <p className="text-2xl font-black text-blue-600 leading-none">{totalUnits}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Total Units</p>
          </div>
          <div className="text-center border-l border-slate-100 pl-8">
            <p className="text-2xl font-black text-emerald-600 leading-none">
              {Object.values(scheduleData).flatMap(daySlots => Object.values(daySlots)).filter(s => s.faculty_id === facultyId).length}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Sessions / Wk</p>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            Weekly Teaching Schedule — {facultyName}
          </CardTitle>
        </CardHeader>
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
                    <td colSpan={7} className="py-32 text-center text-slate-400">
                      <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-blue-500" />
                      Loading schedule data...
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
                                <p className="font-black text-[10px] tracking-tighter uppercase">{slot.code}</p>
                                <p className="font-bold text-[11px] leading-tight mt-0.5">{slot.section}</p>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Class to Faculty</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Select Subject (Already Assigned to Faculty)</Label>
              <Select name="subject_id" required>
                <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                <SelectContent>
                  {courses.filter(c => c.faculty_id === facultyId).map(c => {
                    const course = Array.isArray(c.courses) ? c.courses[0] : c.courses;
                    const courseName = course?.name || c.course_id || "Unknown";
                    return (
                      <SelectItem key={c.id} value={c.id}>[{c.code}] {c.name} ({courseName}-{c.year_level}{c.section})</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Day</Label>
                <Select name="day_of_week" defaultValue="1" required>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Room / Lab</Label>
                <Input name="room" placeholder="CL1" required />
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
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveLoading} className="bg-blue-600 hover:bg-blue-700">
                {saveLoading ? "Saving..." : "Assign Teaching Slot"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
