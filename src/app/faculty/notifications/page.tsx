"use client";

import React, { useState } from "react";
import { Bell, Upload, Star, CheckCheck, BookOpen, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatDateTime } from "@/lib/utils";

interface Notif {
  id: string;
  title: string;
  message: string;
  type: "submission" | "system" | "grade";
  isRead: boolean;
  createdAt: string;
}

const notifications: Notif[] = [
  { id: "1", title: "New Submission", message: "Maria Santos submitted Activity 3: Stack Implementation in CS101 – BSCS-2A", type: "submission", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: "2", title: "New Submission", message: "Juan Dela Cruz submitted Activity 3: Stack Implementation in CS101 – BSCS-2A", type: "submission", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
  { id: "3", title: "New Submission", message: "Ana Reyes submitted Lab 2: ER Diagram in CS201 – BSCS-2B", type: "submission", isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: "4", title: "Deadline Alert", message: "CS201 Lab 2 is due in 2 hours. 12 students have not submitted.", type: "system", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "5", title: "New Submission", message: "Carlo Mendoza submitted Quiz 1: Process Scheduling in CS301 – BSCS-3A", type: "submission", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  { id: "6", title: "System Notice", message: "Admin posted a new announcement: Semester Start Reminder", type: "system", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "7", title: "New Submission", message: "Lea Garcia submitted Activity 1: Arrays & Linked Lists in CS101 – BSCS-2A", type: "submission", isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
];

const typeIcon = {
  submission: <Upload className="h-4 w-4 text-blue-600" />,
  system: <Bell className="h-4 w-4 text-slate-500" />,
  grade: <Star className="h-4 w-4 text-amber-500" />,
};

const typeBg = {
  submission: "bg-blue-50",
  system: "bg-slate-50",
  grade: "bg-amber-50",
};

export default function FacultyNotificationsPage() {
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState("all");

  const filtered = notifs.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "submission") return n.type === "submission";
    if (filter === "system") return n.type === "system";
    return true;
  });

  const unread = notifs.filter((n) => !n.isRead).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const markRead = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unread > 0 ? <><span className="text-blue-600 font-semibold">{unread} unread</span> notifications</> : "All caught up!"}
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2 text-xs">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-400" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Notifications</SelectItem>
            <SelectItem value="unread">Unread Only</SelectItem>
            <SelectItem value="submission">Submissions</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="secondary">{filtered.length} items</Badge>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Bell className="h-12 w-12 opacity-20" />
            <p className="text-sm">No notifications found</p>
          </div>
        ) : (
          filtered.map((n) => (
            <Card
              key={n.id}
              className={cn("cursor-pointer hover:shadow-md transition-all", !n.isRead && "border-blue-200 shadow-sm")}
              onClick={() => markRead(n.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", typeBg[n.type])}>
                    {typeIcon[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("text-sm leading-tight", !n.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700")}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                        <span className="text-xs text-slate-400">{formatDateTime(n.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{n.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
