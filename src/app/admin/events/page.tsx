"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Calendar, Plus, Trash2, MapPin, 
  Loader2, Bell, Sparkles, PartyPopper, BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
}

const typeConfig: Record<string, { color: string, icon: any }> = {
  academic: { color: "bg-blue-100 text-blue-700", icon: BookOpen },
  social: { color: "bg-emerald-100 text-emerald-700", icon: PartyPopper },
  holiday: { color: "bg-amber-100 text-amber-700", icon: Sparkles },
  other: { color: "bg-slate-100 text-slate-700", icon: Calendar },
};

export default function AdminEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const event_date = formData.get("event_date") as string;
      const location = formData.get("location") as string;
      const type = formData.get("type") as string;

      // 1. Save Event
      const { data: event, error: eErr } = await supabase
        .from("events")
        .insert({ title, description, event_date, location, type })
        .select()
        .single();

      if (eErr) throw eErr;

      // 2. Notify ALL Stakeholders
      // Fetch all users
      const { data: users } = await supabase.from("profiles").select("id");
      if (users && users.length > 0) {
        const notifications = users.map(u => ({
          user_id: u.id,
          title: `New University Event: ${title}`,
          message: `Join us for ${title} on ${formatDate(event_date)} at ${location}!`,
          type: "announcement",
          link: "/student" // Or relevant dashboard
        }));
        
        // Batch insert notifications
        await supabase.from("notifications").insert(notifications);
      }

      toast.success("Event created and community notified!");
      setOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error("Failed to create event");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this event?")) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Event removed");
      fetchEvents();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">University Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage campus-wide activities and announcements.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2 shadow-lg shadow-blue-200">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-24 flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="font-medium animate-pulse">Fetching events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-3 py-24 flex flex-col items-center gap-3 text-slate-400 border-2 border-dashed rounded-3xl">
            <Calendar className="h-16 w-16 opacity-10" />
            <p>No upcoming events scheduled</p>
          </div>
        ) : (
          events.map((event) => {
            const Config = typeConfig[event.type] || typeConfig.other;
            return (
              <Card key={event.id} className="group border-slate-100 hover:shadow-xl transition-all overflow-hidden bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={cn("font-bold text-[9px] uppercase tracking-widest", Config.color)}>
                      {event.type}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(event.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg font-black text-slate-900 leading-tight">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {event.description || "No description provided."}
                  </p>
                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">
                        {formatDate(event.event_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-bold truncate max-w-[100px]">
                        {event.location}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-none shadow-2xl rounded-3xl overflow-hidden p-0">
          <DialogHeader className="bg-slate-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-400" />
              Create Event
            </DialogTitle>
            <p className="text-slate-400 text-xs mt-1">This will notify all students and faculty members.</p>
          </DialogHeader>
          <form onSubmit={handleCreate} className="p-8 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Event Title</Label>
              <Input name="title" placeholder="e.g. CCS Week 2024" className="h-12 font-bold bg-slate-50 border-none" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Event Date</Label>
                <Input name="event_date" type="date" className="h-12 font-bold bg-slate-50 border-none" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
                <Select name="type" defaultValue="social">
                  <SelectTrigger className="h-12 font-bold bg-slate-50 border-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</Label>
              <Input name="location" placeholder="e.g. CCS Lobby" className="h-12 font-bold bg-slate-50 border-none" required />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</Label>
              <textarea name="description" className="w-full min-h-[100px] bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Event details..." />
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed font-bold">
                PRO TIP: Publishing this event will send an instant notification to all CCS stakeholders and add it to their dashboards.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveLoading} className="bg-blue-600 hover:bg-blue-700 h-12 px-8 font-black">
                {saveLoading ? "Publishing..." : "Publish Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
