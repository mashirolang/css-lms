"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GraduationCap, Clock, ArrowRight, CheckCircle2, Mail, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function PendingApprovalContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your-generated-email@school.edu";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">CCS LMS</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Enrollment Portal</p>
          </div>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-[2.5rem] border-0 shadow-2xl shadow-blue-900/10 overflow-hidden mb-8">
          <div className="h-2 bg-blue-600 w-full" />
          <div className="p-10">
            <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[2rem] bg-emerald-50 border-4 border-white shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 border-4 border-white shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Application Received!</h2>
            <div className="space-y-4 mb-10">
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Your enrollment application has been successfully submitted and is now queued for review.
              </p>
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                <p className="text-blue-700 font-black text-sm uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <KeyRound className="h-4 w-4" /> You can login now
                </p>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  Use your <strong className="text-slate-900 font-black">Generated System ID</strong> below to log in immediately and start picking your subjects.
                </p>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm font-mono text-blue-700 font-black break-all select-all">
                  {email}
                </div>
                <p className="text-[10px] text-blue-500 mt-4 italic font-bold">Default Password: password123</p>
              </div>
            </div>

            {/* Steps */}
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 text-left">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">What happens next?</h3>
              <div className="space-y-6">
                {[
                  { 
                    icon: <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>, 
                    title: "Application Received",
                    desc: "Your data is securely stored and queued for review."
                  },
                  { 
                    icon: <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center"><KeyRound className="h-5 w-5 text-blue-600" /></div>, 
                    title: "Login & Select Subjects",
                    desc: "Login to pick your courses while waiting for official approval."
                  },
                  { 
                    icon: <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center"><Clock className="h-5 w-5 text-amber-600" /></div>, 
                    title: "Administrator Review",
                    desc: "Staff will verify your details within 1–2 business days."
                  },
                  { 
                    icon: <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Mail className="h-5 w-5 text-indigo-600" /></div>, 
                    title: "Official Confirmation",
                    desc: "Receive final confirmation once your enrollment is finalized."
                  },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0">{step.icon}</div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-none mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Link href="/login">
          <Button className="h-14 px-8 gap-3 w-full bg-slate-900 hover:bg-blue-600 shadow-xl shadow-slate-900/10 rounded-2xl text-lg font-black transition-all active:scale-[0.98]">
            Proceed to Login
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>

        <p className="mt-8 text-xs text-slate-400 font-medium">
          Having trouble? Contact{" "}
          <a href="mailto:registrar@school.edu" className="text-blue-600 font-bold hover:underline">
            registrar@school.edu
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PendingApprovalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PendingApprovalContent />
    </Suspense>
  );
}
