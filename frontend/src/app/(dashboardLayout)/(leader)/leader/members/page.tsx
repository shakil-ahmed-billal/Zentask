"use client";

import { api } from "@/lib/api";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Member = {
  id: string;
  name: string;
  email: string;
  department?: string;
  isVerified: boolean;
  status: "ACTIVE" | "SUSPENDED";
  _count: { projects: number; tasks: number };
};

type MemberStats = {
  total: number;
  verified: number;
  unverified: number;
  active: number;
  inactive: number;
};

export default function LeaderMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { role: "MEMBER" };
      if (search) params.searchTerm = search;
      if (verifiedFilter !== "") params.isVerified = verifiedFilter;
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;

      const res = await api.get("/users", { params });
      const data: Member[] = res.data.data ?? [];
      setMembers(data);

      // Compute stats
      const verified = data.filter((m) => m.isVerified).length;
      const active = data.filter((m) => m.status === "ACTIVE").length;
      setStats({
        total: data.length,
        verified,
        unverified: data.length - verified,
        active,
        inactive: data.length - active,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, verifiedFilter, statusFilter, departmentFilter]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleVerify = async (id: string) => {
    await api.post(`/users/verify/${id}`);
    fetchMembers();
  };

  const handleStatusChange = async (id: string, current: string) => {
    const newStatus = current === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await api.post(`/users/suspend/${id}`, { status: newStatus });
    fetchMembers();
  };

  const departments = [
    ...new Set(members.map((m) => m.department).filter(Boolean)),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Members</h1>
        <p className="text-muted-foreground text-sm">
          Manage team members, verification and access
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total Members" value={stats.total} />
          <StatCard
            label="Verified"
            value={stats.verified}
            color="text-emerald-600"
          />
          <StatCard
            label="Unverified"
            value={stats.unverified}
            color="text-yellow-600"
          />
          <StatCard label="Active" value={stats.active} color="text-blue-600" />
          <StatCard
            label="Inactive"
            value={stats.inactive}
            color="text-red-500"
          />
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px] flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <input
            className="h-9 rounded-md border bg-background px-3 text-sm"
            placeholder="Name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Verification
          </label>
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm"
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
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
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
        {departments.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Department
            </label>
            <select
              className="h-9 rounded-md border bg-background px-3 text-sm"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d!} value={d!}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => {
            setSearch("");
            setVerifiedFilter("");
            setStatusFilter("");
            setDepartmentFilter("");
          }}
          className="h-9 px-4 rounded-md border text-sm hover:bg-muted transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-center">Projects</th>
                <th className="px-4 py-3 text-center">Tasks</th>
                <th className="px-4 py-3 text-left">Status</th>
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
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {m.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {m.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {m._count.projects}
                    </td>
                    <td className="px-4 py-3 text-center">{m._count.tasks}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {m.isVerified ? "Verified" : "Unverified"}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.status === "ACTIVE" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                        >
                          {m.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <Link
                          href={`/leader/members/${m.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          Profile
                        </Link>
                        {!m.isVerified && (
                          <button
                            onClick={() => handleVerify(m.id)}
                            className="text-xs text-emerald-600 hover:underline"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(m.id, m.status)}
                          className={`text-xs hover:underline ${m.status === "ACTIVE" ? "text-red-500" : "text-blue-500"}`}
                        >
                          {m.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
  color = "text-foreground",
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
