"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/themes/ModeToggle";
import { ChevronRight } from "lucide-react";

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
  const { title, trail } = getBreadcrumb(pathname);

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
                    <BreadcrumbItem key={href} className="hidden md:flex items-center gap-1">
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
            <ModeToggle />
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