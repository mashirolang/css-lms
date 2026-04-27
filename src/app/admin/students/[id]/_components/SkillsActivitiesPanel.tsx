"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, Cpu, Laptop, Layers, 
  Users, Award, Briefcase, Sparkles, 
  Info, Calendar, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentSkill, CoCurricular, SkillCategory, CoCurricularType } from "@/lib/types";
import { ActivityBreakdownChart } from "@/components/profiling/ActivityBreakdownChart";

interface Props {
  skills: StudentSkill[];
  activities: CoCurricular[];
}

const skillConfig: Record<SkillCategory, { label: string; icon: any; color: string; bg: string }> = {
  programming: { label: "Programming", icon: Code2, color: "text-blue-600", bg: "bg-blue-50" },
  hardware:    { label: "Hardware",    icon: Cpu,   color: "text-amber-600", bg: "bg-amber-50" },
  software:    { label: "Software",    icon: Laptop, color: "text-violet-600", bg: "bg-violet-50" },
  other:       { label: "Other",       icon: Layers, color: "text-slate-600", bg: "bg-slate-50" },
};

const activityConfig: Record<CoCurricularType, { label: string; icon: any; color: string; bg: string }> = {
  club:        { label: "Organization", icon: Users,     color: "text-blue-600",    bg: "bg-blue-50" },
  competition: { label: "Competition",  icon: Award,     color: "text-amber-600",   bg: "bg-amber-50" },
  org_role:    { label: "Leadership",   icon: Briefcase, color: "text-violet-600",  bg: "bg-violet-50" },
  volunteer:   { label: "Volunteer",    icon: Sparkles,  color: "text-emerald-600", bg: "bg-emerald-50" },
  other:       { label: "Achievement",  icon: Info,      color: "text-slate-600",   bg: "bg-slate-50" },
};

const proficiencySteps: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function SkillsActivitiesPanel({ skills, activities }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-12">
        {/* Skills Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Technical Skills</h3>
            <Badge variant="outline" className="font-black text-[10px] uppercase">{skills.length} Listed</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.length === 0 ? (
              <p className="col-span-full py-8 text-center text-slate-400 font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200">No skills recorded.</p>
            ) : (
              skills.map(skill => {
                const config = skillConfig[skill.category];
                const level = proficiencySteps[skill.proficiency];
                return (
                  <Card key={skill.id} className="border-slate-200 shadow-lg rounded-2xl overflow-hidden">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", config.bg, config.color)}>
                          <config.icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 truncate">{skill.name}</p>
                          <p className={cn("text-[9px] font-black uppercase tracking-widest", config.color)}>{config.label}</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                          <span>Proficiency</span>
                          <span>{skill.proficiency}</span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(s => (
                            <div key={s} className={cn("h-1 flex-1 rounded-full", s <= level ? config.bg.replace('50', '500') : "bg-slate-100")} />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Activities Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Activities & Achievements</h3>
            <Badge variant="outline" className="font-black text-[10px] uppercase">{activities.length} Recorded</Badge>
          </div>
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-[23px] before:w-0.5 before:bg-slate-100 before:content-[''] pl-6">
            {activities.length === 0 ? (
              <p className="py-8 text-center text-slate-400 font-medium bg-slate-50 rounded-3xl border border-dashed border-slate-200 -ml-6">No activities recorded.</p>
            ) : (
              activities.map(act => {
                const config = activityConfig[act.type];
                return (
                  <div key={act.id} className="relative">
                    <div className={cn("absolute -left-[23px] top-1 h-6 w-6 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10", config.bg, config.color)}>
                      <config.icon size={10} />
                    </div>
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                      <CardContent className="p-5 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-slate-900">{act.organization}</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{act.role}</p>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {new Date(act.start_date).getFullYear()} — {act.end_date ? new Date(act.end_date).getFullYear() : "Present"}
                          </p>
                        </div>
                        {act.description && <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-50">{act.description}</p>}
                      </CardContent>
                    </Card>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
              <Award className="h-4 w-4 text-amber-500" />
              Activity Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <ActivityBreakdownChart activities={activities} />
          </CardContent>
        </Card>

        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-4">
          <div className="h-12 w-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
            <Info className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Administrative Note</h3>
          <p className="text-slate-500 text-sm leading-relaxed font-medium">
            This information is self-reported by the student. Administrators should verify significant achievements or leadership roles through official documentation if required.
          </p>
        </div>
      </div>
    </div>
  );
}
