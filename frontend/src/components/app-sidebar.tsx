"use client";

import { api } from "@/lib/api";
import {
  BarChart3,
  CheckSquare,
  FolderKanban,
  GalleryVerticalEnd,
  LayoutDashboard,
  PlusSquare,
  Settings2,
  Users,
} from "lucide-react";
import * as React from "react";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const LEADER_NAV = [
  {
    title: "Leader Panel",
    items: [
      { title: "Dashboard", url: "/leader/dashboard", icon: LayoutDashboard },
      { title: "Projects", url: "/leader/projects", icon: FolderKanban },
      { title: "Members", url: "/leader/members", icon: Users },
      { title: "Reports", url: "/leader/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Account",
    items: [{ title: "Settings", url: "/settings", icon: Settings2 }],
  },
];

const MEMBER_NAV = [
  {
    title: "Member Panel",
    items: [
      { title: "Dashboard", url: "/member/dashboard", icon: LayoutDashboard },
      { title: "My Projects", url: "/member/projects", icon: FolderKanban },
      { title: "My Tasks", url: "/member/tasks", icon: CheckSquare },
      { title: "Create Task", url: "/member/tasks/create", icon: PlusSquare },
    ],
  },
  {
    title: "Account",
    items: [{ title: "Settings", url: "/settings", icon: Settings2 }],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [role, setRole] = React.useState<string | null>(null);
  const [user, setUser] = React.useState({
    name: "User",
    email: "",
    avatar: "",
  });
  const pathname = usePathname();

  React.useEffect(() => {
    async function getSession() {
      try {
        const res = await api.get("/auth/get-session");
        const u = res.data?.user;
        if (u) {
          setRole(u.role || "MEMBER");
          setUser({
            name: u.name || "User",
            email: u.email || "",
            avatar: u.image || "",
          });
        }
      } catch {
        setRole("MEMBER");
      }
    }
    getSession();
  }, []);

  const navGroups = role === "LEADER" ? LEADER_NAV : MEMBER_NAV;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a
                href={
                  role === "LEADER" ? "/leader/dashboard" : "/member/dashboard"
                }
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">WorkSphere</span>
                  <span className="truncate text-xs capitalize">
                    {role?.toLowerCase() ?? "loading..."} panel
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
