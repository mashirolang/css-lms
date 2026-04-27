"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import type { CoCurricular, CoCurricularType } from "@/lib/types";

const TYPE_LABELS: Record<CoCurricularType, string> = {
  club: "Club",
  competition: "Competition",
  org_role: "Org Role",
  volunteer: "Volunteer",
  other: "Other",
};

const TYPE_COLORS: Record<CoCurricularType, string> = {
  club: "#3b82f6",
  competition: "#f59e0b",
  org_role: "#8b5cf6",
  volunteer: "#10b981",
  other: "#94a3b8",
};

interface Props {
  activities: CoCurricular[];
}

export function ActivityBreakdownChart({ activities }: Props) {
  if (activities.length === 0) return null;

  const counts: Partial<Record<CoCurricularType, number>> = {};
  activities.forEach((a) => {
    counts[a.type] = (counts[a.type] ?? 0) + 1;
  });

  const data = (Object.keys(counts) as CoCurricularType[]).map((t) => ({
    type: t,
    label: TYPE_LABELS[t],
    count: counts[t] ?? 0,
    color: TYPE_COLORS[t],
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip
          formatter={(value: any) => [value, "Activities"]}
          labelStyle={{ fontWeight: "bold", fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
