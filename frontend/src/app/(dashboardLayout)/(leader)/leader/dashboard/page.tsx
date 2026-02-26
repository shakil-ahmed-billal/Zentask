"use client";

import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type Summary = {
  totalProjects: number;
  completedProjects: number;
  pendingProjects: number;
  cancelledProjects: number;
  inProgressProjects: number;
  totalDeliveryValue: number;
  deliveredValue: number;
};

type Project = {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";
  deliveryValue: number;
  deadline: string;
  members: { user: { id: string; name: string } }[];
  tasks: { id: string; status: string }[];
};

const MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const currentYear = new Date().getFullYear();

export default function LeaderDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (month) params.month = month;
      if (year && month) params.year = year;
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const [statsRes, projectsRes] = await Promise.all([
        api.get("/analytics/leader/stats", { params }),
        api.get("/projects", { params }),
      ]);
      setSummary(statsRes.data.data?.summary ?? null);
      setProjects(projectsRes.data.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, month, year, status, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    fetchData();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leader Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Monitor team performance & financial overview
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border bg-card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Month
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">All Months</option>
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Year
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <input
            type="date"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            To
          </label>
          <input
            type="date"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm"
            placeholder="Project / Member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setSearch("");
            setMonth("");
            setStatus("");
            setFromDate("");
            setToDate("");
          }}
          className="h-9 px-4 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-3 sm:grid-cols-2">
        <FinCard
          label="Total Delivery Value"
          value={summary?.totalDeliveryValue ?? 0}
          color="text-foreground"
        />
        <FinCard
          label="Delivered Value"
          value={summary?.deliveredValue ?? 0}
          color="text-emerald-600"
        />
      </div>

      {/* Project Count Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Total Projects" value={summary?.totalProjects ?? 0} />
        <KpiCard
          label="In Progress"
          value={summary?.inProgressProjects ?? 0}
          color="text-blue-600"
        />
        <KpiCard
          label="Delivered"
          value={summary?.completedProjects ?? 0}
          color="text-emerald-600"
        />
        <KpiCard
          label="Pending"
          value={summary?.pendingProjects ?? 0}
          color="text-yellow-600"
        />
        <KpiCard
          label="Cancelled"
          value={summary?.cancelledProjects ?? 0}
          color="text-red-500"
        />
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">All Projects</h2>
          <span className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${projects.length} projects`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Project Name</th>
                <th className="px-4 py-3 text-left">Members</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Progress</th>
                <th className="px-4 py-3 text-left">Deadline</th>
                <th className="px-4 py-3 text-right">Delivery Value</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading projects...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((p) => {
                  const total = p.tasks?.length || 0;
                  const done =
                    p.tasks?.filter((t) => t.status === "COMPLETED").length ||
                    0;
                  const progress =
                    total > 0 ? Math.round((done / total) * 100) : 0;
                  const days = p.deadline
                    ? Math.ceil(
                        (new Date(p.deadline).getTime() -
                          new Date().getTime()) /
                          86400000,
                      )
                    : null;
                  const isOverdue = days !== null && days < 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-muted/30 transition-colors ${isOverdue ? "bg-red-50/50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {p.title}
                        {isOverdue && (
                          <span className="ml-2 text-[10px] bg-red-100 text-red-700 rounded-full px-2 py-0.5">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex -space-x-1">
                          {p.members?.slice(0, 3).map((m) => (
                            <div
                              key={m.user.id}
                              title={m.user.name}
                              className="w-6 h-6 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center border border-background font-medium"
                            >
                              {m.user.name[0]}
                            </div>
                          ))}
                          {(p.members?.length || 0) > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted text-[9px] flex items-center justify-center border border-background">
                              +{p.members.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs w-8 text-right">
                            {progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.deadline
                          ? new Date(p.deadline).toLocaleDateString()
                          : "—"}
                        {days !== null && !isOverdue && (
                          <div className="text-[10px] text-muted-foreground">
                            {days}d left
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        ${p.deliveryValue?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/leader/projects/${p.id}`}
                            className="text-xs text-primary hover:underline"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FinCard({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>${value.toLocaleString()}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  color = "",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
