import type { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your time tracking overview",
};

// Static export mode: client-only rendering
const isStaticExport = process.env.STATIC_EXPORT === "true";

async function getServerData() {
  if (isStaticExport) {
    return null;
  }

  // Dynamic import to avoid bundling server code in static export
  const { sessionService } = await import("@/lib/services/session.service");
  const { projectService } = await import("@/lib/services/project.service");
  const { Session, Project } = await import("@timebeat/types");

  const now = new Date();

  // Calculate date boundaries
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch all data in parallel
  const [todaySessions, weekSessions, monthSessions, activeProjects] =
    await Promise.all([
      sessionService.getToday().catch(() => []),
      sessionService.getByDateRange(weekStart, now).catch(() => []),
      sessionService.getByDateRange(monthStart, now).catch(() => []),
      projectService.getActive().catch(() => []),
    ]);

  // Calculate totals
  const todaySeconds = todaySessions.reduce(
    (sum: number, s: { totalSeconds: number }) => sum + s.totalSeconds,
    0,
  );
  const weekSeconds = weekSessions.reduce(
    (sum: number, s: { totalSeconds: number }) => sum + s.totalSeconds,
    0,
  );
  const monthSeconds = monthSessions.reduce(
    (sum: number, s: { totalSeconds: number }) => sum + s.totalSeconds,
    0,
  );

  return {
    todaySessions,
    todaySeconds,
    weekSessions,
    weekSeconds,
    monthSessions,
    monthSeconds,
    activeProjects,
  };
}

export default async function DashboardPage() {
  const initialStats = await getServerData();

  return <DashboardContent initialStats={initialStats} />;
}
