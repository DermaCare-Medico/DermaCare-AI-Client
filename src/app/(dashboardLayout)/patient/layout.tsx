"use client";

import { useAppSelector } from "@/redux/hooks";
import { isDemoAuthEnabled, readDemoSession } from "@/src/utils/demoAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAppSelector((state) => state.auth.token);
  const demoMode = isDemoAuthEnabled();
  const demoSession = demoMode ? readDemoSession() : null;
  const isAuthenticated = Boolean(token) || Boolean(demoSession);

  useEffect(() => {
    if (!isAuthenticated) {
      const encodedPath = encodeURIComponent(pathname || "/patient/dashboard");
      router.replace(`/login?redirect=${encodedPath}`);
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {demoMode && (
        <p
          className="m-4 mb-0 rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900"
          role="status"
        >
          DEMO MODE — Frontend-only local testing. Do not enter real health information.
        </p>
      )}
      {children}
    </>
  );
}
