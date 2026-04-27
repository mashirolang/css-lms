"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Edit2, Trash2, Calendar, MapPin, 
  Briefcase, Award, Users, Loader2, Sparkles,
  ChevronRight, CheckCircle2, Info
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CoCurricular, CoCurricularType } from "@/lib/types";
import { ActivityBreakdownChart } from "@/components/profiling/ActivityBreakdownChart";

interface Props {
  studentId: string;
  activities: CoCurricular[];
}

const typeConfig: Record<CoCurricularType, { label: string; icon: any; color: string; bg: string }> = {
  club:        { label: "Organization", icon: Users,     color: "text-blue-600",    bg: "bg-blue-50" },
  competition: { label: "Competition",  icon: Award,     color: "text-amber-600",   bg: "bg-amber-50" },
  org_role:    { label: "Leadership",   icon: Briefcase, color: "text-violet-600",  bg: "bg-violet-50" },
  volunteer:   { label: "Volunteer",    icon: Sparkles,  color: "text-emerald-600", bg: "bg-emerald-50" },
  other:       { label: "Achievement",  icon: Info,      color: "text-slate-600",   bg: "bg-slate-50" },
};

export function ActivitiesTab({ studentId, activities: initialActivities }: Props) {
  const supabase = createClient();
  const [activities, setActivities] = useState<CoCurricular[]>(initialActivities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<CoCurricular | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCurrent, setIsCurrent] = useState(false);

  const [formData, setFormData] = useState({
    type: "club" as CoCurricularType,
    organization: "",
    role: "",
    description: "",
    start_date: "",
    end_date: "" as string | undefined,
  });

  const resetForm = () => {
    setFormData({
      type: "club",
      organization: "",
      role: "",
      description: "",
      start_date: "",
      end_date: "",
    });
    setIsCurrent(false);
    setEditingActivity(null);
  };

  const handleEdit = (act: CoCurricular) => {
    setEditingActivity(act);
    setFormData({
      type: act.type,
      organization: act.organization,
      role: act.role,
      description: act.description || "",
      start_date: act.start_date,
      end_date: act.end_date || "",
    });
    setIsCurrent(!act.end_date);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.organization || !formData.role || !formData.start_date) {
      return toast.error("Please fill in required fields");
    }
    
    setLoading(true);
    const payload = {
      ...formData,
      end_date: isCurrent ? null : (formData.end_date || null),
    };

    try {
      if (editingActivity) {
        const { error } = await supabase
          .from("student_cocurricular")
          .update(payload)
          .eq("id", editingActivity.id);
        if (error) throw error;
        setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...a, ...payload, created_at: a.created_at } as CoCurricular : a));
        toast.success("Record updated");
      } else {
        const { data, error } = await supabase
          .from("student_cocurricular")
          .insert({ student_id: studentId, ...payload })
          .select()
          .single();
        if (error) throw error;
        setActivities(prev => [data, ...prev].sort((a, b) => b.start_date.localeCompare(a.start_date)));
        toast.success("Activity recorded");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this activity?")) return;
    try {
      const { error } = await supabase.from("student_cocurricular").delete().eq("id", id);
      if (error) throw error;
      setActivities(prev => prev.filter(a => a.id !== id));
      toast.success("Activity deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Co-Curricular Timeline</h2>
            <p className="text-sm text-slate-500 font-medium">Your journey through clubs, competitions, and leadership roles.</p>
          </div>
          <Button 
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl h-11 px-6 gap-2 shadow-xl shadow-indigo-200"
          >
            <Plus className="h-4 w-4" /> Record Activity
          </Button>
        </div>

        <div className="relative pl-8 space-y-8 before:absolute before:inset-0 before:left-[15px] before:w-0.5 before:bg-slate-100 before:content-['']">
          {activities.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 py-16 flex flex-col items-center justify-center text-center rounded-3xl -ml-8">
              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <p className="text-slate-600 font-black">No activities recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Add your extracurricular achievements to build a balanced profile.</p>
            </Card>
          ) : (
            activities.map((act) => {
              const config = typeConfig[act.type];
              return (
                <div key={act.id} className="relative group">
                  <div className={cn(
                    "absolute -left-[31px] top-0 h-8 w-8 rounded-full border-4 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 z-10",
                    config.bg, config.color
                  )}>
                    <config.icon className="h-3 w-3" />
                  </div>
                  
                  <Card className="border-slate-200 shadow-lg hover:shadow-2xl hover:shadow-slate-200/40 transition-all rounded-3xl overflow-hidden">
                    <CardContent className="p-6 md:p-8 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", config.bg, config.color)}>
                              {config.label}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                              {new Date(act.start_date).getFullYear()} — {act.end_date ? new Date(act.end_date).getFullYear() : "Present"}
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{act.organization}</h3>
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" /> {act.role}
                          </p>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => handleEdit(act)}>
                            <Edit2 className="h-4 w-4 text-slate-400" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(act.id)}>
                            <Trash2 className="h-4 w-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>

                      {act.description && (
                        <p className="text-sm text-slate-600 leading-relaxed font-medium pt-2 border-t border-slate-50">
                          {act.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-8">
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
              <Award className="h-4 w-4 text-amber-500" />
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ActivityBreakdownChart activities={activities} />
          </CardContent>
        </Card>

        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="h-24 w-24" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black tracking-tight leading-tight">Holistic Development</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Extracurricular participation demonstrates leadership, teamwork, and commitment beyond the classroom.
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400">
                <span>Building a Legacy</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl overflow-hidden p-0">
          <div className="h-2 bg-indigo-600 w-full" />
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-2xl font-black text-slate-900">Record Experience</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Document your participation and achievements.</DialogDescription>
          </DialogHeader>

          <div className="px-8 py-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organization / Event Name</Label>
              <Input 
                value={formData.organization}
                onChange={e => setFormData(p => ({ ...p, organization: e.target.value }))}
                placeholder="e.g. Computer Science Society"
                className="h-11 rounded-xl border-slate-200 font-bold focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role / Position</Label>
                <Input 
                  value={formData.role}
                  onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                  placeholder="e.g. Vice President"
                  className="h-11 rounded-xl border-slate-200 font-bold focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Activity Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val: any) => setFormData(p => ({ ...p, type: val }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="club">Organization / Club</SelectItem>
                    <SelectItem value="competition">Competition / Contest</SelectItem>
                    <SelectItem value="org_role">Leadership Role</SelectItem>
                    <SelectItem value="volunteer">Volunteer Work</SelectItem>
                    <SelectItem value="other">Other Achievement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</Label>
                <Input 
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</Label>
                <Input 
                  type="date"
                  disabled={isCurrent}
                  value={formData.end_date}
                  onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200 font-bold"
                />
                <div className="flex items-center space-x-2 mt-1.5">
                  <Checkbox 
                    id="current" 
                    checked={isCurrent} 
                    onCheckedChange={(checked) => setIsCurrent(!!checked)}
                    className="rounded-md border-slate-300"
                  />
                  <Label htmlFor="current" className="text-[10px] font-bold text-slate-500 uppercase">Still Active</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
              <Textarea 
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your responsibilities or achievements..."
                className="rounded-2xl border-slate-200 min-h-[80px] font-medium"
              />
            </div>
          </div>

          <DialogFooter className="px-8 pb-8 pt-4 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full rounded-xl font-bold" onClick={() => setIsDialogOpen(false)}>
              Discard
            </Button>
            <Button 
              className="w-full rounded-xl font-black bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-200"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
