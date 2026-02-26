"use client";

import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type ReportData = {
  summary: {
    totalProjects: number;
    completedProjects: number;
    totalValue: number;
    deliveredValue: number;
    activeMembers: number;
  };
  monthlyBreakdown: {
    month: string;
    projects: number;
    completed: number;
    totalValue: number;
    delivered: number;
  }[];
  memberPerformance: {
    id: string;
    name: string;
    email: string;
    department?: string;
    totalProjects: number;
    completed: number;
    completionRate: number;
    totalValue: number;
    delivered: number;
    avgProgress: number;
  }[];
};

export default function LeaderReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      const res = await api.get("/analytics/leader/reports", { params });
      setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const exportCSV = () => {
    if (!data) return;
    const headers = [
      "Member",
      "Total Projects",
      "Completed",
      "Completion Rate",
      "Total Value",
      "Delivered",
      "Avg Progress",
    ];
    const rows = data.memberPerformance.map((m) => [
      m.name,
      m.totalProjects,
      m.completed,
      `${m.completionRate}%`,
      `$${m.totalValue.toLocaleString()}`,
      `$${m.delivered.toLocaleString()}`,
      `${m.avgProgress}%`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "member_performance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMonthlyCSV = () => {
    if (!data) return;
    const headers = [
      "Month",
      "Projects",
      "Completed",
      "Total Value",
      "Delivered",
    ];
    const rows = data.monthlyBreakdown.map((m) => [
      m.month,
      m.projects,
      m.completed,
      `$${m.totalValue.toLocaleString()}`,
      `$${m.delivered.toLocaleString()}`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "monthly_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Performance insights and business intelligence
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportMonthlyCSV}
            className="px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
          >
            ↓ Monthly CSV
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
          >
            ↓ Member CSV
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="rounded-xl border bg-card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            From Date
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
            To Date
          </label>
          <input
            type="date"
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setFromDate("");
            setToDate("");
          }}
          className="h-9 px-4 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SCard label="Total Projects" value={data.summary.totalProjects} />
          <SCard
            label="Completed"
            value={data.summary.completedProjects}
            color="text-emerald-600"
          />
          <SCard
            label="Total Value"
            value={`$${data.summary.totalValue.toLocaleString()}`}
          />
          <SCard
            label="Delivered Value"
            value={`$${data.summary.deliveredValue.toLocaleString()}`}
            color="text-emerald-600"
          />
          <SCard
            label="Active Members"
            value={data.summary.activeMembers}
            color="text-blue-600"
          />
        </div>
      )}

      {/* Monthly Breakdown */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Monthly Performance Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-center">Projects</th>
                <th className="px-4 py-3 text-center">Completed</th>
                <th className="px-4 py-3 text-right">Total Value</th>
                <th className="px-4 py-3 text-right">Delivered</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                data?.monthlyBreakdown.map((m, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{m.month}</td>
                    <td className="px-4 py-3 text-center">{m.projects}</td>
                    <td className="px-4 py-3 text-center text-emerald-600">
                      {m.completed}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${m.totalValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      ${m.delivered.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Performance */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Member Performance</h2>
          <button
            onClick={exportCSV}
            className="text-xs text-primary hover:underline"
          >
            Export CSV →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Member</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-center">Total Projects</th>
                <th className="px-4 py-3 text-center">Completed</th>
                <th className="px-4 py-3 text-center">Completion Rate</th>
                <th className="px-4 py-3 text-right">Total Value</th>
                <th className="px-4 py-3 text-right">Delivered</th>
                <th className="px-4 py-3 text-center">Avg Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : data?.memberPerformance.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No member data available.
                  </td>
                </tr>
              ) : (
                data?.memberPerformance.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {m.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">{m.totalProjects}</td>
                    <td className="px-4 py-3 text-center text-emerald-600">
                      {m.completed}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.completionRate >= 80 ? "bg-emerald-100 text-emerald-700" : m.completionRate >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
                      >
                        {m.completionRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${m.totalValue.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">
                      ${m.delivered.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">{m.avgProgress}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SCard({
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
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
