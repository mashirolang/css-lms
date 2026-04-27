"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Edit2, Trash2, Code2, Cpu, Laptop, 
  Layers, Loader2, Search, Filter 
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { StudentSkill, SkillCategory, ProficiencyLevel } from "@/lib/types";

interface Props {
  studentId: string;
  skills: StudentSkill[];
}

const categoryConfig: Record<SkillCategory, { label: string; icon: any; color: string; bg: string }> = {
  programming: { label: "Programming", icon: Code2, color: "text-blue-600", bg: "bg-blue-50" },
  hardware:    { label: "Hardware",    icon: Cpu,   color: "text-amber-600", bg: "bg-amber-50" },
  software:    { label: "Software",    icon: Laptop, color: "text-violet-600", bg: "bg-violet-50" },
  other:       { label: "Other",       icon: Layers, color: "text-slate-600", bg: "bg-slate-50" },
};

const proficiencyMap: Record<ProficiencyLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function SkillsTab({ studentId, skills: initialSkills }: Props) {
  const supabase = createClient();
  const [skills, setSkills] = useState<StudentSkill[]>(initialSkills);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<StudentSkill | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "programming" as SkillCategory,
    proficiency: "beginner" as ProficiencyLevel,
    notes: "",
  });

  const resetForm = () => {
    setFormData({ name: "", category: "programming", proficiency: "beginner", notes: "" });
    setEditingSkill(null);
  };

  const handleEdit = (skill: StudentSkill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency,
      notes: skill.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) return toast.error("Please enter a skill name");
    setLoading(true);
    try {
      if (editingSkill) {
        const { error } = await supabase
          .from("student_skills")
          .update(formData)
          .eq("id", editingSkill.id);
        if (error) throw error;
        setSkills(prev => prev.map(s => s.id === editingSkill.id ? { ...s, ...formData } : s));
        toast.success("Skill updated");
      } else {
        const { data, error } = await supabase
          .from("student_skills")
          .insert({ student_id: studentId, ...formData })
          .select()
          .single();
        if (error) throw error;
        setSkills(prev => [...prev, data]);
        toast.success("Skill added");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const { error } = await supabase.from("student_skills").delete().eq("id", id);
      if (error) throw error;
      setSkills(prev => prev.filter(s => s.id !== id));
      toast.success("Skill removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Technical Proficiency</h2>
          <p className="text-sm text-slate-500 font-medium">Showcase your specialized skills and expertise levels.</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setIsDialogOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl h-11 px-6 gap-2 shadow-xl shadow-blue-200"
        >
          <Plus className="h-4 w-4" /> Add New Skill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 border-slate-200 bg-slate-50/50 py-16 flex flex-col items-center justify-center text-center rounded-3xl">
            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm mb-4">
              <Code2 className="h-8 w-8" />
            </div>
            <p className="text-slate-600 font-black">No skills listed yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Click the button above to start building your technical profile.</p>
          </Card>
        ) : (
          skills.map((skill) => {
            const config = categoryConfig[skill.category];
            const level = proficiencyMap[skill.proficiency];
            return (
              <Card key={skill.id} className="border-slate-200 shadow-lg hover:shadow-2xl hover:shadow-slate-200/50 transition-all rounded-3xl overflow-hidden group">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-3 rounded-2xl", config.bg, config.color)}>
                      <config.icon className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(skill)}>
                        <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(skill.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-slate-400" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="font-black text-slate-900 text-lg leading-tight">{skill.name}</p>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest", config.color)}>
                      {config.label}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                      <span>Proficiency</span>
                      <span className={cn(config.color)}>{skill.proficiency}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step} 
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            step <= level ? config.bg.replace('50', '500') : "bg-slate-100"
                          )} 
                        />
                      ))}
                    </div>
                  </div>

                  {skill.notes && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 italic pt-1">
                      &quot;{skill.notes}&quot;
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-0 shadow-2xl overflow-hidden p-0">
          <div className="h-2 bg-blue-600 w-full" />
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-2xl font-black text-slate-900">
              {editingSkill ? "Refine Skill" : "Add Expertise"}
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Detail your technical capability and proficiency level.
            </DialogDescription>
          </DialogHeader>

          <div className="px-8 py-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skill Name</Label>
              <Input 
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. React.js, Python, Arduino"
                className="h-11 rounded-xl border-slate-200 font-bold focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(val: any) => setFormData(p => ({ ...p, category: val }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Level</Label>
                <Select 
                  value={formData.proficiency} 
                  onValueChange={(val: any) => setFormData(p => ({ ...p, proficiency: val }))}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Additional Notes (Optional)</Label>
              <Textarea 
                value={formData.notes}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Mention specific libraries or projects..."
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Skill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
