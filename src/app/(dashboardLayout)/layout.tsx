"use client";

import AppSidebar from "@/components/shared/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, ChevronRight, Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const token = useAppSelector((state) => state.auth.token);
  const decodedToken = useDecodedToken(token);
  const isPatientRoute = pathname.startsWith("/patient");
  const role = isPatientRoute ? "PATIENT" : decodedToken?.role || "ADMIN";

  return (
    <SidebarProvider>
      {/* Pass the user role dynamically to AppSidebar */}
      <AppSidebar role={role} />
      <SidebarInset className="bg-[#f8fafc]">
        {/* Modern Top Header */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gray-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-sm transition-all">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1 text-gray-600 hover:text-gray-900 rounded-xs" />
            <div className="h-4 w-[1px] bg-gray-200" />
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Link
                href="/admin/dashboard"
                className="hover:text-gray-900 flex items-center gap-1"
              >
                <Home size={13} />
                <span>Dashboard</span>
              </Link>
              <ChevronRight size={12} className="text-gray-400" />
              <span className="text-gray-900 font-semibold">Overview</span>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Quick Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100/80 hover:bg-gray-100 rounded-xs border border-gray-200 text-xs text-gray-500 cursor-pointer transition-colors">
              <Search size={14} className="text-gray-400" />
              <span>Search platform...</span>
              <kbd className="ml-2 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-500">
                ⌘K
              </kbd>
            </div>

            {/* Notification Bell */}
            <button
              title="Notifications"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xs transition-colors cursor-pointer"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

