"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Project = { id: string; title: string };

const TIPS = [
  "💡 Use action-based titles like 'Design login form' instead of 'Login'",
  "📝 Break tasks into smaller steps for better progress tracking",
  "⏰ Set realistic deadlines — buffer time reduces stress",
  "📈 Update your task status regularly to keep the team informed",
  "🎯 Link every task to a project to keep work organized",
];

export default function CreateTaskPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectId: "",
    status: "PENDING",
    priority: "MEDIUM",
    deadline: "",
  });

  useEffect(() => {
    api
      .get("/projects/my-projects")
      .then((res) => setProjects(res.data.data ?? []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/tasks/create-task", form);
      router.push("/member/tasks");
    } catch (err) {
      console.error(err);
      alert("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
        <p className="text-muted-foreground text-sm">
          Add a new task to your project
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                required
                className="h-9 rounded-md border bg-background px-3 text-sm"
                placeholder="e.g. Design the login page"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <textarea
                className="rounded-md border bg-background px-3 py-2 text-sm h-24 resize-none"
                placeholder="Add task details..."
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Select Project</label>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm text-gray-900 dark:text-gray-100 w-full focus:ring-2 focus:ring-primary outline-none transition-all"
                value={form.projectId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, projectId: e.target.value }))
                }
              >
                <option value="" className="text-gray-900">
                  No Project (Personal Task)
                </option>
                {projects.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    className="text-gray-900 bg-white"
                  >
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
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
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Priority</label>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priority: e.target.value }))
                  }
                >
                  <option value="LOW">🟢 Low</option>
                  <option value="MEDIUM">🟡 Medium</option>
                  <option value="HIGH">🔴 High</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Deadline{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <input
                type="date"
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={form.deadline}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deadline: e.target.value }))
                }
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>

        {/* Productivity Tips */}
        <div className="rounded-xl border bg-card p-5 shadow-sm h-fit">
          <h2 className="font-semibold mb-4">💡 Productivity Tips</h2>
          <div className="flex flex-col gap-3">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className="text-sm text-muted-foreground leading-relaxed"
              >
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
