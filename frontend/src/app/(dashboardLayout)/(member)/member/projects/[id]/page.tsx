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

export default function MemberProjectDetailsPage() {
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
          href="/member/projects"
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
          <Link href="/member/projects" className="hover:text-primary">
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
            {project.telegramURL && (
              <a
                href={project.telegramURL}
                target="_blank"
                className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span>Telegram</span>
              </a>
            )}
            {project.sheetURL && (
              <a
                href={project.sheetURL}
                target="_blank"
                className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2 text-emerald-600 border-emerald-100 bg-emerald-50/50"
              >
                <span>Sheet</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
            Progress
          </p>
          <div className="flex items-end justify-between mb-2">
            <p className="text-2xl font-bold">{project.progress}%</p>
            <p className="text-[10px] text-muted-foreground">Overall</p>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
            Deadline
          </p>
          <p className="text-2xl font-bold">
            {project.deadline
              ? new Date(project.deadline).toLocaleDateString()
              : "—"}
          </p>
          <p
            className={`text-[10px] mt-1 font-medium ${daysRemaining && daysRemaining < 0 ? "text-red-500" : "text-muted-foreground"}`}
          >
            {daysRemaining !== null
              ? daysRemaining < 0
                ? `${Math.abs(daysRemaining)} days overdue`
                : `${daysRemaining} days left`
              : "No deadline set"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">
            Leader
          </p>
          <p className="text-xl font-bold">{project.leader.name}</p>
          <p className="text-[10px] text-muted-foreground truncate">
            {project.leader.email}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
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
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <span className="text-xs text-muted-foreground">
              {project.tasks.length} total tasks
            </span>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Task</th>
                  <th className="px-4 py-3 text-left font-medium">Assignee</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {project.tasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No tasks assigned yet.
                    </td>
                  </tr>
                ) : (
                  project.tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-4 font-medium">{task.title}</td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {task.member?.name || "Unassigned"}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${taskStatusColor(task.status)}`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">
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
          <div className="rounded-xl border bg-card p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Project Details</h2>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                  Created At
                </p>
                <p className="text-sm">
                  {(project as any).createdAt
                    ? new Date((project as any).createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                  Start Date
                </p>
                <p className="text-sm">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground font-bold mb-1">
                  Website
                </p>
                {project.websiteURL ? (
                  <a
                    href={project.websiteURL}
                    target="_blank"
                    className="text-sm text-primary hover:underline truncate block"
                  >
                    {project.websiteURL}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground italic text-xs">
                    Not set
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <div className="flex flex-col gap-4">
              {project.members.map((m) => (
                <div key={m.user.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                    {m.user.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium leading-none">
                      {m.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-[150px]">
                      {m.user.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function statusColor(s: string) {
  const m: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return m[s] ?? "bg-gray-100 text-gray-700";
}

function taskStatusColor(s: string) {
  const m: Record<string, string> = {
    PENDING: "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-blue-100 text-blue-600",
    COMPLETED: "bg-emerald-100 text-emerald-600",
  };
  return m[s] ?? "bg-gray-100 text-gray-600";
}
