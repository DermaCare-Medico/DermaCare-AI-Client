"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";
import { dashboardForRole } from "@/src/utils/auth";
import { isDemoAuthEnabled, readDemoSession } from "@/src/utils/demoAuth";
import { ScreeningFlowProvider } from "./screening-flow-context";

const SCREENING_PATH = "/patient/screening/new";

export default function ScreeningAccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAppSelector((state) => state.auth.token);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const decodedToken = useDecodedToken(token);
  const demoSession = isDemoAuthEnabled() ? readDemoSession() : null;
  const isAuthenticated = Boolean(token) || Boolean(demoSession);
  const role = String(userRole ?? decodedToken?.role ?? demoSession?.user.role ?? "").toUpperCase();
  const canScreen = role === "PATIENT" || role === "USER";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || SCREENING_PATH)}`);
      return;
    }

    if (!canScreen) {
      router.replace(dashboardForRole(role));
    }
  }, [canScreen, isAuthenticated, pathname, role, router]);

  if (!isAuthenticated || !canScreen) return null;

  return <ScreeningFlowProvider>{children}</ScreeningFlowProvider>;
}
