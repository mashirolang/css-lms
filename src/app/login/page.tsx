"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const ROLE_PATHS: Record<string, string> = {
  admin: "/admin",
  faculty: "/faculty",
  student: "/student",
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, role: "student" }), // Default to student or let them choose?
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? "Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push(json.redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-800 via-blue-700 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width:  `${(i + 1) * 180}px`,
                height: `${(i + 1) * 180}px`,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative text-center text-white max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 backdrop-blur border border-white/25 shadow-2xl">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">CCS LMS</h1>
          <p className="text-xl text-blue-200 mb-1">College of Computer Studies</p>
          <p className="text-sm text-blue-300 mb-10">
            Seamless learning — courses, schedules, activities, and grades in one place.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[["500+","Students"],["42","Faculty"],["128","Courses"]].map(([num, lbl]) => (
              <div key={lbl} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold">{num}</div>
                <div className="text-xs text-blue-300">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>Sign in to your CCS LMS account</CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@school.edu"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-9"
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

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <p className="text-sm text-slate-500">
                  New student?{" "}
                  <Link href="/register" className="text-blue-600 font-medium hover:underline">
                    Apply for enrollment
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-xs text-slate-400">
            © 2024 CCS LMS — College of Computer Studies
          </p>
        </div>
      </div>
    </div>
  );
}
