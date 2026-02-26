"use client";

import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type Project = {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  budget: number;
  amount: number;
  deliveryValue: number;
  progress: number;
  deadline: string;
  startDate: string;
  members: { user: { id: string; name: string } }[];
  tasks: { id: string; status: string }[];
  leader: { id: string; name: string };
};

export default function LeaderProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalValue: 0,
    deliveredValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    amount: "",
    deliveryValue: "",
    progress: "",
    startDate: "",
    deadline: "",
    telegramURL: "",
    sheetURL: "",
    projectPhotoURL: "",
    websiteURL: "",
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (status) params.status = status;
      if (search) params.search = search;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (minBudget) params.minBudget = minBudget;
      if (maxBudget) params.maxBudget = maxBudget;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get("/projects", { params });
      const data: Project[] = res.data.data ?? [];
      setProjects(data);

      const inProgress = data.filter((p) => p.status === "IN_PROGRESS").length;
      const completed = data.filter((p) => p.status === "COMPLETED").length;
      const cancelled = data.filter((p) => p.status === "CANCELLED").length;
      const totalValue = data.reduce((s, p) => s + (p.deliveryValue || 0), 0);
      const deliveredValue = data
        .filter((p) => p.status === "COMPLETED")
        .reduce((s, p) => s + (p.deliveryValue || 0), 0);
      setSummary({
        total: data.length,
        inProgress,
        completed,
        cancelled,
        totalValue,
        deliveredValue,
      });
    } finally {
      setLoading(false);
    }
  }, [status, search, fromDate, toDate, minBudget, maxBudget, sortBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/projects/create-project", {
      ...form,
      budget: parseFloat(form.budget) || 0,
      amount: parseFloat(form.amount) || 0,
      deliveryValue: parseFloat(form.deliveryValue) || 0,
      progress: parseFloat(form.progress) || 0,
    });
    setShowCreate(false);
    setForm({
      title: "",
      description: "",
      budget: "",
      amount: "",
      deliveryValue: "",
      progress: "",
      startDate: "",
      deadline: "",
      telegramURL: "",
      sheetURL: "",
      projectPhotoURL: "",
      websiteURL: "",
    });
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm">
            Manage all team projects centrally
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New Project
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SCard label="Total" value={summary.total} />
        <SCard
          label="In Progress"
          value={summary.inProgress}
          color="text-blue-600"
        />
        <SCard
          label="Completed"
          value={summary.completed}
          color="text-emerald-600"
        />
        <SCard
          label="Cancelled"
          value={summary.cancelled}
          color="text-red-500"
        />
        <SCard
          label="Total Value"
          value={`$${summary.totalValue.toLocaleString()}`}
        />
        <SCard
          label="Delivered"
          value={`$${summary.deliveredValue.toLocaleString()}`}
          color="text-emerald-600"
        />
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px] flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm"
            placeholder="Project name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
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
            Min Budget
          </label>
          <input
            type="number"
            className="h-9 rounded-md border bg-background px-3 text-sm w-28"
            placeholder="0"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Max Budget
          </label>
          <input
            type="number"
            className="h-9 rounded-md border bg-background px-3 text-sm w-28"
            placeholder="999999"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Sort By
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Date Created</option>
            <option value="deadline">Deadline</option>
            <option value="budget">Budget</option>
            <option value="name">Name</option>
          </select>
        </div>
        <button
          onClick={() => {
            setStatus("");
            setSearch("");
            setFromDate("");
            setToDate("");
            setMinBudget("");
            setMaxBudget("");
          }}
          className="h-9 px-4 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-3 text-center py-8">
            Loading projects...
          </p>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground col-span-3 text-center py-8">
            No projects found.
          </p>
        ) : (
          projects.map((p) => {
            const total = p.tasks?.length || 0;
            const done =
              p.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const days = p.deadline
              ? Math.ceil(
                  (new Date(p.deadline).getTime() - Date.now()) / 86400000,
                )
              : null;

            return (
              <div
                key={p.id}
                className="rounded-xl border bg-card p-5 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor(p.status)}`}
                    >
                      {p.status.replace("_", " ")}
                    </span>
                    <h3 className="font-semibold mt-2">{p.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Budget:{" "}
                    <strong className="text-foreground">
                      ${p.budget?.toLocaleString()}
                    </strong>
                  </span>
                  <span>
                    Amount:{" "}
                    <strong className="text-foreground">
                      ${p.amount?.toLocaleString() ?? 0}
                    </strong>
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Start:{" "}
                    {p.startDate
                      ? new Date(p.startDate).toLocaleDateString()
                      : "—"}
                  </span>
                  <span>
                    Due:{" "}
                    {p.deadline
                      ? new Date(p.deadline).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                {days !== null && (
                  <div
                    className={`text-xs font-medium ${days < 0 ? "text-red-500" : days < 3 ? "text-orange-500" : "text-muted-foreground"}`}
                  >
                    {days < 0
                      ? `${Math.abs(days)} days overdue`
                      : `${days} days remaining`}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {p.members?.slice(0, 4).map((m) => (
                      <div
                        key={m.user.id}
                        title={m.user.name}
                        className="w-6 h-6 rounded-full bg-primary/20 text-[9px] flex items-center justify-center border border-background font-bold text-primary"
                      >
                        {m.user.name[0]}
                      </div>
                    ))}
                  </div>
                  <a
                    href={`/leader/projects/${p.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View Details →
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl border p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
            <form
              onSubmit={handleCreate}
              className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2"
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Project Title *</label>
                <input
                  required
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="rounded-md border bg-background px-3 py-2 text-sm h-20 resize-none"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Progress (%)</label>
                  <input
                    type="number"
                    max="100"
                    min="0"
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.progress}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, progress: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Project Amount ($)
                  </label>
                  <input
                    type="number"
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Budget ($)</label>
                  <input
                    type="number"
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.budget}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, budget: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">
                    Delivery Value ($)
                  </label>
                  <input
                    type="number"
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.deliveryValue}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deliveryValue: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-sm font-medium">Telegram URL</label>
                  <input
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.telegramURL}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, telegramURL: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-sm font-medium">Sheet URL</label>
                  <input
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.sheetURL}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sheetURL: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-sm font-medium">Website URL</label>
                  <input
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.websiteURL}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, websiteURL: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startDate: e.target.value }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Deadline *</label>
                  <input
                    required
                    type="date"
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.deadline}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, deadline: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

function statusColor(s: string) {
  const m: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return m[s] ?? "bg-gray-100 text-gray-700";
}
