"use client";

import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get("/auth/get-session");
        setUser(res.data?.user ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwError(err?.message ?? "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings
        </p>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="rounded-xl border bg-card p-6 flex gap-4 items-center">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
            {user.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit mt-1">
              {user.role ?? "MEMBER"}
            </span>
          </div>
        </div>
      )}

      {/* Change Password Card */}
      <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold">Change Password</h2>
          <p className="text-sm text-muted-foreground">
            Update your password. You&apos;ll be signed out of other devices.
          </p>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="currentPassword"
              className="text-sm font-medium text-foreground"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="text-sm font-medium text-foreground"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              placeholder="Min. 8 characters"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              placeholder="Repeat new password"
            />
          </div>
          {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          <button
            type="submit"
            disabled={changingPassword}
            className={cn(
              "inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              changingPassword && "opacity-70",
            )}
          >
            {changingPassword ? "Saving..." : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
