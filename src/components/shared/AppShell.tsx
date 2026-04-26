"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface AppShellProps {
  role: UserRole;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  children: React.ReactNode;
}

export function AppShell({ role, userName, userEmail, userAvatar, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapsed pref from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const handleCollapse = (v: boolean) => {
    setCollapsed(v);
    localStorage.setItem("sidebar-collapsed", String(v));
  };

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        role={role}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCollapse={handleCollapse}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area — offset by sidebar width */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out",
          "lg:ml-[260px]",
          collapsed && "lg:ml-[72px]"
        )}
      >
        <TopHeader
          role={role}
          userName={userName}
          userAvatar={userAvatar}
          onMenuToggle={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
