"use client";

import { CountdownTimer } from "@/components/CountdownTimer";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import Link from "next/link";
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
        <div className="p-4 border-b flex items-center justify-between bg-muted/30">
          <h2 className="font-semibold">All Projects</h2>
          <Badge variant="secondary" className="font-medium">
            {loading ? "Loading..." : `${projects.length} projects`}
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Project Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Delivery Value</TableHead>
              <TableHead>Deadline / Countdown</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  Loading projects...
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => {
                const total = p.tasks?.length || 0;
                const done =
                  p.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
                const progress =
                  total > 0 ? Math.round((done / total) * 100) : 0;

                return (
                  <TableRow
                    key={p.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center text-muted-foreground font-bold">
                          {p.title.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/leader/projects/${p.id}`}
                            className="font-semibold text-sm truncate hover:text-primary transition-colors"
                          >
                            {p.title}
                          </Link>
                          <div className="flex -space-x-1 mt-1">
                            {p.members?.slice(0, 3).map((m) => (
                              <div
                                key={m.user.id}
                                title={m.user.name}
                                className="w-5 h-5 rounded-full bg-primary/10 text-[8px] flex items-center justify-center border border-background font-bold text-primary"
                              >
                                {m.user.name[0]}
                              </div>
                            ))}
                            {p.members?.length > 3 && (
                              <div className="w-5 h-5 rounded-full bg-muted text-[8px] flex items-center justify-center border border-background font-medium">
                                +{p.members.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-24">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      ${p.deliveryValue?.toLocaleString() ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 min-w-[120px]">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
                          {p.deadline
                            ? new Date(p.deadline).toLocaleString([], {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "—"}
                        </span>
                        {p.deadline &&
                        p.status !== "DELIVERED" &&
                        p.status !== "CANCELLED" ? (
                          <CountdownTimer deadline={p.deadline} />
                        ) : p.status === "DELIVERED" ? (
                          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full w-fit">
                            Completed
                          </span>
                        ) : p.status === "CANCELLED" ? (
                          <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full w-fit">
                            Cancelled
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[10px]">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/leader/projects/${p.id}`}
                          className="p-1.5 rounded-md hover:bg-muted text-primary transition-colors"
                          title="View"
                        >
                          <svg
                            className="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="size-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
