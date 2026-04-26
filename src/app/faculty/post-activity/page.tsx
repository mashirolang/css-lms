"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Upload, Calendar, Bell, CheckCircle2, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Subject {
  id: string;
  code: string;
  name: string;
}

export default function PostActivityPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [notifiedCount, setNotifiedCount] = useState(0);

  const fetchData = useCallback(async () => {
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, code, name")
        .eq("faculty_id", userId);
      
      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      toast.error("Failed to load subjects");
    } finally {
      setFetchLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId) return;

    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const subjectId = formData.get("subject_id") as string;
      const type = formData.get("type") as string;
      const dueDate = formData.get("due_date") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      const activityId = `act-${Date.now()}`;

      // 1. Create the activity
      const { error: aErr } = await supabase
        .from("activities")
        .insert({
          id: activityId,
          subject_id: subjectId,
          title,
          type,
          description,
          due_date: new Date(dueDate).toISOString(),
          created_by: userId
        });

      if (aErr) throw aErr;

      // 2. Fetch all students enrolled in this subject
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("student_id")
        .eq("subject_id", subjectId);

      const studentIds = (enrollments || []).map(e => e.student_id);
      setNotifiedCount(studentIds.length);

      // 3. Create notifications for all students
      if (studentIds.length > 0) {
        const selectedSub = subjects.find(s => s.id === subjectId);
        const notifications = studentIds.map(sid => ({
          user_id: sid,
          title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Posted`,
          message: `Prof. posted a new ${type} in ${selectedSub?.code || 'your class'}: ${title}`,
          type: "activity",
          link: `/student/classes/${subjectId}`
        }));

        await supabase.from("notifications").insert(notifications);
      }

      setSuccess(true);
      toast.success("Activity posted and students notified!");
    } catch (err) {
      toast.error("Failed to post activity");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium animate-pulse">Loading assignment portal...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="flex justify-center mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Activity Posted!</h2>
        <p className="text-slate-500 mb-2">Students have been notified about the new activity.</p>
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 mb-6">
          <Bell className="h-4 w-4" />
          Notification sent to {notifiedCount} students
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setSuccess(false)}>Post Another</Button>
          <Link href="/faculty/classes">
            <Button>Back to Classes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/faculty/classes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post Activity</h1>
          <p className="text-slate-500 text-sm mt-0.5">Create and publish a new activity for your class</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            Activity Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="subject_id">Subject / Class <span className="text-red-500">*</span></Label>
              <Select name="subject_id" required>
                <SelectTrigger id="subject_id">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.code} – {s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type">Activity Type <span className="text-red-500">*</span></Label>
                <Select name="type" required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due_date">Due Date <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="due_date" name="due_date" type="date" className="pl-9" required />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title">Activity Title <span className="text-red-500">*</span></Label>
              <Input id="title" name="title" placeholder="e.g. Activity 4: Binary Trees Implementation" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description / Instructions</Label>
              <textarea
                id="description"
                name="description"
                className="flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 resize-none"
                placeholder="Write instructions for the activity..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Attachment (optional)</Label>
              <div className="relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-colors">
                {file ? (
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button" onClick={() => setFile(null)} className="p-1 rounded-md hover:bg-red-50 text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-slate-300" />
                    <div className="text-center">
                      <p className="text-sm text-slate-600">
                        <label className="text-blue-600 hover:underline cursor-pointer">
                          Click to upload
                          <input
                            type="file"
                            className="sr-only"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {" "}or drag and drop
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">PDF, DOC, DOCX, PNG up to 10MB</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <Bell className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                All enrolled students will be notified when you post this activity.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/faculty/classes">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {loading ? "Posting..." : "Post Activity"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
