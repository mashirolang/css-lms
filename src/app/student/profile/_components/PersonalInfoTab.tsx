"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, User, Phone, MapPin, Calendar, Users } from "lucide-react";
import type { ExtendedProfile } from "@/lib/types";

interface Props {
  studentId: string;
  extended: ExtendedProfile | null;
}

export function PersonalInfoTab({ studentId, extended }: Props) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: extended?.phone || "",
    address: extended?.address || "",
    birth_date: extended?.birth_date || "",
    gender: extended?.gender || "",
    guardian_name: extended?.guardian_name || "",
    guardian_phone: extended?.guardian_phone || "",
    guardian_relation: extended?.guardian_relation || "",
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("student_extended_profiles")
        .upsert({
          student_id: studentId,
          ...formData,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'student_id' });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Detailed Information
            </CardTitle>
            {extended?.updated_at && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Last updated: {new Date(extended.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Phone className="h-3 w-3" /> Contact Number
              </Label>
              <Input 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="rounded-xl border-slate-200 h-11 focus:ring-blue-500 font-medium"
                placeholder="e.g. 09123456789"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Date of Birth
              </Label>
              <Input 
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                className="rounded-xl border-slate-200 h-11 focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gender Identity</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(val: any) => setFormData(prev => ({ ...prev, gender: val }))}
              >
                <SelectTrigger className="rounded-xl border-slate-200 h-11 font-medium">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non_binary">Non-Binary</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <MapPin className="h-3 w-3" /> Current Address
            </Label>
            <Textarea 
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="rounded-2xl border-slate-200 min-h-[100px] focus:ring-blue-500 font-medium"
              placeholder="Enter your full home address"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-black px-8 h-12 rounded-2xl gap-2 shadow-xl shadow-slate-200"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-slate-50 bg-slate-50/50 px-8 py-6">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardian Name</Label>
            <Input 
              value={formData.guardian_name}
              onChange={(e) => setFormData(prev => ({ ...prev, guardian_name: e.target.value }))}
              className="rounded-xl border-slate-200 h-11 focus:ring-indigo-500 font-medium"
              placeholder="Full Name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardian Phone</Label>
            <Input 
              value={formData.guardian_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, guardian_phone: e.target.value }))}
              className="rounded-xl border-slate-200 h-11 focus:ring-indigo-500 font-medium"
              placeholder="Contact Number"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Relationship</Label>
            <Select 
              value={formData.guardian_relation} 
              onValueChange={(val) => setFormData(prev => ({ ...prev, guardian_relation: val }))}
            >
              <SelectTrigger className="rounded-xl border-slate-200 h-11 font-medium">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Relative">Relative</SelectItem>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Guardian">Guardian</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
