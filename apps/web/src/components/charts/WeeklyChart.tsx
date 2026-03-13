"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Session } from "@timebeat/types";

interface WeeklyChartProps {
  sessions: Session[];
}

// Days of week in order (Sun-Sat)
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyChart({ sessions }: WeeklyChartProps) {
  // Aggregate sessions by day of week
  const dayData = DAYS.map((day, index) => {
    const daySessions = sessions.filter((s) => {
      const sessionDay = s.startedAt.getDay();
      return sessionDay === index;
    });

    const totalMinutes = daySessions.reduce(
      (sum, s) => sum + Math.round(s.totalSeconds / 60),
      0
    );

    return {
      day,
      minutes: totalMinutes,
      hours: (totalMinutes / 60).toFixed(1),
    };
  });

  // Get today's day index for highlighting
  const todayIndex = new Date().getDay();

  if (sessions.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[var(--color-text-muted)]">
        No data for this week
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dayData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "var(--color-text-muted)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${Math.round(value / 60)}h`}
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface-hover)" }}
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [`${value} min`, "Time"]}
          />
          <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
            {dayData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === todayIndex
                    ? "var(--color-primary-500)"
                    : "var(--color-primary-300)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
