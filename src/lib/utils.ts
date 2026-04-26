import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateEmail(firstName: string, lastName: string) {
  const clean = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean(firstName)}.${clean(lastName)}@school.edu`;
}

export function formatSchedule(slots: { day_of_week: number; start_time: string }[]) {
  if (!slots || slots.length === 0) return "TBA";
  
  const dayMap: Record<number, string> = {
    1: "M", 2: "T", 3: "W", 4: "Th", 5: "F", 6: "S", 0: "Sun"
  };

  // Group by time
  const timeGroups: Record<string, number[]> = {};
  slots.forEach(s => {
    const time = s.start_time.slice(0, 5);
    if (!timeGroups[time]) timeGroups[time] = [];
    timeGroups[time].push(s.day_of_week);
  });

  return Object.entries(timeGroups).map(([time, days]) => {
    days.sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)); // Sort Mon-Sun
    
    const dayStr = days.map(d => dayMap[d]).join("");
    
    // Special patterns
    let displayDays = dayStr;
    if (dayStr === "MTWThF") displayDays = "M-F";
    if (dayStr === "MWF") displayDays = "MWF";
    if (dayStr === "TTh") displayDays = "TTh";

    const hour = parseInt(time.split(":")[0]);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayTime = `${hour % 12 || 12}:${time.split(":")[1]} ${ampm}`;

    return `${displayDays} ${displayTime}`;
  }).join(" | ");
}
