"use client";

import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      try {
        const res = await api.get("/auth/get-session");
        const role = res.data?.user?.role;
        if (role === "LEADER") {
          router.replace("/leader/dashboard");
        } else {
          router.replace("/member/dashboard");
        }
      } catch {
        router.replace("/member/dashboard");
      }
    };
    redirect();
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
