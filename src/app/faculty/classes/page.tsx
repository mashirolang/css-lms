"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  BookOpen, Users, Clock, Calendar, Search, 
  Filter, MoreVertical, FileText, Loader2 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn, formatSchedule } from "@/lib/utils";

interface ClassItem {
  id: string;
  code: string;
  name: string;
  section: string;
  students: number;
  schedule: string;
  pendingActivities: number;
  color: string;
  lightColor: string;
}

const THEMES = [
  { color: "bg-blue-600", light: "bg-blue-50/50 border-blue-100" },
  { color: "bg-emerald-600", light: "bg-emerald-50/50 border-emerald-100" },
  { color: "bg-violet-600", light: "bg-violet-50/50 border-violet-100" },
  { color: "bg-amber-600", light: "bg-amber-50/50 border-amber-100" },
  { color: "bg-rose-600", light: "bg-rose-50/50 border-rose-100" },
];

export default function FacultyClassesPage() {
  const supabase = createClient();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClasses = useCallback(async () => {
    try {
      const cookies = typeof document !== 'undefined' ? document.cookie : '';
      const userId = cookies.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
      
      if (!userId) return;

      const { data: subjects, error: sErr } = await supabase
        .from("subjects")
        .select(`
          *,
          courses (name),
          schedule_slots (*),
          enrollments (count),
          activities (count)
        `)
        .eq("faculty_id", userId);
      
      if (sErr) throw sErr;

      const formatted: ClassItem[] = (subjects || []).map((s, i) => {
        const theme = THEMES[i % THEMES.length];
        const courseName = s.courses?.name || s.course_id || "Unknown";
        return {
          id: s.id,
          code: s.code,
          name: s.name,
          section: `${courseName}-${s.year_level}${s.section}`,
          students: s.enrollments?.[0]?.count || 0,
          schedule: formatSchedule(s.schedule_slots),
          pendingActivities: s.activities?.[0]?.count || 0,
          color: theme.color,
          lightColor: theme.light
        };
      });

      setClasses(formatted);
    } catch (err: unknown) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filtered = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Assigned Classes</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your subjects and students for AY 2024–2025.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by subject name or code..." 
            className="pl-9 bg-white" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="h-16 w-16 animate-spin opacity-20" />
          <p className="font-medium">Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
          <BookOpen className="h-16 w-16 opacity-20" />
          <div className="text-center">
            <p className="font-medium">No classes yet</p>
            <p className="text-sm mt-1">Contact your administrator to get assigned to subjects.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cls) => (
            <Link key={cls.id} href={`/faculty/classes/${cls.id}`}>
              <Card className={cn("hover:shadow-md transition-all cursor-pointer border group", cls.lightColor)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-white font-bold text-sm shrink-0", cls.color)}>
                      {cls.code.slice(-3)}
                    </div>
                    <div className="flex items-center gap-2">
                      {cls.pendingActivities > 0 && (
                        <Badge variant="warning" className="text-xs gap-1">
                          <FileText className="h-3 w-3" />
                          {cls.pendingActivities} Activities
                        </Badge>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-6">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{cls.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{cls.code} · {cls.section}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-200/50">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>{cls.students} Enrolled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium">{cls.schedule}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>Next Session: Tomorrow 8:00 AM</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
