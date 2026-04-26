"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Mail, Info, ArrowLeft, User, Phone, MapPin, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface CourseOption {
  id: string;
  name: string;
  code: string;
}

export default function RegisterPage() {
  const supabase = createClient();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  
  // Basic Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  
  // Contact Info
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  
  // Academic Info
  const [courseId, setCourseId] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [section, setSection] = useState("");
  
  // Guardian Info
  const [guardianName, setGuardianName] = useState("");
  const [guardianContact, setGuardianContact] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from("courses").select("id, name, code");
      if (data) setCourses(data);
    };
    fetchCourses();
  }, [supabase]);

  const emailPreview = firstName && lastName ? generateEmail(firstName, lastName) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.rpc("register_student", {
        p_email: emailPreview,
        p_password: "password123",
        p_first_name: firstName,
        p_last_name: lastName,
        p_middle_name: middleName || null,
        p_birth_date: birthDate,
        p_gender: gender,
        p_contact_number: contactNumber,
        p_address: address,
        p_course_id: courseId,
        p_year_level: parseInt(yearLevel),
        p_section: section,
        p_guardian_name: guardianName || null,
        p_guardian_contact: guardianContact || null
      });

      if (error) throw error;

      toast.success("Application submitted successfully!");
      window.location.href = `/pending-approval?email=${encodeURIComponent(emailPreview)}`;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">CCS LMS</h1>
            <p className="text-sm text-slate-500 font-medium">Student Enrollment Portal</p>
          </div>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden rounded-3xl">
          <div className="h-2 bg-blue-600 w-full" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">Enrollment Application</CardTitle>
            <CardDescription>Please provide accurate information. All fields marked with * are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" placeholder="Juan" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" placeholder="Protacio" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" placeholder="Dela Cruz" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="birthDate">Birth Date *</Label>
                    <div className="relative">
                      <Input id="birthDate" type="date" className="pl-10" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Gender *</Label>
                    <Select onValueChange={setGender} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Contact & Address</h3>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <div className="relative">
                    <Input id="contactNumber" placeholder="0912 345 6789" className="pl-10" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Permanent Address *</Label>
                  <div className="relative">
                    <Textarea id="address" placeholder="House No., Street, Brgy, City, Province" className="pl-10 min-h-[80px]" value={address} onChange={(e) => setAddress(e.target.value)} required />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Academic Details</h3>
                </div>

                <div className="space-y-1.5">
                  <Label>Intended Course *</Label>
                  <Select onValueChange={setCourseId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Year Level *</Label>
                    <Select onValueChange={setYearLevel} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map((y) => (
                          <SelectItem key={y} value={String(y)}>{y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : '4th'} Year</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="section">Section *</Label>
                    <Input id="section" placeholder="e.g. A" value={section} onChange={(e) => setSection(e.target.value)} required />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Heart className="h-4 w-4 text-rose-500" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Guardian Information (Optional)</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="guardianName">Guardian Name</Label>
                    <Input id="guardianName" placeholder="Full Name" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="guardianContact">Guardian Contact</Label>
                    <Input id="guardianContact" placeholder="0912 345 6789" value={guardianContact} onChange={(e) => setGuardianContact(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                {/* Email preview */}
                {emailPreview && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">Generated System ID</p>
                        <p className="text-sm font-mono text-blue-800 bg-white/50 px-2 py-1 rounded inline-block">{emailPreview}</p>
                        <p className="text-[10px] text-blue-500 mt-2 italic">Use this email and the default password to log in after approval.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">Important Note</p>
                      <p className="text-xs text-amber-600 leading-relaxed">
                        Default password: <code className="font-mono bg-amber-100 px-1 py-0.5 rounded font-bold text-amber-800">password123</code>.
                        You will be required to change this upon your first successful login.
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200" disabled={loading}>
                  {loading ? "Processing Application..." : "Submit Enrollment Application"}
                </Button>
              </div>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
