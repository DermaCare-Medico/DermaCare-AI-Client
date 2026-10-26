/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown, LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import placeholder from "@/src/assets/placeholders/image_placeholder.png";
import { useGetMeQuery, useLogoutMutation } from "@/redux/api/authApi";
import { logout } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { isDemoAuthEnabled } from "@/src/utils/demoAuth";
import { dashboardForRole, profileForRole } from "@/src/utils/auth";
import { readIdentity } from "@/lib/doctor/identity";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";
import type { VerificationStatus } from "@/types/doctor";

export interface NavUserProps {
  variant?: "sidebar" | "navbar";
  onNavigate?: () => void;
  className?: string;
}

function useNavUserData(onNavigate?: () => void) {
  const token = useAppSelector((state) => state.auth.token);
  const authUser = useAppSelector((state) => state.auth.user);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const demoMode = isDemoAuthEnabled();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const decoded = useDecodedToken(token);

  const { data, isLoading } = useGetMeQuery(undefined, {
    skip: !token || demoMode,
  }) as any;

  const [endSession, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await endSession({ refreshToken }).unwrap();
      }
    } catch {
      // Continue client logout even if backend token invalidation encounters an error
    } finally {
      dispatch(logout());
      onNavigate?.();
      router.replace("/login?redirect=" + encodeURIComponent(pathname));
    }
  };

  const rawApiUser =
    data && typeof data === "object" && "data" in data && data.data
      ? data.data
      : data;
  const identity = readIdentity(data);

  const role = (
    identity.role ||
    (typeof authUser?.role === "string" ? authUser.role : undefined) ||
    (typeof decoded?.role === "string" ? decoded.role : undefined) ||
    ""
  ).toUpperCase();

  const doctorStatus =
    identity.status ||
    (authUser?.doctorVerificationStatus as VerificationStatus | undefined) ||
    (authUser?.verificationStatus as VerificationStatus | undefined) ||
    (authUser?.status as VerificationStatus | undefined);

  const isDoctorApplicant = role === "DOCTOR" || Boolean(authUser?.isDoctorApplicant);

  const dashboardUrl = dashboardForRole(role, isDoctorApplicant, doctorStatus);
  const profileUrl = profileForRole(role);

  const displayName =
    identity.name ||
    (typeof authUser?.name === "string" ? authUser.name : "") ||
    [
      (rawApiUser as any)?.firstName || (authUser as any)?.firstName,
      (rawApiUser as any)?.lastName || (authUser as any)?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "User";

  const displayEmail =
    identity.email ||
    (typeof authUser?.email === "string" ? authUser.email : "") ||
    "";

  const avatarUrl =
    (rawApiUser as any)?.image ||
    (rawApiUser as any)?.avatar ||
    (rawApiUser as any)?.profileImage ||
    (authUser as any)?.image ||
    (authUser as any)?.avatar ||
    placeholder.src;

  return {
    displayName,
    displayEmail,
    role,
    avatarUrl,
    dashboardUrl,
    profileUrl,
    handleLogout,
    isLoggingOut,
    isLoading: isLoading && !authUser,
  };
}

function SidebarNavUser({ onNavigate }: { onNavigate?: () => void }) {
  const { isMobile } = useSidebar();
  const {
    displayName,
    displayEmail,
    role,
    avatarUrl,
    dashboardUrl,
    profileUrl,
    handleLogout,
    isLoggingOut,
    isLoading,
  } = useNavUserData(onNavigate);

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">...</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={avatarUrl}
                  alt={displayName}
                  className="h-8 w-8 object-cover rounded-lg"
                />
                <AvatarFallback className="rounded-lg">
                  <Image
                    src={placeholder}
                    alt={displayName}
                    width={60}
                    height={60}
                    className="h-8 w-8 object-cover rounded-lg"
                  />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{displayName}</span>
                <span className="truncate text-xs">{displayEmail || "No email"}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={avatarUrl}
                    alt={displayName}
                    className="h-8 w-8 object-cover rounded-lg"
                  />
                  <AvatarFallback className="rounded-lg">
                    <Image
                      src={placeholder}
                      alt={displayName}
                      width={60}
                      height={60}
                      className="h-8 w-8 object-cover rounded-lg"
                    />
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-slate-500">{displayEmail || "No email"}</span>
                  {role && (
                    <span className="mt-0.5 inline-block w-fit rounded bg-teal-50 px-1.5 py-0.2 text-[10px] font-semibold tracking-wider text-teal-700 border border-teal-200">
                      {role}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={dashboardUrl}
                onClick={() => onNavigate?.()}
                className="flex items-center gap-2 cursor-pointer w-full text-slate-700"
              >
                <LayoutDashboard className="size-4 text-teal-600" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={profileUrl}
                onClick={() => onNavigate?.()}
                className="flex items-center gap-2 cursor-pointer w-full text-slate-700"
              >
                <UserIcon className="size-4 text-teal-600" />
                <span>My Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="text-rose-600 focus:text-rose-600 cursor-pointer"
            >
              <LogOut className="size-4 mr-2" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NavbarNavUser({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const {
    displayName,
    displayEmail,
    role,
    avatarUrl,
    dashboardUrl,
    profileUrl,
    handleLogout,
    isLoggingOut,
    isLoading,
  } = useNavUserData(onNavigate);

  if (isLoading) {
    return (
      <div className="size-10 rounded-full bg-slate-100 animate-pulse border border-slate-200" />
    );
  }

  const initial = (displayName.charAt(0) || "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`relative inline-flex size-10 shrink-0 select-none items-center justify-center rounded-full border border-slate-200/90 bg-white p-0 shadow-sm transition-all duration-200 hover:border-teal-500 hover:shadow-md hover:ring-2 hover:ring-teal-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 ${className ?? ""}`}
          aria-label="User account menu"
        >
          <Avatar className="size-10 rounded-full">
            <AvatarImage
              src={avatarUrl}
              alt={displayName}
              className="size-10 rounded-full object-cover"
            />
            <AvatarFallback className="size-10 rounded-full bg-teal-50 text-xs font-bold text-teal-800">
              {initial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-60 rounded-xl p-1 shadow-lg border border-slate-200 bg-white"
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-2.5 font-normal">
          <div className="flex items-center gap-3 text-left">
            <Avatar className="size-9 rounded-full border border-slate-200/80 shrink-0">
              <AvatarImage
                src={avatarUrl}
                alt={displayName}
                className="size-9 rounded-full object-cover"
              />
              <AvatarFallback className="rounded-full bg-teal-50 text-xs font-bold text-teal-800">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
              <span className="truncate font-semibold text-slate-900 text-sm">
                {displayName}
              </span>
              <span className="truncate text-slate-500 mt-0.5">
                {displayEmail || "No email"}
              </span>
              {role && (
                <span className="mt-1.5 inline-block w-fit rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-teal-700 border border-teal-200 uppercase">
                  {role}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={dashboardUrl}
            onClick={() => onNavigate?.()}
            className="flex cursor-pointer items-center gap-2.5 py-2 px-2.5 text-slate-700 hover:text-teal-700 hover:bg-teal-50/70 focus:text-teal-700 focus:bg-teal-50/70 w-full rounded-lg transition-colors"
          >
            <LayoutDashboard className="size-4 text-teal-600 shrink-0" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={profileUrl}
            onClick={() => onNavigate?.()}
            className="flex cursor-pointer items-center gap-2.5 py-2 px-2.5 text-slate-700 hover:text-teal-700 hover:bg-teal-50/70 focus:text-teal-700 focus:bg-teal-50/70 w-full rounded-lg transition-colors"
          >
            <UserIcon className="size-4 text-teal-600 shrink-0" />
            <span className="font-medium text-sm">My Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2.5 py-2 px-2.5 text-rose-600 hover:bg-rose-50/70 focus:bg-rose-50/70 focus:text-rose-700 font-medium text-sm rounded-lg transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NavUser({
  variant = "sidebar",
  onNavigate,
  className,
}: NavUserProps) {
  if (variant === "navbar") {
    return <NavbarNavUser onNavigate={onNavigate} className={className} />;
  }
  return <SidebarNavUser onNavigate={onNavigate} />;
}
