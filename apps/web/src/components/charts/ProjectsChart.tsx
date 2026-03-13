"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { Project, Session } from "@timebeat/types";
import { formatDuration } from "@timebeat/utils";

interface ProjectsChartProps {
  sessions: Session[];
  projects: Project[];
}

export function ProjectsChart({ sessions, projects }: ProjectsChartProps) {
  // Aggregate sessions by project
  const projectData = projects
    .map((project) => {
      const projectSessions = sessions.filter(
        (s) => s.projectId === project.id
      );
      const totalSeconds = projectSessions.reduce(
        (sum, s) => sum + s.totalSeconds,
        0
      );

      return {
        id: project.id,
        name: project.name,
        value: totalSeconds,
        color: project.color,
        formatted: formatDuration(totalSeconds),
      };
    })
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 projects

  if (projectData.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-[var(--color-text-muted)]">
        No project data yet
      </div>
    );
  }

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={projectData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {projectData.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number) => [formatDuration(value), "Time"]}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            formatter={(value, entry) => {
              const data = entry.payload as unknown as (typeof projectData)[number];
              return (
                <span className="text-xs">
                  {value} ({data?.formatted ?? ""})
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
