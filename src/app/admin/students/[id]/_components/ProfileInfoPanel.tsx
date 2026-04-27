"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, MapPin, Calendar, Users, Info } from "lucide-react";
import type { ExtendedProfile } from "@/lib/types";

interface Props {
  profile: any;
  student: any;
  extended: ExtendedProfile | null;
}

interface Field {
  label: string;
  value: any;
  uppercase?: boolean;
  capitalize?: boolean;
  fullWidth?: boolean;
}

interface Group {
  title: string;
  icon: any;
  color: string;
  fields: Field[];
}

export function ProfileInfoPanel({ profile, student, extended }: Props) {
  const infoGroups: Group[] = [
    {
      title: "Basic Information",
      icon: User,
      color: "text-blue-600",
      fields: [
        { label: "First Name", value: profile.first_name },
        { label: "Last Name", value: profile.last_name },
        { label: "Email Address", value: profile.email },
        { label: "Date Joined", value: new Date(profile.created_at).toLocaleDateString() },
      ]
    },
    {
      title: "Academic Detail",
      icon: Info,
      color: "text-indigo-600",
      fields: [
        { label: "Student Number", value: student.student_number || "Not assigned" },
        { label: "Course / Program", value: student.courses?.name },
        { label: "Year & Section", value: `Year ${student.year_level} — ${student.section}` },
        { label: "Status", value: student.status, uppercase: true },
      ]
    },
    {
      title: "Extended Profile",
      icon: Phone,
      color: "text-emerald-600",
      fields: [
        { label: "Contact Phone", value: extended?.phone || "—" },
        { label: "Date of Birth", value: extended?.birth_date ? new Date(extended.birth_date).toLocaleDateString() : "—" },
        { label: "Gender", value: extended?.gender?.replace('_', ' ') || "—", capitalize: true },
        { label: "Home Address", value: extended?.address || "—", fullWidth: true },
      ]
    },
    {
      title: "Emergency Contact",
      icon: Users,
      color: "text-amber-600",
      fields: [
        { label: "Guardian Name", value: extended?.guardian_name || "—" },
        { label: "Guardian Phone", value: extended?.guardian_phone || "—" },
        { label: "Relationship", value: extended?.guardian_relation || "—" },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {infoGroups.map((group, idx) => (
        <Card key={idx} className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-5">
            <CardTitle className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
              <group.icon className={group.color} size={16} />
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              {group.fields.map((field, fIdx) => (
                <div key={fIdx} className={field.fullWidth ? "sm:col-span-2" : ""}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{field.label}</p>
                  <p className={`text-sm font-bold text-slate-800 ${field.uppercase ? "uppercase" : field.capitalize ? "capitalize" : ""}`}>
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
