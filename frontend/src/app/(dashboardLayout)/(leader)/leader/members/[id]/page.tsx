"use client";

import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Member = {
  id: string;
  name: string;
  email: string;
  department?: string;
  isVerified: boolean;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
  status: string;
  budget: number;
  deadline: string;
  tasks: { id: string; status: string }[];
};

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [member, setMember] = useState<Member | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [memberRes, projectsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/projects?memberId=${id}`),
        ]);
        setMember(memberRes.data.data);
        setProjects(projectsRes.data.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleVerify = async () => {
    await api.post(`/users/verify/${id}`);
    setMember((prev) => (prev ? { ...prev, isVerified: true } : null));
  };

  const handleStatusChange = async () => {
    const newStatus = member?.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await api.post(`/users/suspend/${id}`, { status: newStatus });
    setMember((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading member profile...
      </div>
    );
  if (!member)
    return (
      <div className="p-8 text-center text-destructive">Member not found.</div>
    );

  const totalTasks = projects.reduce((s, p) => s + (p.tasks?.length || 0), 0);
  const completedTasks = projects.reduce(
    (s, p) =>
      s + (p.tasks?.filter((t) => t.status === "COMPLETED").length || 0),
    0,
  );
  const avgProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const completedProjects = projects.filter(
    (p) => p.status === "COMPLETED",
  ).length;
  const totalValue = projects.reduce((s, p) => s + (p.budget || 0), 0);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="self-start text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        ← Back to Members
      </button>

      {/* Profile Header */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold flex items-center justify-center">
              {member.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{member.name}</h1>
                {member.isVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <p className="text-sm text-muted-foreground">
                {member.department || "No Department"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined{" "}
                {new Date(member.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {!member.isVerified && (
              <button
                onClick={handleVerify}
                className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Verify Account
              </button>
            )}
            <button
              onClick={handleStatusChange}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${member.status === "ACTIVE" ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200" : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"}`}
            >
              {member.status === "ACTIVE"
                ? "Suspend Account"
                : "Activate Account"}
            </button>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <PerfCard label="Total Projects" value={projects.length} />
        <PerfCard
          label="Completed"
          value={completedProjects}
          color="text-emerald-600"
        />
        <PerfCard label="Avg Progress" value={`${avgProgress}%`} />
        <PerfCard
          label="Total Value"
          value={`$${totalValue.toLocaleString()}`}
        />
        <PerfCard
          label="Completion Rate"
          value={
            projects.length > 0
              ? `${Math.round((completedProjects / projects.length) * 100)}%`
              : "0%"
          }
        />
        <PerfCard
          label="Status"
          value={member.status}
          color={member.status === "ACTIVE" ? "text-blue-600" : "text-red-500"}
        />
      </div>

      {/* Project List */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Assigned Projects</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Project Name</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">Progress</th>
              <th className="px-4 py-3 text-right">Budget</th>
              <th className="px-4 py-3 text-left">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-muted-foreground"
                >
                  No projects assigned.
                </td>
              </tr>
            ) : (
              projects.map((p) => {
                const total = p.tasks?.length || 0;
                const done =
                  p.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs w-8">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${p.budget?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p.deadline
                        ? new Date(p.deadline).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PerfCard({
  label,
  value,
  color = "text-foreground",
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
