"use client";

import AppSidebar from "@/components/shared/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";
import { Bell, ChevronRight, Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Overview",
  "/admin/dashboard/verification-queue": "Verification queue",
  "/admin/dashboard/user-list": "Users",
  "/user": "My dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAppSelector((state) => state.auth.token);
  const decodedToken = useDecodedToken(token);
  const role = decodedToken?.role || "ADMIN";
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const firstName =
    typeof decodedToken?.firstName === "string"
      ? decodedToken.firstName
      : "DermaCare Admin";

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <SidebarInset className="min-w-0 bg-[#F5F8FA]">
        <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <SidebarTrigger className="-ml-1 rounded-lg text-slate-500 hover:bg-[#E8F5F4] hover:text-[#0F888D]" />
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <nav className="flex min-w-0 items-center gap-2 text-sm">
              <Link
                href={role.toLowerCase() === "admin" ? "/admin/dashboard" : "/user"}
                className="hidden items-center gap-2 text-slate-500 transition-colors hover:text-[#0F888D] sm:inline-flex"
              >
                <Home size={15} />
                <span>Workspace</span>
              </Link>
              <ChevronRight
                size={14}
                className="hidden text-slate-300 sm:block"
              />
              <span className="truncate font-semibold text-[#163A5F]">
                {title}
              </span>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <label className="hidden h-10 w-56 items-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFB] px-3 text-slate-400 transition-colors focus-within:border-[#0F888D] lg:flex">
              <Search size={16} />
              <input
                type="search"
                aria-label="Search dashboard"
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
                /
              </kbd>
            </label>
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid size-10 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-[#E8F5F4] hover:text-[#0F888D]"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-[#0F888D] ring-2 ring-white" />
            </button>
            <div className="hidden h-9 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-[#E8F5F4] text-xs font-bold text-[#0F777E]">
                {firstName[0].toUpperCase()}
              </div>
              <div className="hidden leading-tight sm:block">
                <p className="max-w-32 truncate text-xs font-semibold text-[#163A5F]">
                  {firstName}
                </p>
                <p className="mt-1 text-[10px] capitalize text-slate-400">
                  {role.toLowerCase()}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
