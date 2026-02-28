"use client";

import { CountdownTimer } from "@/components/CountdownTimer";
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
import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";

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

const CustomTimeInput = ({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (time: string) => void;
}) => {
  // value is expected to be "HH:mm" or "HH:mm:ss"
  const time = value || "00:00";
  const [h24, m] = time.split(":").map((v) => parseInt(v) || 0);

  const isPM = h24 >= 12;
  const h12 = h24 % 12 || 12;

  const handleHourChange = (newH12: string) => {
    let h = parseInt(newH12);
    if (isPM) {
      h = h === 12 ? 12 : h + 12;
    } else {
      h = h === 12 ? 0 : h;
    }
    onChange?.(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
    );
  };

  const handleMinuteChange = (newM: string) => {
    onChange?.(`${h24.toString().padStart(2, "0")}:${newM.padStart(2, "0")}`);
  };

  const handleAmPmChange = (newAmPm: string) => {
    let h = h24;
    if (newAmPm === "PM" && !isPM) h += 12;
    if (newAmPm === "AM" && isPM) h -= 12;
    onChange?.(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
    );
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md mt-2 border border-border">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/80">
          Hour
        </span>
        <select
          value={h12}
          onChange={(e) => handleHourChange(e.target.value)}
          className="bg-background text-foreground border border-input rounded px-1.5 py-1 text-sm outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h} className="bg-background text-foreground">
              {h}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/80">
          Min
        </span>
        <select
          value={m}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="bg-background text-foreground border border-input rounded px-1.5 py-1 text-sm outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {Array.from({ length: 60 }, (_, i) => i).map((min) => (
            <option
              key={min}
              value={min}
              className="bg-background text-foreground"
            >
              {min.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold text-muted-foreground/80">
          AM/PM
        </span>
        <select
          value={isPM ? "PM" : "AM"}
          onChange={(e) => handleAmPmChange(e.target.value)}
          className="bg-background text-foreground border border-input rounded px-1.5 py-1 text-sm outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <option value="AM" className="bg-background text-foreground">
            AM
          </option>
          <option value="PM" className="bg-background text-foreground">
            PM
          </option>
        </select>
      </div>
    </div>
  );
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDragOver, setImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    deliveryValue: 0,
    progress: 0,
    deadline: "",
    startDate: "",
    members: [] as string[],
    telegramURL: "",
    sheetURL: "",
    projectPhotoURL: "",
    websiteURL: "",
    status: "PENDING",
  });

  const onImageSelect = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (status) params.status = status;
      if (search) params.search = search;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortBy === "title" ? "asc" : "desc";
      }

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
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "deliveryValue" || key === "progress" || key === "members")
          return;
        formData.append(key, String(value));
      });
      formData.append("deliveryValue", String(form.deliveryValue));
      formData.append("progress", String(form.progress));
      formData.append("members", JSON.stringify(form.members));

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
        deliveryValue: 0,
        progress: 0,
        startDate: "",
        deadline: "",
        members: [],
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
    const date = p.startDate ? new Date(p.startDate) : null;
    const deadline = p.deadline ? new Date(p.deadline) : null;

    const formatDateForInput = (d: Date | null) => {
      if (!d) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setForm({
      title: p.title,
      description: (p as any).description || "",
      deliveryValue: p.deliveryValue || 0,
      progress: (p as any).progress || 0,
      startDate: formatDateForInput(date),
      deadline: formatDateForInput(deadline),
      telegramURL: (p as any).telegramURL || "",
      sheetURL: (p as any).sheetURL || "",
      projectPhotoURL: (p as any).projectPhotoURL || "",
      websiteURL: (p as any).websiteURL || "",
      status: p.status,
      members: (p as any).members || [],
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "deliveryValue" || key === "progress" || key === "members")
          return;
        formData.append(key, String(value));
      });
      formData.append("deliveryValue", String(form.deliveryValue));
      formData.append("progress", String(form.progress));
      formData.append("members", JSON.stringify(form.members));

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
        deliveryValue: 0,
        progress: 0,
        startDate: "",
        deadline: "",
        members: [],
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
        <button
          onClick={() => {
            setStatus("");
            setSearch("");
            setFromDate("");
            setToDate("");
            setSortBy("createdAt");
          }}
          className="h-9 px-4 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
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
                  className="h-32 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading projects...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => {
                const totalTasks = p.tasks?.length || 0;
                const done =
                  p.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
                const taskPct =
                  totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;
                const pct = p.progress || taskPct;

                return (
                  <TableRow
                    key={p.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3 max-w-[280px]">
                        <div className="size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
                          {(p as any).projectPhotoURL ? (
                            <img
                              src={(p as any).projectPhotoURL}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground font-bold">
                              {p.title.charAt(0)}
                            </div>
                          )}
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
                      <select
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border-none cursor-pointer outline-none transition-opacity hover:opacity-80 ${statusColor(p.status)}`}
                        value={p.status}
                        onChange={(e) =>
                          handleStatusUpdate(p.id, e.target.value)
                        }
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 w-24">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-medium">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      ${p.deliveryValue?.toLocaleString() ?? 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
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
                      <div className="flex items-center justify-end gap-2 ">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-md hover:bg-muted text-primary transition-colors"
                          title="Edit"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 rounded-md hover:bg-red-50 text-red-500 transition-colors"
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

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl border p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
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
                  {imageUploading ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-xs">Uploading...</span>
                    </div>
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
                      setForm((f) => ({
                        ...f,
                        progress: Number(e.target.value),
                      }))
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
                      setForm((f) => ({
                        ...f,
                        deliveryValue: Number(e.target.value),
                      }))
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
                  <DatePicker
                    selected={form.startDate ? new Date(form.startDate) : null}
                    onChange={(date: Date | null) =>
                      setForm((f) => ({
                        ...f,
                        startDate: date ? date.toISOString() : "",
                      }))
                    }
                    showTimeInput
                    customTimeInput={<CustomTimeInput />}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    placeholderText="Select start date"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Deadline *</label>
                  <DatePicker
                    selected={form.deadline ? new Date(form.deadline) : null}
                    onChange={(date: Date | null) =>
                      setForm((f) => ({
                        ...f,
                        deadline: date ? date.toISOString() : "",
                      }))
                    }
                    showTimeInput
                    customTimeInput={<CustomTimeInput />}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    placeholderText="Select deadline"
                    required
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
                      setForm((f) => ({
                        ...f,
                        progress: Number(e.target.value),
                      }))
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
                      setForm((f) => ({
                        ...f,
                        deliveryValue: Number(e.target.value),
                      }))
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
                  <DatePicker
                    selected={form.startDate ? new Date(form.startDate) : null}
                    onChange={(date: Date | null) =>
                      setForm((f) => ({
                        ...f,
                        startDate: date ? date.toISOString() : "",
                      }))
                    }
                    showTimeInput
                    customTimeInput={<CustomTimeInput />}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    placeholderText="Select start date"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium">Deadline *</label>
                  <DatePicker
                    selected={form.deadline ? new Date(form.deadline) : null}
                    onChange={(date: Date | null) =>
                      setForm((f) => ({
                        ...f,
                        deadline: date ? date.toISOString() : "",
                      }))
                    }
                    showTimeInput
                    customTimeInput={<CustomTimeInput />}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    placeholderText="Select deadline"
                    required
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
