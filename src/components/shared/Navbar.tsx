"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  CalendarDays, Bell, LogOut, KeyRound, ChevronDown, Shield,
  Briefcase, UserCircle,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "./NotificationPanel";
import { cn, getInitials } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "Students", href: "/admin/students", icon: <GraduationCap className="h-4 w-4" /> },
  { label: "Faculty", href: "/admin/faculty", icon: <Briefcase className="h-4 w-4" /> },
  { label: "Courses", href: "/admin/courses", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Student Schedule", href: "/admin/student-schedule", icon: <Calendar className="h-4 w-4" /> },
  { label: "Faculty Schedule", href: "/admin/faculty-schedule", icon: <CalendarDays className="h-4 w-4" /> },
  { label: "Notifications", href: "/admin/notifications", icon: <Bell className="h-4 w-4" /> },
];

const facultyNav: NavItem[] = [
  { label: "Dashboard", href: "/faculty", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "My Schedule", href: "/faculty/schedule", icon: <Calendar className="h-4 w-4" /> },
  { label: "My Classes", href: "/faculty/classes", icon: <BookOpen className="h-4 w-4" /> },
  { label: "Notifications", href: "/faculty/notifications", icon: <Bell className="h-4 w-4" /> },
];

const studentNav: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: "My Schedule", href: "/student/schedule", icon: <Calendar className="h-4 w-4" /> },
  { label: "My Classes", href: "/student/classes", icon: <BookOpen className="h-4 w-4" /> },
];

const navByRole: Record<UserRole, NavItem[]> = {
  admin: adminNav,
  faculty: facultyNav,
  student: studentNav,
};

const roleLabel: Record<UserRole, string> = {
  admin: "Administrator",
  faculty: "Faculty",
  student: "Student",
};

const roleIcon: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-3.5 w-3.5" />,
  faculty: <Briefcase className="h-3.5 w-3.5" />,
  student: <UserCircle className="h-3.5 w-3.5" />,
};

const roleColor: Record<UserRole, string> = {
  admin: "text-violet-700 bg-violet-100",
  faculty: "text-blue-700 bg-blue-100",
  student: "text-emerald-700 bg-emerald-100",
};

interface NavbarProps {
  role: UserRole;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
}

export function Navbar({ role, userName = "John Doe", userEmail = "user@school.edu", userAvatar }: NavbarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-14 items-center gap-0 px-4">
        {/* Logo */}
        <Link href={`/${role}`} className="flex items-center gap-2.5 mr-6 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:block text-base font-bold text-slate-900 tracking-tight">CCS LMS</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {item.icon}
                <span className="hidden md:block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-2">
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors">
                <Avatar className="h-7 w-7">
                  {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
                  <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-medium text-slate-900 max-w-[120px] truncate">{userName}</span>
                  <span className={cn("text-[10px] font-medium flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded-full", roleColor[role])}>
                    {roleIcon[role]}
                    {roleLabel[role]}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${role}/change-password`} className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive asChild>
                <Link href="/login" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
