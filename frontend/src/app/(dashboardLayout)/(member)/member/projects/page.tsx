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
  leader?: { name: string };
  tasks?: { id: string; status: string }[];
  telegramURL?: string;
  sheetURL?: string;
  projectPhotoURL?: string;
  websiteURL?: string;
};

export default function MemberProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

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
      if (statusFilter) params.status = statusFilter;
      const res = await api.get("/projects/my-projects", { params });
      setProjects(res.data.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/projects/create-project", {
        ...form,
        budget: parseFloat(form.budget) || 0,
        amount: parseFloat(form.amount) || 0,
        deliveryValue: parseFloat(form.deliveryValue) || 0,
        progress: parseFloat(form.progress) || 0,
        memberId: "", // Optional as per user requirement to store as string if needed
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
    } catch (err) {
      console.error("Failed to create project", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground text-sm">
            Projects you&apos;re currently assigned to
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
      <div className="grid gap-3 sm:grid-cols-3">
        <SCard label="Total Projects" value={total} />
        <SCard label="In Progress" value={inProgress} color="text-blue-600" />
        <SCard label="Completed" value={completed} color="text-emerald-600" />
      </div>

      {/* Filter */}
      <div className="rounded-xl border bg-card p-4 flex gap-3 items-end flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => setStatusFilter("")}
          className="h-9 px-4 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Project Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground col-span-3 text-center py-8">
            Loading projects...
          </p>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground col-span-3 text-center py-8">
            You haven&apos;t been assigned to any projects yet.
          </p>
        ) : (
          projects.map((p) => {
            const totalTasks = p.tasks?.length || 0;
            const done =
              p.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
            const taskPct =
              totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;
            const pct = p.progress || taskPct;
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
                    {p.leader && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Leader: {p.leader.name}
                      </p>
                    )}
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
                      ${p.budget?.toLocaleString() ?? 0}
                    </strong>
                  </span>
                  <span>
                    Amount:{" "}
                    <strong className="text-foreground">
                      ${p.amount?.toLocaleString() ?? 0}
                    </strong>
                  </span>
                </div>
                {p.telegramURL && (
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <a
                      href={p.telegramURL}
                      target="_blank"
                      className="text-blue-500 hover:underline"
                    >
                      Telegram
                    </a>
                    {p.sheetURL && (
                      <a
                        href={p.sheetURL}
                        target="_blank"
                        className="text-emerald-500 hover:underline"
                      >
                        Sheet
                      </a>
                    )}
                    {p.websiteURL && (
                      <a
                        href={p.websiteURL}
                        target="_blank"
                        className="text-purple-500 hover:underline"
                      >
                        Website
                      </a>
                    )}
                  </div>
                )}
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
                    className={`text-xs font-medium mt-1 ${days < 0 ? "text-red-500" : days <= 3 ? "text-orange-500" : "text-muted-foreground"}`}
                  >
                    ⏱{" "}
                    {days < 0
                      ? `${Math.abs(days)} days overdue`
                      : days === 0
                        ? "Due today!"
                        : `${days} days remaining`}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl border p-6 w-full max-w-lg shadow-xl text-foreground">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Create New Project
            </h2>
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
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
