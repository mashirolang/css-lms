"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, GraduationCap, Users, BookOpen,
  Calendar, CalendarDays, Bell, Briefcase, UserCircle,
  Shield, ChevronLeft, ChevronRight, FileText, LogOut,
  KeyRound, X, Plus, Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const adminNav: NavItem[] = [
  { label: "Dashboard",        href: "/admin",                  icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Students",         href: "/admin/students",         icon: <GraduationCap className="h-5 w-5" />, badge: 23 },
  { label: "Faculty",          href: "/admin/faculty",          icon: <Briefcase className="h-5 w-5" /> },
  { label: "Courses",          href: "/admin/courses",          icon: <BookOpen className="h-5 w-5" /> },
  { label: "Student Schedule", href: "/admin/student-schedule", icon: <Calendar className="h-5 w-5" /> },
  { label: "Faculty Schedule", href: "/admin/faculty-schedule", icon: <CalendarDays className="h-5 w-5" /> },
  { label: "University Events", href: "/admin/events",           icon: <Sparkles className="h-5 w-5" /> },
  { label: "Notifications",    href: "/admin/notifications",    icon: <Bell className="h-5 w-5" /> },
];

const facultyNav: NavItem[] = [
  { label: "Dashboard",     href: "/faculty",               icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "My Schedule",   href: "/faculty/schedule",      icon: <Calendar className="h-5 w-5" /> },
  { label: "My Classes",    href: "/faculty/classes",       icon: <BookOpen className="h-5 w-5" /> },
  { label: "Notifications", href: "/faculty/notifications", icon: <Bell className="h-5 w-5" />, badge: 3 },
];

const studentNav: NavItem[] = [
  { label: "Dashboard",  href: "/student",            icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Enrollment", href: "/student/enrollment", icon: <Plus className="h-5 w-5" /> },
  { label: "My Schedule",href: "/student/schedule",   icon: <Calendar className="h-5 w-5" /> },
  { label: "My Classes", href: "/student/classes",    icon: <BookOpen className="h-5 w-5" /> },
];

const navByRole: Record<UserRole, NavItem[]> = { admin: adminNav, faculty: facultyNav, student: studentNav };

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; accent: string }> = {
  admin:   { label: "Administrator", icon: <Shield className="h-3 w-3" />,     accent: "bg-violet-500" },
  faculty: { label: "Faculty",       icon: <Briefcase className="h-3 w-3" />,  accent: "bg-blue-500" },
  student: { label: "Student",       icon: <UserCircle className="h-3 w-3" />, accent: "bg-emerald-500" },
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  collapsed: boolean;
  mobileOpen: boolean;
  onCollapse: (v: boolean) => void;
  onMobileClose: () => void;
}

export function Sidebar({
  role, userName, userEmail, userAvatar,
  collapsed, mobileOpen, onCollapse, onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];
  const rc = roleConfig[role];

  const isActive = (href: string) =>
    href === `/${role}` ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[260px]",
          // Mobile: off-screen unless open
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center px-4 border-b border-white/10 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shrink-0">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold leading-none whitespace-nowrap">CCS LMS</p>
              <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">College of Computer Studies</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="ml-auto p-1 rounded-md hover:bg-white/10 lg:hidden"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {/* Role label */}
          {!collapsed && (
            <p className="px-3 mb-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
              {rc.label}
            </p>
          )}

          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-white/8 hover:text-white"
                )}
              >
                <span className="shrink-0">{item.icon}</span>

                {!collapsed && (
                  <span className="text-sm font-medium leading-none whitespace-nowrap flex-1">
                    {item.label}
                  </span>
                )}

                {/* Badge */}
                {item.badge && item.badge > 0 && (
                  <span className={cn(
                    "flex items-center justify-center rounded-full text-[10px] font-bold leading-none bg-red-500 text-white",
                    collapsed ? "absolute top-1.5 right-1.5 h-4 w-4" : "h-5 w-5 ml-auto"
                  )}>
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-white/10">
                    {item.label}
                    {item.badge ? ` (${item.badge})` : ""}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 p-3 shrink-0">
          {/* Change password + logout links */}
          {!collapsed && (
            <div className="flex gap-1 mb-2">
              <Link
                href={`/${role}/change-password`}
                className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Change Password
              </Link>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </form>
            </div>
          )}

          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8">
                {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                <AvatarFallback className="text-xs bg-blue-600 text-white">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <span className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900", rc.accent)} />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate leading-none">{userName}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{userEmail}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-slate-400 hover:text-white hover:bg-slate-600 transition-colors shadow-lg"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </aside>
    </>
  );
}
