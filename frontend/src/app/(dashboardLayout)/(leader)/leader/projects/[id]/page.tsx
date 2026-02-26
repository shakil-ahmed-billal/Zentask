"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  deliveryValue: number;
  progress: number;
  startDate: string;
  deadline: string;
  telegramURL?: string;
  sheetURL?: string;
  websiteURL?: string;
  leader: { name: string; email: string };
  members: { user: { id: string; name: string; email: string } }[];
  tasks: {
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: string;
    member?: { name: string };
  }[];
};

export default function LeaderProjectDetailsPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = useCallback(async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.data);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!project) return;
    try {
      await api.patch(`/projects/${id}`, { status: newStatus });
      setProject({ ...project, status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Project not found.</p>
        <Link
          href="/leader/projects"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          Back to Projects
        </Link>
      </div>
    );
  }

  const daysRemaining = project.deadline
    ? Math.ceil((new Date(project.deadline).getTime() - Date.now()) / 86400000)
    : null;

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/leader/projects"
            className="hover:text-primary transition-colors"
          >
            Projects
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{project.title}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {project.title}
              </h1>
              <select
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border-none cursor-pointer outline-none ${statusColor(project.status)}`}
                value={project.status}
                onChange={(e) => handleStatusUpdate(e.target.value)}
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              {project.description || "No description provided."}
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/leader/projects`}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all shadow-sm"
            >
              Project List
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
            Progress
          </p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-2xl font-bold">{project.progress}%</p>
            <p className="text-[10px] text-muted-foreground">
              Overall Completion
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-in-out"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
            Deadline
          </p>
          <p className="text-2xl font-bold">
            {project.deadline
              ? new Date(project.deadline).toLocaleDateString()
              : "—"}
          </p>
          <p
            className={`text-[10px] mt-1 font-medium ${daysRemaining && daysRemaining < 0 ? "text-red-500" : "text-orange-500"}`}
          >
            {daysRemaining !== null
              ? daysRemaining < 0
                ? `⚠️ ${Math.abs(daysRemaining)} days overdue`
                : `⏱️ ${daysRemaining} days left`
              : "No deadline set"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
            Delivery Value
          </p>
          <p className="text-2xl font-bold text-emerald-600">
            ${project.deliveryValue.toLocaleString()}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Total Project Value
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
              Leadership
            </p>
            <p className="text-lg font-bold truncate">{project.leader.name}</p>
          </div>
          <div className="flex gap-2 mt-4">
            {project.telegramURL && (
              <a
                href={project.telegramURL}
                target="_blank"
                title="Telegram"
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
              >
                📞
              </a>
            )}
            {project.sheetURL && (
              <a
                href={project.sheetURL}
                target="_blank"
                title="Sheet"
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors text-emerald-600"
              >
                📊
              </a>
            )}
            {project.websiteURL && (
              <a
                href={project.websiteURL}
                target="_blank"
                title="Website"
                className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition-colors text-purple-600"
              >
                🌐
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Assigned Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Total: {project.tasks.length}
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Task Description
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Assignee
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Deadline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y border-t">
                {project.tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-muted-foreground italic"
                    >
                      No tasks created for this project yet.
                    </td>
                  </tr>
                ) : (
                  project.tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium">{task.title}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                            {task.member?.name?.[0] || "?"}
                          </div>
                          <span className="text-xs">
                            {task.member?.name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${taskStatusColor(task.status)}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs font-mono">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Information & Team */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border bg-card p-6 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span>Team Members</span>
              <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                {project.members.length}
              </span>
            </h2>
            <div className="flex flex-col gap-5">
              {project.members.map((m) => (
                <div
                  key={m.user.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                      {m.user.name[0]}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold leading-tight">
                        {m.user.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                        {m.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground/50 italic capitalize">
                    Member
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-background to-muted/20">
            <h2 className="text-lg font-semibold">Important Meta</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-dashed">
                <span className="text-xs text-muted-foreground">
                  Created Date
                </span>
                <span className="text-xs font-medium">
                  {(project as any).createdAt
                    ? new Date((project as any).createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-dashed">
                <span className="text-xs text-muted-foreground">
                  Start Date
                </span>
                <span className="text-xs font-medium">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Description Snippet
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground italic">
                  {project.description
                    ? project.description.substring(0, 150) +
                      (project.description.length > 150 ? "..." : "")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusColor(s: string) {
  const m: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
  };
  return m[s] ?? "bg-gray-50 text-gray-700 border-gray-200";
}

function taskStatusColor(s: string) {
  const m: Record<string, string> = {
    PENDING: "bg-gray-50 text-gray-500 border-gray-100",
    IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-100",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  return m[s] ?? "bg-gray-50 text-gray-500 border-gray-100";
}
