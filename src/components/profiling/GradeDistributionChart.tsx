"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from "recharts";
import type { SubjectGrade } from "@/lib/types";

interface Props {
  grades: SubjectGrade[];
}

function barColor(avg: number) {
  if (avg >= 85) return "#10b981"; // emerald
  if (avg >= 75) return "#3b82f6"; // blue
  return "#ef4444";                // red
}

export function GradeDistributionChart({ grades }: Props) {
  const data = grades.map((g) => ({
    code: g.subject_code,
    name: g.subject_name,
    avg: Number(g.weighted_avg),
    hasGrades: g.has_grades,
  }));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="code" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md text-xs">
                <p className="font-semibold text-slate-800">{d.name}</p>
                {d.hasGrades ? (
                  <p className="text-slate-500">Score: <span className="font-bold text-slate-700">{d.avg.toFixed(1)}%</span></p>
                ) : (
                  <p className="text-slate-400 italic">No grades yet</p>
                )}
              </div>
            );
          }}
        />
        <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.hasGrades ? barColor(d.avg) : "#e2e8f0"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
