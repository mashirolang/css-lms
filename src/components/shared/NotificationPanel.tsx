"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, X, CheckCheck, BookOpen, Star, Calendar, Settings, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import { type NotificationType } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface RealNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  link?: string;
}

const typeIcon: Record<NotificationType, React.ReactNode> = {
  activity: <BookOpen className="h-4 w-4 text-blue-600" />,
  grade: <Star className="h-4 w-4 text-amber-500" />,
  schedule: <Calendar className="h-4 w-4 text-violet-600" />,
  system: <Settings className="h-4 w-4 text-slate-500" />,
  enrollment: <UserCheck className="h-4 w-4 text-emerald-600" />,
};

const typeBg: Record<NotificationType, string> = {
  activity: "bg-blue-50",
  grade: "bg-amber-50",
  schedule: "bg-violet-50",
  system: "bg-slate-50",
  enrollment: "bg-emerald-50",
};

export function NotificationBell() {
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<RealNotification[]>([]);
  const [loading, setLoading] = useState(false);
  
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId) return;

    const channel = supabase
      .channel('realtime:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as RealNotification, ...prev]);
          toast.info(payload.new.title, {
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, supabase]);

  const markAllRead = async () => {
    const userId = document.cookie.split('; ').map(c => c.trim()).find(row => row.startsWith('user-id='))?.split('=')[1];
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  const markRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      setNotifications(prev =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-semibold text-red-600">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs gap-1 font-bold text-blue-600">
                <CheckCheck className="h-3.5 w-3.5" />
                All read
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Syncing...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 px-4">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                <Bell className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-sm font-bold text-slate-500">No notifications yet</p>
              <p className="text-xs text-center leading-relaxed">You&apos;ll be notified of grade releases, activities, and schedule changes.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-4 transition-all hover:bg-white relative border-l-4",
                    !n.is_read ? "bg-blue-50/40 border-l-blue-600" : "bg-transparent border-l-transparent"
                  )}
                >
                  <div className="flex gap-3">
                    <div className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm", typeBg[n.type])}>
                      {typeIcon[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={cn("text-sm text-slate-900 leading-tight", !n.is_read ? "font-bold" : "font-medium")}>
                          {n.title}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {formatDateTime(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-white">
          <Button variant="outline" className="w-full text-xs font-bold text-slate-500" onClick={() => setOpen(false)}>
            Close Panel
          </Button>
        </div>
      </div>
    </>
  );
}
