"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Trophy, BookOpen, Brain, TrendingUp, 
  Target, Info, ArrowUpRight, Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import type { CollegeStats, SkillDistribution, SubjectPerformance } from "@/lib/types";

const COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#334155"];

export default function AdminAnalyticsPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<CollegeStats | null>(null);
  const [skills, setSkills] = useState<SkillDistribution[]>([]);
  const [performance, setPerformance] = useState<SubjectPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: statsData },
        { data: skillsData },
        { data: perfData }
      ] = await Promise.all([
        supabase.rpc("get_college_analytics"),
        supabase.rpc("get_skill_distribution"),
        supabase.rpc("get_subject_performance_stats")
      ]);

      setStats(statsData as CollegeStats);
      setSkills(skillsData || []);
      setPerformance(perfData || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Analyzing college data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Analytics</h1>
        <p className="text-slate-500 text-sm font-medium">Real-time insights across the student body and academic performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats?.total_students || 0, icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "College Avg GPA", value: stats?.avg_gpa?.toFixed(2) || "N/A", icon: Trophy, color: "text-emerald-600 bg-emerald-50" },
          { label: "Enrolled", value: stats?.enrolled_students || 0, icon: Target, color: "text-indigo-600 bg-indigo-50" },
          { label: "Active Courses", value: performance.length, icon: BookOpen, color: "text-amber-600 bg-amber-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-tight">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GPA Trends across Year Levels */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-500">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Student Population by Year
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.students_by_year || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year_level" 
                    tickFormatter={(v) => `Year ${v}`} 
                    tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }}
                  />
                  <YAxis tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Insights: The largest population is currently in **Year {stats?.students_by_year.reduce((a, b) => a.count > b.count ? a : b).year_level}**, indicating a strong intake trend for that batch.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skills Distribution Pie Chart */}
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-500">
              <Brain className="h-4 w-4 text-violet-600" />
              Skills & Expertise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skills}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="category"
                  >
                    {skills.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 bg-violet-50 rounded-2xl border border-violet-100 flex items-start gap-3">
              <Info className="h-4 w-4 text-violet-600 mt-0.5" />
              <p className="text-xs text-violet-700 font-medium leading-relaxed">
                Insights: **{skills[0]?.category}** expertise is currently the most prevalent skill among the student body.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Subjects */}
        <Card className="lg:col-span-2 border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-500">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              Top Performing Subjects (By Avg. Score)
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[10px] tracking-widest px-3">TOP 10</Badge>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    dataKey="subject_code" 
                    type="category" 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} 
                    width={80}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="avg_weighted_score" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                    {performance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avg_weighted_score >= 85 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="h-12 w-12" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peak Performance</p>
                <p className="text-2xl font-black mt-1">{performance[0]?.subject_code || "—"}</p>
                <p className="text-xs text-emerald-400 font-bold mt-1">Avg Score: {performance[0]?.avg_weighted_score}%</p>
              </div>
              <div className="md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">Fast Retrieval for Thesis</h4>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                    Aggregate analytics provide instant access to high-level trends, demonstrating efficient data consolidation and retrieval instead of manual paper-file aggregation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
