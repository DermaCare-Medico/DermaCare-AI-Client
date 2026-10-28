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
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Home,
  LayoutDashboard,
  Pill,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Settings,
  Calendar,
  CheckCircle,
  BellRing,
  BadgeDollarSign,
  Landmark,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import brandLogo from "@/src/favicon.ico";
import { useGetMeQuery } from "@/redux/api/authApi";
import { useGetOwnDoctorProfileQuery } from "@/redux/api/doctorApi";
import { useAppSelector } from "@/redux/hooks";
import { readIdentity } from "@/lib/doctor/identity";

const data = {
  user: {
    navMain: [
      {
        title: "Dashboard",
        url: "/user",
        icon: LayoutDashboard,
      },
      {
        title: "Your Profile",
        url: "/user/dashboard/profile",
        icon: User,
      },
      {
        title: "Go Back To Home",
        url: "/",
        icon: Home,
      },
    ],
  },

  admin: {
    navMain: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Verification queue",
        url: "/admin/dashboard/verification-queue",
        icon: ClipboardCheck,
      },
      {
        title: " All Users",
        url: "/admin/dashboard/user-list",
        icon: Users,
      },
      {
        title: "Doctors",
        url: "/admin/dashboard/doctors",
        icon: Stethoscope,
      },
      {
        title: "Appointments",
        url: "/admin/dashboard/appointments",
        icon: CalendarClock,
      },
      {
        title: "Orders",
        url: "/admin/dashboard/orders",
        icon: ShoppingBag,
      },
      {
        title: "Medicines",
        url: "/admin/dashboard/medicines",
        icon: Pill,
      },
      {
        title: "Doctor Payments",
        url: "/admin/dashboard/doctor-payments",
        icon: BadgeDollarSign,
      },
      {
        title: "Audit Logs",
        url: "/admin/dashboard/audit-logs",
        icon: ClipboardList,
      },
      {
        title: "Your Profile",
        url: "/admin/dashboard/profile",
        icon: User,
      },
      {
        title: "Go Back To Home",
        url: "/",
        icon: Home,
      },
    ],
  },

  patient: {
    navMain: [
      {
        title: "Dashboard",
        url: "/patient/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "New Screening",
        url: "/patient/screening/new",
        icon: Sparkles,
      },
      {
        title: "Screening History",
        url: "/patient/screening/history",
        icon: ClipboardList,
      },
      {
        title: "Find Doctors",
        url: "/doctors",
        icon: Stethoscope,
      },
      {
        title: "Appointments",
        url: "/patient/appointments",
        icon: CalendarClock,
      },
      {
        title: "Prescriptions",
        url: "/patient/prescriptions",
        icon: Pill,
      },
      {
        title: "Pharmacy Orders",
        url: "/patient/orders",
        icon: ShoppingBag,
      },
      {
        title: "Notifications",
        url: "/patient/notifications",
        icon: BellRing,
      },
      {
        title: "Profile",
        url: "/patient/profile",
        icon: User,
      },
      {
        title: "Go Back To Home",
        url: "/",
        icon: Home,
      },
    ],
  },

  doctor: {
    navMain: [
      {
        title: "Dashboard",
        url: "/doctor",
        icon: LayoutDashboard,
      },
      {
        title: "Appointments",
        url: "/doctor/appointments",
        icon: CalendarClock,
      },
      {
        title: "Availability",
        url: "/doctor/availability",
        icon: Calendar,
      },
      {
        title: "Profile & License",
        url: "/doctor/profile",
        icon: Settings,
      },
      {
        title: "Application",
        url: "/doctor/application",
        icon: ClipboardCheck,
      },
      {
        title: "Earnings",
        url: "/doctor/earnings",
        icon: BadgeDollarSign,
      },
      {
        title: "Payouts",
        url: "/doctor/payouts",
        icon: Landmark,
      },
      {
        title: "Pending Approval",
        url: "/doctor/pending-approval",
        icon: CheckCircle,
      },
      {
        title: "Go Back To Home",
        url: "/",
        icon: Home,
      },
    ],
  },
};

export default function AppSidebar({
  role,
}: {
  role: string;
}) {
  const token = useAppSelector((state) => state.auth.token);
  const authUser = useAppSelector((state) => state.auth.user);
  const identityQuery = useGetMeQuery(undefined, { skip: !token });
  const profileQuery = useGetOwnDoctorProfileQuery(undefined, { skip: !token });
  const identity = readIdentity(identityQuery.data);
  const profile = readIdentity(profileQuery.data);
  const effectiveRole = (identity.role ?? role).toLowerCase();
  const approvalStatus = profile.status;
  const approvalLoading = Boolean(token) && profileQuery.isLoading;
  const isDoctorApplicant =
    effectiveRole === "doctor" ||
    Boolean(authUser?.isDoctorApplicant) ||
    Boolean(approvalStatus);

  const doctorNavigation = data.doctor.navMain.filter((item) => {
    if (approvalLoading) return item.url === "/";
    if (approvalStatus === "APPROVED") {
      return !["/doctor/application", "/doctor/pending-approval"].includes(item.url);
    }
    if (approvalStatus === "PENDING_REVIEW") {
      return ["/doctor/profile", "/doctor/pending-approval", "/"].includes(item.url);
    }
    if (approvalStatus === "REJECTED" || approvalStatus === "NOT_SUBMITTED") {
      return ["/doctor/profile", "/doctor/application", "/doctor/pending-approval", "/"].includes(item.url);
    }
    return item.url !== "/doctor/pending-approval";
  });

  const applicantNavigation = [
    ...(effectiveRole === "patient" ? data.patient.navMain : data.user.navMain),
    ...(isDoctorApplicant
      ? doctorNavigation.filter((item) =>
          ["/doctor/application", "/doctor/pending-approval"].includes(item.url)
        )
      : []),
  ];

  const navigation =
    effectiveRole === "admin"
      ? data.admin.navMain
      : effectiveRole === "doctor"
        ? doctorNavigation
        : applicantNavigation;

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 bg-white **:data-[slot=sidebar-inner]:bg-white"
    >
      <SidebarHeader className="px-4 pt-5">
        <Link
          href="/"
          className="flex items-center gap-3 px-1 py-2"
        >
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm">
            <Image src={brandLogo} alt="" sizes="40px" className="size-full object-contain" aria-hidden="true" />
          </span>

          <span className="truncate text-lg font-bold tracking-tight text-[#163A5F] group-data-[collapsible=icon]:hidden">
            DermaCare{" "}
            <span className="text-[#0F888D]">
              AI
            </span>
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
