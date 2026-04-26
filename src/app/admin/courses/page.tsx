"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, BookOpen, Users, Hash, Loader2, Calendar, MapPin, Check, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { formatSchedule, cn } from "@/lib/utils";
import { toast } from "sonner";

const DAYS_OF_WEEK = [
  { label: "M", value: 1, full: "Monday" },
  { label: "T", value: 2, full: "Tuesday" },
  { label: "W", value: 3, full: "Wednesday" },
  { label: "Th", value: 4, full: "Thursday" },
  { label: "F", value: 5, full: "Friday" },
  { label: "S", value: 6, full: "Saturday" },
];

interface ScheduleSlot {
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
}

interface CourseRow {
  id: string;
  name: string;
  code: string;
  units: number;
  program: string;
  programName: string;
  yearLevel: number;
  section: string;
  faculty_id?: string;
  faculty_name?: string;
  students: number;
  scheduleSummary: string;
  rawSlots: ScheduleSlot[];
}

export default function CoursesPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [facultyList, setFacultyList] = useState<{id: string, name: string}[]>([]);
  const [programs, setPrograms] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseRow | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const { data: sData, error: sErr } = await supabase
        .from("subjects")
        .select(`
          *,
          courses (name),
          faculty (
            profiles (first_name, last_name)
          ),
          schedule_slots (*)
        `);

      if (sErr) throw sErr;

      const { data: eData } = await supabase.from("enrollments").select("subject_id");
      const counts = (eData || []).reduce((acc: Record<string, number>, e: { subject_id: string }) => {
        acc[e.subject_id] = (acc[e.subject_id] || 0) + 1;
        return acc;
      }, {});

      const formatted: CourseRow[] = (sData || []).map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        units: s.units || 3,
        program: s.course_id,
        programName: s.courses?.name || s.course_id || "N/A",
        yearLevel: s.year_level,
        section: s.section,
        faculty_id: s.faculty_id,
        faculty_name: s.faculty?.profiles ? `${s.faculty.profiles.first_name} ${s.faculty.profiles.last_name}` : undefined,
        students: counts[s.id] || 0,
        scheduleSummary: formatSchedule(s.schedule_slots),
        rawSlots: s.schedule_slots || []
      }));

      setCourses(formatted);

      const { data: fData } = await supabase.from("profiles").select("id, first_name, last_name").eq("role", "faculty");
      setFacultyList((fData || []).map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` })));

      const { data: pData } = await supabase.from("courses").select("id, name");
      setPrograms(pData || []);

    } catch (err: unknown) {
      toast.error("Failed to fetch course data");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleDay = (val: number) => {
    setSelectedDays(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const handleEditClick = (course: CourseRow) => {
    setEditCourse(course);
    setSelectedDays(course.rawSlots.map(s => s.day_of_week));
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const code = formData.get("code") as string;
      const units = parseInt(formData.get("units") as string);
      const program_id = formData.get("program_id") as string;
      const year_level = parseInt(formData.get("year_level") as string);
      const section = formData.get("section") as string;
      const faculty_id = formData.get("faculty_id") as string === "none" ? null : formData.get("faculty_id") as string;
      
      const startTime = formData.get("start_time") as string;
      const endTime = formData.get("end_time") as string;
      const room = formData.get("room") as string;

      let courseId = editCourse?.id;

      if (editCourse) {
        const { error } = await supabase
          .from("subjects")
          .update({ name, code, units, course_id: program_id, year_level, section, faculty_id })
          .eq("id", editCourse.id);
        if (error) throw error;
      } else {
        courseId = code.toLowerCase().replace(/\s+/g, '-');
        const { error } = await supabase
          .from("subjects")
          .insert({ 
            id: courseId,
            name, code, units, course_id: program_id, year_level, section, faculty_id 
          });
        if (error) throw error;
      }

      if (selectedDays.length > 0 && courseId) {
        await supabase.from("schedule_slots").delete().eq("subject_id", courseId);
        const inserts = selectedDays.map(day => ({
          subject_id: courseId,
          day_of_week: day,
          start_time: `${startTime}:00`,
          end_time: `${endTime}:00`,
          room: room || "TBA"
        }));
        await supabase.from("schedule_slots").insert(inserts);
      }

      // Notify Faculty if assigned
      if (faculty_id && faculty_id !== editCourse?.faculty_id) {
        await supabase.from("notifications").insert({
          user_id: faculty_id,
          title: "New Subject Assigned",
          message: `You have been assigned to teach ${name} (${code}) for this semester.`,
          type: "schedule",
          link: "/faculty/classes"
        });
      }

      toast.success(editCourse ? "Course updated" : "Course created");
      setOpen(false);
      setEditCourse(null);
      setSelectedDays([]);
      fetchData();
    } catch (err: unknown) {
      toast.error("Failed to save course");
    } finally {
      setSaveLoading(false);
    }
  };

  const filtered = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.programName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Course Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{courses.length} courses total</p>
        </div>
        <Button onClick={() => { setEditCourse(null); setSelectedDays([]); setOpen(true); }} className="gap-2 shadow-lg shadow-blue-200">
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="relative max-w-sm">
        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Search courses..." className="pl-9 bg-white" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-24 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="font-medium">Refreshing curriculum list...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-24 flex flex-col items-center gap-3 text-slate-400">
            <BookOpen className="h-16 w-16 opacity-10" />
            <p>No courses match your search</p>
          </div>
        ) : (
          filtered.map((course) => (
            <Card key={course.id} className="hover:shadow-xl transition-all group border-slate-200 overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-base leading-tight truncate">{course.name}</p>
                    <p className="text-[10px] font-black text-blue-600 mt-1 tracking-widest uppercase flex items-center gap-2">
                      <span className="bg-blue-50 px-1.5 py-0.5 rounded">{course.code}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-400 font-bold tracking-normal">{course.programName}</span>
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl" onClick={() => handleEditClick(course)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline" className="flex items-center gap-1.5 border-blue-100 text-blue-700 bg-blue-50/50 px-2 py-1 font-bold">
                    <Hash className="h-3 w-3" />
                    {course.units} Units
                  </Badge>
                  <Badge variant="outline" className="text-slate-500 border-slate-100 bg-slate-50/30 px-2 py-1 font-bold">
                    Year {course.yearLevel} – {course.section}
                  </Badge>
                </div>

                <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-inner-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Class Schedule
                  </p>
                  {course.scheduleSummary !== "TBA" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          {DAYS_OF_WEEK.map(d => {
                            const isActive = course.rawSlots.some(s => s.day_of_week === d.value);
                            return (
                              <div key={d.value} className={cn(
                                "h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-black transition-colors border",
                                isActive ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-300"
                              )}>
                                {d.label}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-600 font-bold">
                          <Clock className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs uppercase">{course.scheduleSummary.split(" ")[1]} {course.scheduleSummary.split(" ")[2]}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-[10px]">{course.rawSlots[0]?.room || "TBA"}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-amber-500 font-black uppercase tracking-widest flex items-center gap-2 py-2">
                      <AlertCircle className="h-4 w-4" />
                      No schedule assigned
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black leading-none">{course.students}</p>
                      <p className="text-[8px] uppercase font-bold text-slate-400">Enrolled</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter truncate max-w-[120px]">
                      {course.faculty_name || "Unassigned"}
                    </p>
                    <p className="text-[8px] uppercase font-bold text-slate-400">Instructor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditCourse(null); }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">{editCourse ? "Edit Course" : "New Course"}</DialogTitle>
            <DialogDescription>Fill in the academic and schedule details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-slate-600">Course Name</Label>
                <Input id="name" name="name" className="bg-slate-50 border-none h-11" placeholder="Advanced Database Systems" defaultValue={editCourse?.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-xs font-bold text-slate-600">Course Code</Label>
                  <Input id="code" name="code" className="bg-slate-50 border-none h-11 font-mono uppercase" placeholder="CS301" defaultValue={editCourse?.code} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="units" className="text-xs font-bold text-slate-600">Units</Label>
                  <Input id="units" name="units" className="bg-slate-50 border-none h-11" type="number" min="1" max="6" defaultValue={editCourse?.units || 3} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Program</Label>
                  <Select name="program_id" defaultValue={editCourse?.program}>
                    <SelectTrigger className="bg-slate-50 border-none h-11"><SelectValue placeholder="Prog" /></SelectTrigger>
                    <SelectContent>
                      {programs.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Year</Label>
                  <Select name="year_level" defaultValue={editCourse ? String(editCourse.yearLevel) : undefined}>
                    <SelectTrigger className="bg-slate-50 border-none h-11"><SelectValue placeholder="Year" /></SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-600">Section</Label>
                  <Select name="section" defaultValue={editCourse?.section}>
                    <SelectTrigger className="bg-slate-50 border-none h-11"><SelectValue placeholder="Sec" /></SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-5">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Settings
              </p>
              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">Active Meeting Days</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={cn(
                        "h-10 w-10 rounded-xl border font-bold text-[10px] transition-all flex items-center justify-center",
                        selectedDays.includes(d.value) 
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "bg-white border-slate-200 text-slate-400 hover:border-blue-300"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">Start Time</Label>
                  <Input name="start_time" type="time" className="bg-white border-blue-100 h-10" defaultValue={editCourse?.rawSlots[0]?.start_time?.slice(0,5) || "08:00"} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">End Time</Label>
                  <Input name="end_time" type="time" className="bg-white border-blue-100 h-10" defaultValue={editCourse?.rawSlots[0]?.end_time?.slice(0,5) || "09:00"} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-tight">Room Assignment</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400" />
                  <Input name="room" className="bg-white border-blue-100 h-10 pl-9" placeholder="e.g. Lab 101" defaultValue={editCourse?.rawSlots[0]?.room} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-600">Assigned Instructor</Label>
              <Select name="faculty_id" defaultValue={editCourse?.faculty_id || "none"}>
                <SelectTrigger className="bg-slate-50 border-none h-11"><SelectValue placeholder="Select faculty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {facultyList.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="h-11" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveLoading} className="bg-blue-600 hover:bg-blue-700 h-11 min-w-[140px] shadow-lg shadow-blue-200">
                {saveLoading ? "Processing..." : editCourse ? "Save Changes" : "Create Course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
