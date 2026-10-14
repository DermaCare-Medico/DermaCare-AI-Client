"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/shared/nav-main";
import { NavUser } from "@/components/shared/nav-user";
import {
  ArrowLeft,
  ClipboardCheck,
  Home,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";

const userNavigation = [
  { title: "Dashboard", url: "/user", icon: LayoutDashboard },
  { title: "Go back to home", url: "/", icon: Home },
];

const adminNavigation = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  {
    title: "Verification queue",
    url: "/admin/dashboard/verification-queue",
    icon: ClipboardCheck,
  },
  { title: "Users", url: "/admin/dashboard/user-list", icon: Users },
];

export default function AppSidebar({ role }: { role: string }) {
  const isAdmin = role.toLowerCase() === "admin";
  const navigation = isAdmin ? adminNavigation : userNavigation;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 bg-white [&_[data-slot=sidebar-inner]]:bg-white"
    >
      <SidebarHeader className="px-4 pt-5">
        <Link href="/" className="flex items-center gap-3 px-1 py-2">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0F888D] text-sm font-bold text-white">
            D
          </span>
          <span className="truncate text-lg font-bold tracking-tight text-[#163A5F] group-data-[collapsible=icon]:hidden">
            DermaCare <span className="text-[#0F888D]">AI</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 pt-7">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 group-data-[collapsible=icon]:hidden">
          Workspace
        </p>
        <NavMain items={navigation} />
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-100 p-3">
        <NavUser />
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#0F888D] group-data-[collapsible=icon]:justify-center"
        >
          <ArrowLeft size={16} />
          <span className="group-data-[collapsible=icon]:hidden">
            Back to website
          </span>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
