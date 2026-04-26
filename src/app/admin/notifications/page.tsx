"use client";

import React, { useState } from "react";
import { Bell, Send, Users, GraduationCap, Briefcase, ChevronDown, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime } from "@/lib/utils";

const history = [
  { id: "1", title: "Semester Start Reminder", message: "Classes begin Monday, November 4. Please check your updated schedules.", sentTo: "all", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), recipients: 529 },
  { id: "2", title: "System Maintenance Notice", message: "The LMS will be down for maintenance on Sunday from 2–4 AM.", sentTo: "all", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), recipients: 529 },
  { id: "3", title: "Faculty Meeting", message: "Mandatory faculty meeting this Friday at 3:00 PM in the conference room.", sentTo: "faculty", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), recipients: 42 },
  { id: "4", title: "Enrollment Deadline", message: "Last day to submit enrollment applications is October 31.", sentTo: "student", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), recipients: 487 },
  { id: "5", title: "Holiday Notice", message: "Classes are suspended on November 1–2 for All Saints' Day and All Souls' Day.", sentTo: "all", sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), recipients: 529 },
];

const roleLabel: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: "All Users", icon: <Users className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-700" },
  student: { label: "Students", icon: <GraduationCap className="h-3.5 w-3.5" />, color: "bg-emerald-100 text-emerald-700" },
  faculty: { label: "Faculty", icon: <Briefcase className="h-3.5 w-3.5" />, color: "bg-violet-100 text-violet-700" },
};

export default function NotificationsPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("all");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    setTitle("");
    setMessage("");
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Notifications Center</h1>
        <p className="text-slate-500 text-sm mt-0.5">Broadcast announcements and view notification history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              Compose Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Send To</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      {roleLabel[target]?.icon}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2"><Users className="h-4 w-4" /> All Users</div>
                    </SelectItem>
                    <SelectItem value="student">
                      <div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Students Only</div>
                    </SelectItem>
                    <SelectItem value="faculty">
                      <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" /> Faculty Only</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Semester Start Reminder"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Message</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 resize-none"
                  placeholder="Write your announcement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <p className="text-xs text-slate-400 text-right">{message.length} / 500</p>
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Recipients preview:</p>
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${roleLabel[target].color}`}>
                  {roleLabel[target].icon}
                  {roleLabel[target].label}
                  {target === "all" && " (529 users)"}
                  {target === "student" && " (487 students)"}
                  {target === "faculty" && " (42 faculty)"}
                </div>
              </div>

              {sent && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm">
                  <Send className="h-4 w-4" />
                  Announcement sent successfully!
                </div>
              )}

              <Button type="submit" className="w-full gap-2" loading={loading} disabled={!title || !message}>
                <Send className="h-4 w-4" />
                {loading ? "Sending..." : "Send Announcement"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              Notification History
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <div className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${roleLabel[item.sentTo].color}`}>
                      {roleLabel[item.sentTo].icon}
                      {roleLabel[item.sentTo].label}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{item.message}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {item.recipients} recipients
                    </span>
                    <span>{formatDateTime(item.sentAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
