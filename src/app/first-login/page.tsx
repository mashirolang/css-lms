"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { score: 0, label: "Too short", color: "bg-slate-200" },
    { score: 1, label: "Weak", color: "bg-red-400" },
    { score: 2, label: "Fair", color: "bg-amber-400" },
    { score: 3, label: "Good", color: "bg-blue-400" },
    { score: 4, label: "Strong", color: "bg-emerald-500" },
  ];
  return levels[Math.min(score, 4)];
}

export default function FirstLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getStrength(newPw);
  const mismatch = confirmPw.length > 0 && newPw !== confirmPw;
  const valid = newPw.length >= 8 && newPw === confirmPw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setError(null);

    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    
    if (!userId) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // 1. Update password and clear flag using the new RPC
      const { error: rpcErr } = await supabase.rpc("update_profile_password", {
        p_user_id: userId,
        p_new_password: newPw
      });

      if (rpcErr) throw rpcErr;

      // 2. Get role for redirect
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileErr) throw profileErr;

      router.push(`/${profile?.role ?? "student"}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">CCS LMS</span>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <ShieldCheck className="h-7 w-7 text-blue-600" />
            </div>
            <CardTitle>Set Your Password</CardTitle>
            <CardDescription>
              For your security, please create a new password before continuing. You cannot skip this step.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPw">New Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="newPw"
                    type={showNew ? "text" : "password"}
                    placeholder="At least 8 characters"
                    className="pl-9 pr-9"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Strength indicator */}
                {newPw.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i < strength.score ? strength.color : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.score <= 1 ? "text-red-500" :
                      strength.score === 2 ? "text-amber-500" :
                      strength.score === 3 ? "text-blue-500" : "text-emerald-600"
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPw">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPw"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className={`pl-9 pr-9 ${mismatch ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mismatch && <p className="text-xs text-red-500">Passwords do not match</p>}
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500 space-y-1">
                <p className="font-medium text-slate-600">Password requirements:</p>
                {[
                  [newPw.length >= 8, "At least 8 characters"],
                  [/[A-Z]/.test(newPw), "One uppercase letter"],
                  [/[0-9]/.test(newPw), "One number"],
                  [/[^A-Za-z0-9]/.test(newPw), "One special character (recommended)"],
                ].map(([met, req], i) => (
                  <p key={i} className={`flex items-center gap-1.5 ${met ? "text-emerald-600" : "text-slate-400"}`}>
                    <span>{met ? "✓" : "○"}</span> {req}
                  </p>
                ))}
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading} disabled={!valid}>
                {loading ? "Saving..." : "Set Password & Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
