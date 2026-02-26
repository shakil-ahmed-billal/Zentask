"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Project = {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";
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
    totalValue: 0,
    deliveredValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deliveryValue: "",
    progress: "",
    startDate: "",
    deadline: "",
    telegramURL: "",
    sheetURL: "",
    projectPhotoURL: "",
    websiteURL: "",
    status: "PENDING",
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (status) params.status = status;
      if (search) params.search = search;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get("/projects", { params });
      const data: Project[] = res.data.data ?? [];
      setProjects(data);

      const totalValue = data.reduce((s, p) => s + (p.deliveryValue || 0), 0);
      const deliveredValue = data
        .filter((p) => p.status === "DELIVERED")
        .reduce((s, p) => s + (p.deliveryValue || 0), 0);
      setSummary({
        totalValue,
        deliveredValue,
      });
    } finally {
      setLoading(false);
    }
  }, [status, search, fromDate, toDate, sortBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/projects/create-project", {
      ...form,
      deliveryValue: parseFloat(form.deliveryValue) || 0,
      progress: parseFloat(form.progress) || 0,
    });
    setShowCreate(false);
    setForm({
      title: "",
      description: "",
      deliveryValue: "",
      progress: "",
      startDate: "",
      deadline: "",
      telegramURL: "",
      sheetURL: "",
      projectPhotoURL: "",
      websiteURL: "",
      status: "PENDING",
    });
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  const handleEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      title: p.title,
      description: (p as any).description || "",
      deliveryValue: String(p.deliveryValue || 0),
      progress: String(p.progress || 0),
      startDate: p.startDate ? p.startDate.split("T")[0] : "",
      deadline: p.deadline ? p.deadline.split("T")[0] : "",
      telegramURL: (p as any).telegramURL || "",
      sheetURL: (p as any).sheetURL || "",
      projectPhotoURL: (p as any).projectPhotoURL || "",
      websiteURL: (p as any).websiteURL || "",
      status: p.status,
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    await api.patch(`/projects/${editingProject.id}`, {
      ...form,
      deliveryValue: parseFloat(form.deliveryValue) || 0,
      progress: parseFloat(form.progress) || 0,
    });
    setShowEdit(false);
    setEditingProject(null);
    setForm({
      title: "",
      description: "",
      deliveryValue: "",
      progress: "",
      startDate: "",
      deadline: "",
      telegramURL: "",
      sheetURL: "",
      projectPhotoURL: "",
      websiteURL: "",
      status: "PENDING",
    });
    fetchProjects();
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/projects/${id}`, { status: newStatus });
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p)),
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
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
      <div className="grid gap-3 sm:grid-cols-2">
        <SCard
          label="Total Value"
          value={`$${summary.totalValue.toLocaleString()}`}
        />
        <SCard
          label="Delivered Value"
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
            <option value="DELIVERED">Delivered</option>
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
            Sort By
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="createdAt">Date Created</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
        <button
          onClick={() => {
            setStatus("");
            setSearch("");
            setFromDate("");
            setToDate("");
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
                    <select
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-none cursor-pointer outline-none ${statusColor(p.status)}`}
                      value={p.status}
                      onChange={(e) => handleStatusUpdate(p.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                    <h3 className="font-semibold mt-2">{p.title}</h3>
                    <Link
                      href={`/leader/projects/${p.id}`}
                      className="text-[10px] text-primary hover:underline mt-1 block"
                    >
                      View Details →
                    </Link>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    Delivery Value:{" "}
                    <strong className="text-foreground">
                      ${p.deliveryValue?.toLocaleString() ?? 0}
                    </strong>
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${p.progress}%` }}
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

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl border p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Edit Project</h2>
            <form
              onSubmit={handleUpdate}
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
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
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
                  onClick={() => {
                    setShowEdit(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                >
                  Update Project
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
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return m[s] ?? "bg-gray-100 text-gray-700";
}
