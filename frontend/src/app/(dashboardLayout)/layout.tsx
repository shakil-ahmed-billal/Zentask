"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { ModeToggle } from "@/themes/ModeToggle";
import { Bell, ChevronRight, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function getBreadcrumb(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { title: "Dashboard", trail: [] as string[] };
  }
  const title = segments[segments.length - 1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const trail = segments.slice(0, -1);
  return { title, trail };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { title, trail } = getBreadcrumb(pathname);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    image?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await api.get("/auth/get-session");
        if (!res.data.user) {
          router.push("/auth/login");
        } else {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Session check failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/sign-out");
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
      router.push("/auth/login");
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (loading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="overflow-hidden">
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md">
          {/* Left: trigger + breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <SidebarTrigger className="-ml-1 size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors" />

            <Separator
              orientation="vertical"
              className="mr-1 h-4 data-[orientation=vertical]:h-4 bg-border/70"
            />

            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap">
                {/* Home crumb */}
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/dashboard"
                      className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Trail crumbs */}
                {trail.map((segment, index) => {
                  const href = "/" + trail.slice(0, index + 1).join("/");
                  const label = segment
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <BreadcrumbItem
                      key={href}
                      className="hidden md:flex items-center gap-1"
                    >
                      <ChevronRight className="size-3 text-muted-foreground/50" />
                      <BreadcrumbLink asChild>
                        <Link
                          href={href}
                          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  );
                })}

                {/* Current page */}
                <BreadcrumbItem className="flex items-center gap-1">
                  <ChevronRight className="size-3 text-muted-foreground/50 hidden md:block" />
                  <BreadcrumbPage className="text-xs font-semibold text-foreground">
                    {title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <Bell className="size-4" />
            </Button>

            <ModeToggle />

            <Separator
              orientation="vertical"
              className="mx-1.5 h-4 bg-border/70"
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-muted/60 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="rounded-lg bg-primary/20 text-[11px] font-bold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col text-left leading-tight">
                    <span className="text-[12px] font-semibold text-foreground max-w-[96px] truncate">
                      {user?.name || "User"}
                    </span>
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 rounded-xl p-1.5 shadow-2xl"
                side="bottom"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="px-2 py-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage src={user?.image} />
                      <AvatarFallback className="rounded-lg bg-primary/20 text-sm font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {user?.email || ""}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="opacity-50 my-1" />

                <DropdownMenuItem
                  asChild
                  className="rounded-lg px-2 py-2 text-sm cursor-pointer gap-2.5"
                >
                  <Link href="/profile">
                    <User className="size-4 text-muted-foreground shrink-0" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  asChild
                  className="rounded-lg px-2 py-2 text-sm cursor-pointer gap-2.5"
                >
                  <Link href="/profile">
                    <Settings className="size-4 text-muted-foreground shrink-0" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="opacity-50 my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg px-2 py-2 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer gap-2.5"
                >
                  <LogOut className="size-4 shrink-0" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 min-h-0 overflow-auto p-5 bg-muted/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
