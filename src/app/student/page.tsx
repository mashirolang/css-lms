"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Clock, BookOpen, Bell, ArrowRight, Calendar, AlertCircle,
  CheckCircle2, Upload, ChevronRight, Plus, Loader2, MapPin, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const statusInfo: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: "Not Started", color: "bg-slate-100 text-slate-600", icon: <AlertCircle className="h-3 w-3" /> },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700", icon: <Upload className="h-3 w-3" /> },
  graded: { label: "Graded", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
};

const typeColor: Record<string, string> = {
  assignment: "bg-blue-100 text-blue-700",
  quiz: "bg-amber-100 text-amber-700",
  exam: "bg-red-100 text-red-700",
};

export default function StudentDashboard() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [student, setStudent] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<string>("");

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchData = useCallback(async () => {
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId) return;

    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
      setUser(profile);

      const { data: studentRecord } = await supabase.from("students").select("*").eq("id", userId).single();
      setStudent(studentRecord);

      // Fetch notifications
      const { data: noteData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);
      setNotifications(noteData || []);

      // Fetch student's subjects
      const { data: enrolled } = await supabase
        .from("enrollments")
        .select("subject_id, subjects(*, schedule_slots(*))")
        .eq("student_id", userId);

      const subjects = (enrolled || []).map(e => e.subjects).filter(Boolean);
      const subjectIds = subjects.map((s: any) => s.id);

      // Today's classes
      const dayNum = new Date().getDay();
      const todayClasses = subjects.flatMap((s: any) => 
        (s.schedule_slots || [])
          .filter((slot: any) => slot.day_of_week === dayNum)
          .map((slot: any) => ({
            code: s.code,
            name: s.name,
            time: slot.start_time.slice(0,5),
            room: slot.room,
            active: false
          }))
      ).sort((a, b) => a.time.localeCompare(b.time));
      setClasses(todayClasses);

      // Fetch activities
      if (subjectIds.length > 0) {
        const { data: acts } = await supabase
          .from("activities")
          .select(`
            *,
            subjects (code)
          `)
          .in("subject_id", subjectIds)
          .order("due_date", { ascending: true })
          .limit(5);

        setActivities((acts || []).map(a => {
          const subject = Array.isArray(a.subjects) ? a.subjects[0] : a.subjects;
          return {
            id: a.id,
            subject: subject?.code || a.subject_id,
            title: a.title,
            dueDate: a.due_date,
            status: "not_started",
            type: a.type
          };
        }));
      }

      // Fetch University Events
      const { data: evs } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString().split('T')[0])
        .order("event_date", { ascending: true })
        .limit(3);
      setEvents(evs || []);

    } catch (err: any) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
    setToday(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
  }, [fetchData]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Syncing dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good morning, {user ? user.first_name : "Student"}! 👋
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">{today}</p>
        </div>
      </div>

      {!loading && student?.status !== 'enrolled' && student?.status !== 'active' && (
        <Card className="border-blue-100 bg-blue-50/50 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                  <Plus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Ready to start your semester?</h3>
                  <p className="text-sm text-slate-600">Browse and enroll in your courses now.</p>
                </div>
              </div>
              <Link href="/student/enrollment">
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-md shadow-blue-100">
                  Enroll in Courses
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Classes Today", value: String(classes.length), icon: <Calendar className="h-4 w-4" />, color: "text-blue-600 bg-blue-50" },
          { label: "Pending Tasks", value: String(activities.length), icon: <AlertCircle className="h-4 w-4" />, color: "text-amber-600 bg-amber-50" },
          { label: "Completed", value: "0", icon: <Upload className="h-4 w-4" />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Notifications", value: String(unreadCount), icon: <Bell className="h-4 w-4" />, color: "text-violet-600 bg-violet-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className={`inline-flex p-2 rounded-lg mb-2 ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            Today&apos;s Schedule
          </h2>
          <Link href="/student/schedule">
            <Button variant="ghost" size="sm" className="text-xs gap-1">
              Full schedule <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {classes.length === 0 ? (
            <div className="flex-1 py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">No classes for today</p>
              <p className="text-[10px] mt-1">Check your enrollment or full schedule</p>
            </div>
          ) : (
            classes.map((cls, i) => (
              <div
                key={i}
                className="shrink-0 flex flex-col gap-1.5 p-4 rounded-xl border min-w-[180px] bg-white border-slate-200 text-slate-700 hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{cls.time}</p>
                <p className="font-bold text-sm leading-tight truncate">{cls.name}</p>
                <p className="text-xs text-slate-400">{cls.code} · {cls.room}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Activities & Deadlines
            </CardTitle>
            <Link href="/student/classes">
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {activities.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No upcoming activities</p>
                <p className="text-xs mt-1">Your courses are all caught up!</p>
              </div>
            ) : (
              activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${typeColor[act.type]}`}>{act.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{act.subject}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{act.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-slate-400">Due {formatDate(act.dueDate)}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", statusInfo[act.status].color)}>
                      {statusInfo[act.status].icon}
                      {statusInfo[act.status].label}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* University Events */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                Campus Events
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {events.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs">No upcoming events</p>
                </div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3 group">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-colors">
                      <p className="text-[7px] font-black uppercase">{new Date(ev.event_date).toLocaleString('default', { month: 'short' })}</p>
                      <p className="text-sm font-black leading-none">{new Date(ev.event_date).getDate()}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate">{ev.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" />
                        {ev.location}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-50">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" />
                Recent Updates
              </CardTitle>
              {unreadCount > 0 && <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-none">{unreadCount} New</Badge>}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-xs">No recent updates</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className={cn("p-3 rounded-xl text-sm transition-all", n.is_read ? "bg-white border border-slate-100" : "bg-blue-50/50 border border-blue-100")}>
                      <p className={cn("leading-snug text-[11px]", !n.is_read ? "text-slate-800 font-bold" : "text-slate-600")}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{formatDate(n.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
