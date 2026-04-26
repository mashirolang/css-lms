"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { NotificationBell } from "./NotificationPanel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

const pageTitle: Record<string, string> = {
  // Admin
  "/admin":                  "Dashboard",
  "/admin/students":         "Student Management",
  "/admin/faculty":          "Faculty Management",
  "/admin/courses":          "Course Management",
  "/admin/student-schedule": "Student Schedule Manager",
  "/admin/faculty-schedule": "Faculty Schedule Manager",
  "/admin/notifications":    "Notifications Center",
  "/admin/change-password":  "Change Password",
  // Faculty
  "/faculty":                "Dashboard",
  "/faculty/schedule":       "My Schedule",
  "/faculty/classes":        "My Classes",
  "/faculty/post-activity":  "Post Activity",
  "/faculty/notifications":  "Notifications",
  "/faculty/change-password":"Change Password",
  // Student
  "/student":                "Dashboard",
  "/student/schedule":       "My Schedule",
  "/student/classes":        "My Classes",
  "/student/change-password":"Change Password",
};

interface TopHeaderProps {
  role: UserRole;
  userName: string;
  userAvatar?: string;
  onMenuToggle: () => void;
}

export function TopHeader({ role, userName, userAvatar, onMenuToggle }: TopHeaderProps) {
  const pathname = usePathname();

  const title = Object.entries(pageTitle).find(([key]) =>
    key !== `/${role}` ? pathname.startsWith(key) : pathname === key
  )?.[1] ?? "CCS LMS";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 bg-white border-b border-slate-200 px-4 shadow-sm">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-slate-900 truncate">{title}</h1>
      </div>

      {/* Search (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400 w-52 cursor-text hover:border-blue-300 transition-colors">
        <Search className="h-3.5 w-3.5 shrink-0" />
        <span className="text-xs">Search...</span>
      </div>

      {/* Notification bell */}
      <NotificationBell />

      {/* User avatar */}
      <div className="flex items-center gap-2 pl-1 border-l border-slate-100">
        <Avatar className="h-7 w-7">
          {userAvatar && <AvatarImage src={userAvatar} />}
          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        <span className="hidden sm:block text-sm font-medium text-slate-700 truncate max-w-[120px]">
          {userName}
        </span>
      </div>
    </header>
  );
}
