"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "@/src/assets/logo.png";
import {
  CalendarClock,
  ClipboardList,
  HandCoins,
  Home,
  InfoIcon,
  LayoutDashboard,
  Pill,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

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
        title: "Users",
        url: "/user/dashboard/users",
        icon: HandCoins,
        items: [
          {
            title: "Users",
            url: "/user/dashboard/estimates",
            icon: Users,
          },
          {
            title: "Pending Users",
            url: "/user/dashboard/pending-users",
            icon: InfoIcon,
          },
        ],
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
        url: "/patient/dashboard",
        icon: ClipboardList,
      },
      {
        title: "Find Doctors",
        url: "/patient/dashboard",
        icon: Stethoscope,
      },
      {
        title: "Appointments",
        url: "/patient/dashboard",
        icon: CalendarClock,
      },
      {
        title: "Prescriptions",
        url: "/patient/profile",
        icon: Pill,
      },
      {
        title: "Pharmacy Orders",
        url: "/patient/dashboard",
        icon: ShoppingBag,
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
};

// add roles based on your requirements
interface AppSidebarProps {
  role: string;
}

export default function AppSidebar({ role, ...props }: AppSidebarProps) {
  const sidebarData = data[role?.toLowerCase() as keyof typeof data];

  return (
    <Sidebar
      collapsible="icon"
      className="w-64 bg-white border-r border-blue-200"
      {...props}
    >
      <SidebarHeader>
        <Link
          href={"/"}
          className="flex items-center w-full max-h-40 justify-center"
        >
          <Image
            src={Logo.src}
            alt="Logo"
            width={300}
            height={300}
            className="size-auto "
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData?.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
