"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, Info, ArrowLeft, User, Briefcase, Lock, CheckCircle2, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateEmail } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function FacultyRegisterPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  const emailPreview = firstName && lastName ? generateEmail(firstName, lastName) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!department) {
      toast.error("Please select a department");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.rpc("register_faculty", {
        p_email: emailPreview,
        p_password: password,
        p_first_name: firstName,
        p_last_name: lastName,
        p_department: department,
        p_contact_number: contactNumber,
        p_address: address
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl overflow-hidden">
          <div className="h-2 bg-emerald-500" />
          <CardContent className="p-8 text-center">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Application Received!</h1>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              Your faculty registration for <strong>{department}</strong> is currently under review by the administrator. 
              You will be able to log in once your account has been activated.
            </p>
            <Link href="/faculty/login">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 h-11 font-bold">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        <Link href="/faculty/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Faculty Portal
        </Link>

        <Card className="border-none shadow-2xl overflow-hidden">
          <div className="h-2 bg-blue-600" />
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Faculty Registration</CardTitle>
            </div>
            <CardDescription className="font-medium text-slate-500">
              Join our academic team. Fill out the details below to apply for a faculty account.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        required 
                        placeholder="e.g. John" 
                        className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-medium"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        required 
                        placeholder="e.g. Doe" 
                        className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-medium"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contact Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        required 
                        placeholder="09xx xxx xxxx" 
                        className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-medium"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Department</Label>
                    <Select onValueChange={setDepartment} value={department} required>
                      <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-bold">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <SelectValue placeholder="Select dept" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science" className="font-bold">Computer Science</SelectItem>
                        <SelectItem value="Information Technology" className="font-bold">Information Technology</SelectItem>
                        <SelectItem value="Information Systems" className="font-bold">Information Systems</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Permanent Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 h-4 w-4 text-slate-400" />
                    <Textarea 
                      required 
                      placeholder="Complete house address, street, city..." 
                      className="pl-10 min-h-[80px] bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-medium resize-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 pb-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Account Credentials</h3>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Institutional Email (Generated)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      readOnly
                      placeholder="Email will be generated..." 
                      className="pl-10 h-11 bg-blue-50/50 border-blue-100 focus:ring-blue-500 font-bold text-blue-700"
                      value={emailPreview}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Create Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        required 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-medium"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input 
                        required 
                        type="password" 
                        placeholder="••••••••" 
                        className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-medium"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic mt-1 leading-relaxed">
                  <Info className="h-3 w-3 inline mr-1" /> Password must be at least 8 characters and match exactly.
                </p>
              </div>

              <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Your account will be pending until an administrator verifies your details. 
                  You will be notified once access is granted.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit Application"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{" "}
                <Link href="/faculty/login" className="text-blue-600 font-bold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
          CCS Learning Management System &copy; 2024
        </p>
      </div>
    </div>
  );
}
