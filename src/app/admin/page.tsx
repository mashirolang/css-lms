"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, BookOpen, UserCheck, AlertCircle,
  TrendingUp, Calendar, ChevronRight, Loader2,
  Settings, Bell, Search, Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { getInitials, cn } from "@/lib/utils";

interface Stats {
  students: number;
  faculty: number;
  courses: number;
  pending: number;
}

interface RecentUser {
  id: string;
  name: string;
  role: string;
  time: string;
  avatar?: string;
}

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats>({ students: 0, faculty: 0, courses: 0, pending: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('monthly');

  const monthlyData = [
    { name: "Jan", count: 45 },
    { name: "Feb", count: 52 },
    { name: "Mar", count: 48 },
    { name: "Apr", count: 70 },
    { name: "May", count: 85 },
    { name: "Jun", count: 120 },
    { name: "Jul", count: 150 },
    { name: "Aug", count: 210 },
    { name: "Sep", count: 180 },
    { name: "Oct", count: 145 },
    { name: "Nov", count: 95 },
    { name: "Dec", count: 65 },
  ];

  const weeklyData = [
    { name: "Mon", count: 12 },
    { name: "Tue", count: 18 },
    { name: "Wed", count: 15 },
    { name: "Thu", count: 25 },
    { name: "Fri", count: 32 },
    { name: "Sat", count: 10 },
    { name: "Sun", count: 5 },
  ];

  const currentChartData = chartView === 'monthly' ? monthlyData : weeklyData;

  const fetchStats = useCallback(async () => {
    try {
      const { count: sCount } = await supabase.from("students").select("*", { count: 'exact', head: true });
      const { count: fCount } = await supabase.from("faculty").select("*", { count: 'exact', head: true });
      const { count: cCount } = await supabase.from("subjects").select("*", { count: 'exact', head: true });
      const { count: pCount } = await supabase.from("students").select("*", { count: 'exact', head: true }).eq("status", "pending");

      setStats({
        students: sCount || 0,
        faculty: fCount || 0,
        courses: cCount || 0,
        pending: pCount || 0
      });

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      const formatted: RecentUser[] = (profiles || []).map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        role: p.role,
        time: "Just now"
      }));

      setRecentUsers(formatted);
    } catch (err: unknown) {
      console.error("Dashboard stats error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Initializing dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Academic Year 2024–2025 · Control Center</p>
        </div>
        {/* Alerts and System Config buttons removed per user request */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats.students, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
          { label: "Total Faculty", value: stats.faculty, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2" },
          { label: "Active Courses", value: stats.courses, icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50", trend: "Stable" },
          { label: "Pending Enrollment", value: stats.pending, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", trend: "High" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold border-slate-100 text-slate-400 group-hover:text-blue-600 transition-colors">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Enrollment Analytics
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={chartView === 'weekly' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setChartView('weekly')}
                className={cn("h-8 text-[10px] uppercase font-bold tracking-wider", chartView === 'weekly' && "bg-blue-50 text-blue-600")}
              >
                Weekly
              </Button>
              <Button 
                variant={chartView === 'monthly' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setChartView('monthly')}
                className={cn("h-8 text-[10px] uppercase font-bold tracking-wider", chartView === 'monthly' && "bg-blue-50 text-blue-600")}
              >
                Monthly
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={chartView === 'monthly' ? 20 : 35}>
                    {currentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === currentChartData.length - 1 ? '#2563eb' : '#cbd5e1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">BSCS Capacity</p>
                <div className="flex items-center gap-2">
                  <Progress value={78} className="h-1.5" />
                  <span className="text-[10px] font-bold">78%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">BSIT Capacity</p>
                <div className="flex items-center gap-2">
                  <Progress value={45} className="h-1.5" />
                  <span className="text-[10px] font-bold">45%</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-slate-400">BSIS Capacity</p>
                <div className="flex items-center gap-2">
                  <Progress value={32} className="h-1.5" />
                  <span className="text-[10px] font-bold">32%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold">Recent Registration</CardTitle>
              <Link href="/admin/students">
                <Button variant="ghost" size="sm" className="h-7 text-blue-600 text-xs px-2">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                        <AvatarFallback className={cn(
                          "text-[10px] font-bold",
                          user.role === 'admin' ? "bg-slate-900 text-white" :
                            user.role === 'faculty' ? "bg-blue-600 text-white" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-blue-600 transition-colors">{user.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-medium">{user.role}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400">{user.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-xl shadow-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50">Next Faculty Meeting</p>
                  <p className="text-sm font-bold">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold gap-2">
                Manage Calendar
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Advanced Controls</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Global search for students, faculty or courses..." className="pl-9 bg-white border-slate-200" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          More Filters
        </Button>
      </div>
    </div>
  );
}
