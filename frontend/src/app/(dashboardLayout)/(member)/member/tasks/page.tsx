"use client";

import { api } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline?: string;
  project?: { id: string; name: string };
};

type TaskStats = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
};

export default function MemberTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;
      const [taskRes, statsRes] = await Promise.all([
        api.get("/tasks/my-tasks", { params }),
        api.get("/tasks/stats"),
      ]);
      setTasks(taskRes.data.data ?? []);
      setStats(statsRes.data.data ?? null);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdateStatus = async (id: string) => {
    await api.patch(`/tasks/${id}`, { status: editStatus });
    setEditingId(null);
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track all your tasks
          </p>
        </div>
        <a
          href="/member/tasks/create"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          + New Task
        </a>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          <StatCard label="Total Tasks" value={stats.total} />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="text-yellow-600"
          />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="text-blue-600"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color="text-emerald-600"
          />
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px] flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm"
            placeholder="Task title..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Priority
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
            setPriorityFilter("");
          }}
          className="h-9 px-4 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Task Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Project</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-left">Deadline</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Loading tasks...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No tasks found. Create your first task!
                  </td>
                </tr>
              ) : (
                tasks.map((t) => {
                  const days = t.deadline
                    ? Math.ceil(
                        (new Date(t.deadline).getTime() - Date.now()) /
                          86400000,
                      )
                    : null;
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{t.title}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {t.project?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {editingId === t.id ? (
                          <div className="flex gap-1 justify-center">
                            <select
                              className="h-7 rounded border text-xs px-1 bg-background"
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                            >
                              <option value="PENDING">Pending</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                            <button
                              onClick={() => handleUpdateStatus(t.id)}
                              className="text-xs text-emerald-600 hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <StatusBadge
                            status={t.status}
                            onClick={() => {
                              setEditingId(t.id);
                              setEditStatus(t.status);
                            }}
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {t.deadline ? (
                          <div>
                            <div>
                              {new Date(t.deadline).toLocaleDateString()}
                            </div>
                            {days !== null && (
                              <div
                                className={`text-[10px] ${days < 0 ? "text-red-500" : "text-muted-foreground"}`}
                              >
                                {days < 0
                                  ? `${Math.abs(days)}d overdue`
                                  : `${days}d left`}
                              </div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Delete
                        </button>
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

function StatCard({
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

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-600",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[priority] ?? "bg-gray-100"}`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({
  status,
  onClick,
}: {
  status: string;
  onClick?: () => void;
}) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      onClick={onClick}
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer hover:opacity-80 ${map[status] ?? "bg-gray-100"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
