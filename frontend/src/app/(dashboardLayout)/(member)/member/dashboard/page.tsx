"use client";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type MemberStats = {
  totalProjects: number;
  ongoingProjects: number;
  completedProjects: number;
  earnedValue: number;
  pendingValue: number;
  avgProgress: number;
};

type Project = {
  id: string;
  name: string;
  status: string;
  budget: number;
  deadline: string;
};

export default function MemberDashboardPage() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [sessionRes, statsRes] = await Promise.all([
          api.get("/auth/get-session"),
          api.get("/analytics/member/stats"),
        ]);
        setUser(sessionRes.data?.user ?? null);
        setStats(statsRes.data.data?.summary ?? null);
        setRecentProjects(statsRes.data.data?.recentProjects ?? []);
        setUpcomingDeadlines(statsRes.data.data?.upcomingDeadlines ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalProjects = stats?.totalProjects ?? 0;
  const completed = stats?.completedProjects ?? 0;
  const completionRate =
    totalProjects > 0 ? Math.round((completed / totalProjects) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-6">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name ?? "Member"} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Here&apos;s what&apos;s happening with your projects today
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Projects" value={stats?.totalProjects ?? 0} />
        <KpiCard
          label="Ongoing"
          value={stats?.ongoingProjects ?? 0}
          color="text-blue-600"
        />
        <KpiCard
          label="Completed"
          value={stats?.completedProjects ?? 0}
          color="text-emerald-600"
        />
        <KpiCard label="Avg Progress" value={`${stats?.avgProgress ?? 0}%`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiCard
          label="Total Value"
          value={`$${(stats?.pendingValue ?? 0) + (stats?.earnedValue ?? 0)}`}
        />
        <KpiCard
          label="Earned Value"
          value={`$${stats?.earnedValue?.toLocaleString() ?? 0}`}
          color="text-emerald-600"
        />
        <KpiCard
          label="Pending Value"
          value={`$${stats?.pendingValue?.toLocaleString() ?? 0}`}
          color="text-yellow-600"
        />
      </div>

      {/* Project Status Overview */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Project Status Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ProgressRing
            label="Completed"
            pct={completionRate}
            color="#10b981"
          />
          <ProgressRing
            label="Completion Rate"
            pct={completionRate}
            color="#3b82f6"
          />
          <ProgressRing
            label="In Progress"
            pct={
              totalProjects > 0
                ? Math.round(
                    ((stats?.ongoingProjects ?? 0) / totalProjects) * 100,
                  )
                : 0
            }
            color="#f59e0b"
          />
          <ProgressRing
            label="Success Rate"
            pct={completionRate}
            color="#8b5cf6"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Projects</h2>
          </div>
          <div className="divide-y">
            {loading ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                Loading...
              </p>
            ) : recentProjects.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                No projects assigned yet.
              </p>
            ) : (
              recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.deadline
                        ? new Date(p.deadline).toLocaleDateString()
                        : "No deadline"}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              ⏰ Upcoming Deadlines{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (Next 7 days)
              </span>
            </h2>
          </div>
          <div className="divide-y">
            {loading ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                Loading...
              </p>
            ) : upcomingDeadlines.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                No upcoming deadlines. 🎉
              </p>
            ) : (
              upcomingDeadlines.map((p) => {
                const days = Math.ceil(
                  (new Date(p.deadline).getTime() - Date.now()) / 86400000,
                );
                return (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${days <= 1 ? "bg-red-100 text-red-700" : days <= 3 ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {days === 0 ? "Due Today!" : `${days}d left`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color = "",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function ProgressRing({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={80} height={80} viewBox="0 0 80 80">
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-muted/30"
        />
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
        <text
          x={40}
          y={45}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          fill="currentColor"
        >
          {pct}%
        </text>
      </svg>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] ?? "bg-gray-100"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
