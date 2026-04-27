"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Search, Filter, Download, ExternalLink, 
  GraduationCap, Mail, Phone, MapPin, 
  ChevronRight, ArrowUpDown, Loader2,
  LayoutGrid, List, Database, CheckCircle2, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { getInitials, cn } from "@/lib/utils";

interface StudentRecord {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  course_code: string;
  year_level: number;
  section: string;
  status: string;
  avatar_url?: string;
}

export default function StudentRecordsPage() {
  const supabase = createClient();
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("students")
          .select(`
            id,
            student_number,
            status,
            year_level,
            section,
            profiles (first_name, last_name, email, avatar_url),
            courses (code)
          `);
        
        if (error) throw error;

        const mapped: StudentRecord[] = (data as unknown as Array<{
          id: string;
          student_number: string | null;
          status: string;
          year_level: number;
          section: string;
          profiles: { first_name: string; last_name: string; email: string; avatar_url: string | null };
          courses: { code: string } | null;
        }> || []).map((s) => ({
          id: s.id,
          student_number: s.student_number || "PENDING",
          first_name: s.profiles?.first_name,
          last_name: s.profiles?.last_name,
          email: s.profiles?.email,
          course_code: s.courses?.code || "N/A",
          year_level: s.year_level,
          section: s.section,
          status: s.status,
          avatar_url: s.profiles?.avatar_url || undefined
        }));

        setRecords(mapped);
      } catch (err) {
        console.error("Failed to fetch records:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecords();
  }, [supabase]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        `${r.first_name} ${r.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesYear = yearFilter === "all" || r.year_level.toString() === yearFilter;

      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [records, searchQuery, statusFilter, yearFilter]);

  // Stats for the top cards
  const stats = useMemo(() => ({
    total: records.length,
    enrolled: records.filter(r => r.status === 'enrolled').length,
    active: records.filter(r => r.status === 'active').length,
    pending: records.filter(r => r.status === 'pending').length
  }), [records]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchQuery, statusFilter, yearFilter]);

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Initializing records database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Student Records Database
          </h1>
          <p className="text-slate-500 text-sm font-medium">Tabulated view with optimized information retrieval for institutional reporting.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl font-bold h-11 border-slate-200 gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Badge className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl text-[10px] tracking-widest h-11">
            {filteredRecords.length} RECORDS FOUND
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Database Records", value: stats.total, color: "text-blue-600", bg: "bg-blue-50", icon: Database },
          { label: "Enrolled Status", value: stats.enrolled, color: "text-emerald-600", bg: "bg-emerald-50", icon: GraduationCap },
          { label: "Active Status", value: stats.active, color: "text-indigo-600", bg: "bg-indigo-50", icon: CheckCircle2 },
          { label: "Pending Review", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-slate-100 shadow-sm rounded-3xl group hover:shadow-xl hover:shadow-slate-200/50 transition-all border-b-4 border-b-transparent hover:border-b-blue-500 bg-white">
            <div className="flex items-center gap-4">
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-6 shadow-inner", stat.bg)}>
                <stat.icon className={cn("h-7 w-7", stat.color)} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none mt-1">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-50 bg-slate-50/50 p-6">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search by name, student number, or email..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-white border-slate-200 rounded-2xl font-bold focus:ring-blue-600 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold border-slate-200 gap-2 shrink-0">
                    <Filter className="h-4 w-4" /> {statusFilter === "all" ? "All Status" : statusFilter.toUpperCase()}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("enrolled")}>Enrolled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold border-slate-200 gap-2 shrink-0">
                    <ArrowUpDown className="h-4 w-4" /> {yearFilter === "all" ? "All Years" : `Year ${yearFilter}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-2xl">
                  <DropdownMenuItem onClick={() => setYearFilter("all")}>All Years</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setYearFilter("1")}>Year 1</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setYearFilter("2")}>Year 2</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setYearFilter("3")}>Year 3</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setYearFilter("4")}>Year 4</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="py-5 px-8 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Student ID</th>
                <th className="py-5 px-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Basic Information</th>
                <th className="py-5 px-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Academic Details</th>
                <th className="py-5 px-4 text-center font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                <th className="py-5 px-8 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center text-slate-400">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-10" />
                    <p className="font-black text-slate-600 uppercase tracking-tight">No records found</p>
                    <p className="text-xs mt-1 font-medium">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 inline-block">
                        <span className="font-mono font-black text-slate-600 text-xs">{r.student_number}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-slate-50">
                          {r.avatar_url && <AvatarImage src={r.avatar_url} />}
                          <AvatarFallback className="bg-blue-600 text-white font-black text-xs">
                            {getInitials(`${r.first_name} ${r.last_name}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{r.first_name} {r.last_name}</p>
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-0.5 uppercase">
                            <Mail className="h-3 w-3" /> {r.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="space-y-1">
                        <p className="font-black text-slate-700 text-xs flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-blue-500" /> {r.course_code}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Year {r.year_level} — Section {r.section}
                        </p>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                      <Badge className={cn(
                        "font-black text-[9px] px-2.5 py-1 uppercase tracking-widest border-none",
                        r.status === 'enrolled' ? "bg-emerald-50 text-emerald-700" :
                        r.status === 'active' ? "bg-blue-50 text-blue-700" :
                        "bg-amber-50 text-amber-700"
                      )}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <Link href={`/admin/students/${r.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-9 px-4 gap-2 hover:bg-blue-50 hover:text-blue-600">
                          Profile <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages || 1}
            </span>
            <div className="h-1 w-1 bg-slate-200 rounded-full" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {filteredRecords.length} Results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 hover:bg-white shadow-sm disabled:opacity-30"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {(() => {
                const delta = 1;
                const range = [];
                for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
                  range.push(i);
                }

                if (currentPage > 1 + delta + 1) range.unshift("...");
                range.unshift(1);
                if (currentPage < totalPages - delta - 1) range.push("...");
                if (totalPages > 1) range.push(totalPages);

                return range.map((p, i) => (
                  <button
                    key={i}
                    disabled={p === "..."}
                    onClick={() => typeof p === "number" && setCurrentPage(p)}
                    className={cn(
                      "h-9 min-w-[36px] px-2 rounded-xl text-[10px] font-black transition-all",
                      currentPage === p 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-100" 
                        : p === "..."
                          ? "bg-transparent text-slate-300 cursor-default"
                          : "bg-white text-slate-400 hover:bg-slate-100 border border-slate-100 shadow-sm"
                    )}
                  >
                    {p}
                  </button>
                ));
              })()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 hover:bg-white shadow-sm disabled:opacity-30"
            >
              Next
            </Button>
          </div>
        </div>
        <div className="bg-slate-900 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Database size={16} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Database Information Retrieval System
            </p>
          </div>
          <div className="flex gap-4">
            <p className="text-[10px] text-slate-500 font-bold">Total Size: {records.length} Student Profiles</p>
            <p className="text-[10px] text-slate-500 font-bold">Latency: 0.00ms (Local Context)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
