"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Lock, Mail, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

export default function FacultyLoginPage() {
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, role: "faculty" }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      toast.success("Login successful!");
      router.push(json.redirect);
      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <div className="h-2 bg-slate-900" />
          <CardHeader className="pb-2 text-center space-y-2">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 shadow-lg shadow-slate-200">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Faculty Portal</CardTitle>
            <CardDescription className="font-medium text-slate-500 italic">&quot;Educating the leaders of tomorrow&quot;</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Faculty Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.edu"
                    className="pl-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-slate-900 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Password</Label>
                  <Link href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 underline underline-offset-4">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-slate-50/50 border-slate-200 focus:ring-slate-900 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-12 font-black text-sm uppercase tracking-wider shadow-lg shadow-slate-200 transition-all" disabled={loading}>
                {loading ? "Authenticating…" : "Login to Dashboard"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 font-medium">
                New faculty?{" "}
                <Link href="/faculty/register" className="text-slate-900 font-black hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <Link href="/login" className="hover:text-blue-600 transition-colors">Student Login</Link>
          <span className="opacity-20 text-slate-300">|</span>
          <Link href="/admin/login" className="hover:text-amber-600 transition-colors">Admin Login</Link>
        </div>
      </div>
    </div>
  );
}
