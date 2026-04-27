"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Users, BookOpen, Clock, Calendar, ChevronRight, 
  AlertCircle, BarChart3, Loader2, Plus, MapPin 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn, formatDateTime } from "@/lib/utils";

interface Profile {
  first_name: string;
  last_name: string;
}

interface ClassInfo {
  id: string;
  code: string;
  name: string;
  time: string;
  room: string;
  students: number;
  section: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  is_read: boolean;
}

export default function FacultyDashboard() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ classes: 0, students: 0, pending: 0 });
  const [todayClasses, setTodayClasses] = useState<ClassInfo[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId) return;

    try {
      const { data: pData } = await supabase.from("profiles").select("*").eq("id", userId).single();
      setProfile(pData as Profile);

      // Fetch notifications
      const { data: noteData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(4);
      setRecentNotifications(noteData || []);

      const { data: subjects, error: sErr } = await supabase
        .from("subjects")
        .select(`
          *,
          courses (code),
          schedule_slots (*),
          enrollments (count)
        `)
        .eq("faculty_id", userId);
      
      if (sErr) throw sErr;

      const totalStudents = (subjects || []).reduce((acc, s) => acc + (s.enrollments?.[0]?.count || 0), 0);
      setStats({
        classes: subjects?.length || 0,
        students: totalStudents,
        pending: 0 // Will implement submissions count later
      });

      const todayDay = new Date().getDay();
      const todayList: ClassInfo[] = (subjects || []).flatMap(s => 
        (s.schedule_slots || [])
          .filter((slot: any) => slot.day_of_week === todayDay)
          .map((slot: any) => ({
            id: slot.id,
            code: s.code,
            name: s.name,
            time: slot.start_time.slice(0, 5),
            room: slot.room,
            students: s.enrollments?.[0]?.count || 0,
            section: `${s.courses?.code || 'N/A'}-${s.year_level}${s.section}`
          }))
      ).sort((a, b) => a.time.localeCompare(b.time));

      setTodayClasses(todayList);

      // Fetch University Events
      const { data: evs } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().split('T')[0])
        .order("event_date", { ascending: true })
        .limit(3);
      setEvents(evs || []);

    } catch (err: unknown) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Preparing your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {profile?.first_name ? `Prof. ${profile.last_name}` : "Faculty"}!
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Academic Year 2024–2025 · First Semester
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/faculty/schedule">
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Full Schedule
            </Button>
          </Link>
          <Link href="/faculty/classes">
            <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              <Plus className="h-4 w-4" />
              New Activity
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Active Classes", value: stats.classes, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Students", value: stats.students, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Grading", value: stats.pending, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Today&apos;s Classes
            </h2>
            <Link href="/faculty/schedule">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">View Weekly</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayClasses.length === 0 ? (
              <Card className="col-span-2 border-dashed border-slate-200 bg-slate-50/50">
                <CardContent className="p-12 text-center text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No classes scheduled for today.</p>
                  <p className="text-xs mt-1">Enjoy your break or catch up on grading!</p>
                </CardContent>
              </Card>
            ) : (
              todayClasses.map((cls) => (
                <Card key={cls.id} className="group hover:border-blue-200 transition-all border-slate-100">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                          {cls.code}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{cls.name}</h3>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{cls.section}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-slate-50 border-slate-100">{cls.time}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {cls.students} students</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Room {cls.room}</span>
                      </div>
                      <Link href={`/faculty/classes/${cls.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              University Events
            </h2>
            <Card className="border-slate-100 overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {events.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <p className="text-xs italic">No upcoming events.</p>
                    </div>
                  ) : (
                    events.map((ev) => (
                      <div key={ev.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 group">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-colors">
                          <p className="text-[7px] font-black uppercase">{new Date(ev.event_date).toLocaleString('default', { month: 'short' })}</p>
                          <p className="text-sm font-black leading-none">{new Date(ev.event_date).getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-tight truncate group-hover:text-blue-600 transition-colors">{ev.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {ev.location}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Recent Activity
            </h2>
            <Card className="border-slate-100">
              <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                  {recentNotifications.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                      <p className="text-xs italic">No recent activity to report.</p>
                    </div>
                  ) : (
                    recentNotifications.map((note) => (
                      <div key={note.id} className={cn("p-4 hover:bg-slate-50 transition-colors border-l-4", note.is_read ? "border-transparent" : "border-blue-500 bg-blue-50/20")}>
                        <div className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-sm leading-tight", !note.is_read ? "font-bold text-slate-900" : "text-slate-700")}>{note.title}</p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.message}</p>
                            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold">
                              <Clock className="h-2.5 w-2.5" /> {formatDateTime(note.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/faculty/notifications">
                  <Button variant="ghost" className="w-full text-xs text-slate-400 py-3 rounded-t-none hover:text-blue-600">
                    View All Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
