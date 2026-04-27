"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import type { SubjectGrade } from "@/lib/types";

interface TrendPoint {
  label: string;
  year_level: number;
  gpa: number | null;
}

interface Props {
  studentId: string;
}

export function GpaTrendChart({ studentId }: Props) {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrend() {
      const supabase = createClient();
      const { data: grades } = await supabase.rpc("get_student_gpa", { p_student_id: studentId });
      if (!grades || grades.length === 0) { setLoading(false); return; }

      const subjectIds = (grades as SubjectGrade[]).map((g) => g.subject_id);
      const { data: subjects } = await supabase
        .from("subjects")
        .select("id, year_level")
        .in("id", subjectIds);

      const byYear: Record<number, { wsum: number; units: number }> = {};
      (grades as SubjectGrade[]).forEach((g) => {
        if (!g.has_grades || g.grade_point == null) return;
        const subj = subjects?.find((s) => s.id === g.subject_id);
        if (!subj) return;
        const yl = subj.year_level as number;
        if (!byYear[yl]) byYear[yl] = { wsum: 0, units: 0 };
        byYear[yl].wsum += Number(g.grade_point) * g.units;
        byYear[yl].units += g.units;
      });

      const trend: TrendPoint[] = [1, 2, 3, 4].map((yl) => ({
        label: `Year ${yl}`,
        year_level: yl,
        gpa: byYear[yl] ? parseFloat((byYear[yl].wsum / byYear[yl].units).toFixed(4)) : null,
      }));
      setData(trend);
      setLoading(false);
    }
    fetchTrend();
  }, [studentId]);

  if (loading) {
    return <div className="h-[200px] animate-pulse rounded-xl bg-slate-100" />;
  }

  const hasData = data.some((d) => d.gpa !== null);
  if (!hasData) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <p className="text-xs text-slate-400">GPA trend will appear once grades are recorded.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <YAxis
          domain={[1, 5.5]}
          reversed
          tickFormatter={(v: number) => v.toFixed(2)}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <Tooltip
          formatter={(value: any) => [value != null ? Number(value).toFixed(2) : "—", "GPA"]}
          labelStyle={{ fontWeight: "bold", fontSize: 12 }}
        />
        <ReferenceLine
          y={3}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          label={{ value: "3.00 Passing", fill: "#f59e0b", fontSize: 9, position: "insideTopRight" }}
        />
        <Line
          type="monotone"
          dataKey="gpa"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ fill: "#2563eb", r: 4 }}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
