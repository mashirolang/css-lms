"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Edit2, UserX, UserCheck, Briefcase,
  Mail, Phone, BookOpen, Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { getInitials } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface FacultyRow {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: number;
  isActive: boolean;
}

export default function FacultyPage() {
  const supabase = createClient();
  const [faculty, setFaculty] = useState<FacultyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchFaculty = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          email,
          faculty!inner (
            department,
            is_active
          )
        `)
        .eq("role", "faculty");

      if (error) throw error;

      // Also get subject counts
      const { data: subjectCounts, error: sErr } = await supabase
        .from("subjects")
        .select("faculty_id");
      
      if (sErr) throw sErr;

      const counts = (subjectCounts || []).reduce((acc: Record<string, number>, s: any) => {
        if (s.faculty_id) acc[s.faculty_id] = (acc[s.faculty_id] || 0) + 1;
        return acc;
      }, {});

      const formatted: FacultyRow[] = (data || []).map((p: any) => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        email: p.email,
        department: p.faculty?.department || "N/A",
        subjects: counts[p.id] || 0,
        isActive: p.faculty?.is_active ?? true,
      }));

      setFaculty(formatted);
    } catch (err: unknown) {
      toast.error("Failed to fetch faculty");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  const filtered = faculty.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const first_name = formData.get("fFirstName") as string;
      const last_name = formData.get("fLastName") as string;
      const email = formData.get("fEmail") as string;
      const department = formData.get("fDept") as string;

      // Create profile
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .insert({
          first_name,
          last_name,
          email,
          role: "faculty",
          password_hash: "bcrypt_hash_placeholder"
        })
        .select()
        .single();

      if (pErr) throw pErr;

      const { error: fErr } = await supabase
        .from("faculty")
        .insert({
          id: profile.id,
          department,
          is_active: true
        });

      if (fErr) throw fErr;

      toast.success("Faculty created successfully");
      setOpen(false);
      fetchFaculty();
    } catch (err: unknown) {
      toast.error("Failed to create faculty");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("faculty")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Faculty ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchFaculty();
    } catch (err: unknown) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faculty Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">{faculty.filter(f => f.isActive).length} active faculty members</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input placeholder="Search faculty..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Faculty grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p>Loading faculty...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 flex flex-col items-center gap-3 text-slate-400">
            <Briefcase className="h-12 w-12 opacity-30" />
            <p>No faculty found</p>
          </div>
        ) : (
          filtered.map((fac) => (
            <Card key={fac.id} className={`hover:shadow-md transition-all ${!fac.isActive ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="h-11 w-11">
                    <AvatarFallback>{getInitials(fac.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-800 leading-tight">{fac.name}</p>
                      <Badge variant={fac.isActive ? "enrolled" : "inactive"} className="shrink-0">
                        {fac.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{fac.department}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{fac.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                    <span>{fac.subjects} subject{fac.subjects !== 1 ? "s" : ""} assigned</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(fac.id, fac.isActive)}
                    variant="outline"
                    size="sm"
                    className={`flex-1 gap-1.5 text-xs ${fac.isActive ? "text-amber-600 hover:bg-amber-50 border-amber-200" : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"}`}
                  >
                    {fac.isActive ? <><UserX className="h-3.5 w-3.5" />Deactivate</> : <><UserCheck className="h-3.5 w-3.5" />Activate</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Faculty</DialogTitle>
            <DialogDescription>Create a faculty account. Credentials will be sent by email.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fFirstName">First Name</Label>
                <Input id="fFirstName" name="fFirstName" placeholder="Maria" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fLastName">Last Name</Label>
                <Input id="fLastName" name="fLastName" placeholder="Garcia" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fEmail">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="fEmail" name="fEmail" type="email" placeholder="m.garcia@school.edu" className="pl-9" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fDept">Department</Label>
              <Input id="fDept" name="fDept" placeholder="Computer Science" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fPhone">Phone (optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input id="fPhone" placeholder="+63 900 000 0000" className="pl-9" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createLoading}>{createLoading ? "Creating..." : "Create Faculty"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
