"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Project = {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "DELIVERED" | "CANCELLED";
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
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
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

  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const onImageSelect = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (monthFilter) params.month = monthFilter;
      if (yearFilter) params.year = yearFilter;
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortBy === "title" ? "asc" : "desc";
      }

      const res = await api.get("/projects/my-projects", { params });
      setProjects(res.data.data ?? []);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, monthFilter, yearFilter, sortBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "deliveryValue" || key === "progress") return;
        formData.append(key, String(value));
      });
      formData.append(
        "deliveryValue",
        String(parseFloat(form.deliveryValue) || 0),
      );
      formData.append("progress", String(parseFloat(form.progress) || 0));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.post("/projects/create-project", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowCreate(false);
      setImageFile(null);
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

  const handleEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      title: p.title,
      description: (p as any).description || "",
      deliveryValue: String(p.deliveryValue || 0),
      progress: String(p.progress || 0),
      startDate: p.startDate ? p.startDate.split("T")[0] : "",
      deadline: p.deadline ? p.deadline.split("T")[0] : "",
      telegramURL: p.telegramURL || "",
      sheetURL: p.sheetURL || "",
      projectPhotoURL: p.projectPhotoURL || "",
      websiteURL: p.websiteURL || "",
      status: p.status,
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "deliveryValue" || key === "progress") return;
        formData.append(key, String(value));
      });
      formData.append(
        "deliveryValue",
        String(parseFloat(form.deliveryValue) || 0),
      );
      formData.append("progress", String(parseFloat(form.progress) || 0));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await api.patch(`/projects/${editingProject.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowEdit(false);
      setEditingProject(null);
      setImageFile(null);
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
    } catch (err) {
      console.error("Failed to update project", err);
    }
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

  const total = projects.length;
  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const completed = projects.filter((p) => p.status === "DELIVERED").length;

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
        <SCard label="Delivered" value={completed} color="text-emerald-600" />
      </div>

      {/* Filter */}
      <div className="rounded-xl border bg-card p-4 flex gap-3 items-end flex-wrap">
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <input
            type="text"
            placeholder="Search projects..."
            className="h-9 rounded-md border bg-background px-3 text-sm w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 w-32">
          <label className="text-xs font-medium text-muted-foreground">
            Sort By
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm w-full"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="createdAt">Newest First</option>
            <option value="deadline">Deadline</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 w-32">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 w-24">
          <label className="text-xs font-medium text-muted-foreground">
            Month
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm w-full"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="">All</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                {new Date(0, i).toLocaleString("default", { month: "short" })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 w-24">
          <label className="text-xs font-medium text-muted-foreground">
            Year
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm w-full"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All</option>
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setMonthFilter("");
            setYearFilter("");
            setSortBy("createdAt");
          }}
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
                {p.projectPhotoURL && (
                  <div className="-mx-5 -mt-5 mb-2 h-32 overflow-hidden rounded-t-xl">
                    <img
                      src={p.projectPhotoURL}
                      alt="Project Banner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
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
                    {p.leader && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Leader: {p.leader.name}
                      </p>
                    )}
                    <Link
                      href={`/member/projects/${p.id}`}
                      className="text-[10px] text-primary hover:underline mt-1 block"
                    >
                      View Details →
                    </Link>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
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
                    Delivery Value:{" "}
                    <strong className="text-foreground">
                      ${p.deliveryValue?.toLocaleString() ?? 0}
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
              {/* Banner Upload */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Project Banner</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageSelect(file);
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setImageDragOver(true);
                  }}
                  onDragLeave={() => setImageDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) onImageSelect(file);
                  }}
                  className={`relative w-full h-32 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                    imageDragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : form.projectPhotoURL ? (
                    <img
                      src={form.projectPhotoURL}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <svg
                        className="size-8 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs">
                        Click or drag to upload banner
                      </span>
                    </div>
                  )}
                </div>
                {form.projectPhotoURL && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, projectPhotoURL: "" }))
                    }
                    className="text-xs text-destructive hover:underline self-start"
                  >
                    Remove banner
                  </button>
                )}
              </div>
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
          <div className="bg-background rounded-xl border p-6 w-full max-w-lg shadow-xl text-foreground">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              Edit Project
            </h2>
            <form
              onSubmit={handleUpdate}
              className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2"
            >
              {/* Banner Upload */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Project Banner</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImageSelect(file);
                  }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setImageDragOver(true);
                  }}
                  onDragLeave={() => setImageDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setImageDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) onImageSelect(file);
                  }}
                  className={`relative w-full h-32 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden ${
                    imageDragOver
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/30 hover:border-primary/50"
                  }`}
                >
                  {imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : form.projectPhotoURL ? (
                    <img
                      src={form.projectPhotoURL}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <svg
                        className="size-8 opacity-50"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-xs">
                        Click or drag to upload banner
                      </span>
                    </div>
                  )}
                </div>
                {(imageFile || form.projectPhotoURL) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setForm((f) => ({ ...f, projectPhotoURL: "" }));
                    }}
                    className="text-xs text-destructive hover:underline self-start"
                  >
                    Remove banner
                  </button>
                )}
              </div>
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
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
