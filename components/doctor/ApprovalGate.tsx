"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, ShieldCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetMeQuery } from "@/redux/api/authApi";
import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";
import { DOCTOR_DEMO_ENABLED } from "@/src/app/(dashboardLayout)/doctor/mockData";
import { readIdentity } from "@/lib/doctor/identity";
import type { VerificationStatus } from "@/types/doctor";
import { getDoctorRouteAccess } from "./approval-access";

/**
 * Protects the Doctor Module routes:
 *  - requires an authenticated DOCTOR account,
 *  - blocks the dashboard/schedule until the license is APPROVED,
 *  - keeps `/doctor/pending-approval` and `/doctor/profile` reachable while pending.
 */
export function DoctorApprovalGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAppSelector((state) => state.auth.token);
  const decoded = useDecodedToken(token);

  const { data, isLoading, isError } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const identity = readIdentity(data);
  const role = (
    identity.role ??
    (typeof decoded?.role === "string" ? decoded.role : undefined)
  )?.toUpperCase();

  const status: VerificationStatus | undefined = identity.status;
  const access = getDoctorRouteAccess({
    pathname,
    role,
    status,
    demoEnabled: DOCTOR_DEMO_ENABLED,
  });
  const isClinicalDoctorRoute =
    !pathname.startsWith("/doctor/application") &&
    !pathname.startsWith("/doctor/pending-approval");
  const isWaitingForDoctorStatus =
    isLoading && role === "DOCTOR" && isClinicalDoctorRoute && !status;
  const needsPendingRedirect = access === "redirect-pending" && !isLoading;

  useEffect(() => {
    if (needsPendingRedirect) {
      router.replace("/doctor/pending-approval");
    }
  }, [needsPendingRedirect, router]);

  if (!token) {
    return (
      <GateMessage
        icon={<ShieldAlert size={22} className="text-rose-500" />}
        title="Sign in required"
        message="Please sign in with a doctor account to open the Doctor Module."
        action={
          <Button asChild className="mt-4 bg-[#0F888D] hover:bg-[#0C7479]">
            <Link href="/login">Go to sign in</Link>
          </Button>
        }
      />
    );
  }

  // Only block on loading while we have no decoded role to act on yet.
  if (isLoading && (!role || isWaitingForDoctorStatus)) {
    return (
      <div className="space-y-3" aria-busy="true">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  // Real API failures must not be masked; in demo mode we allow the doctor UI.
  if (isError && !DOCTOR_DEMO_ENABLED && !role) {
    return (
      <GateMessage
        icon={<ShieldAlert size={22} className="text-rose-500" />}
        title="Could not verify your account"
        message="We could not confirm your doctor verification status. Please try again later."
      />
    );
  }

  if (access === "deny-role") {
    return (
      <GateMessage
        icon={<ShieldAlert size={22} className="text-rose-500" />}
        title="Doctor account required"
        message="This area is only available to verified doctor accounts."
      />
    );
  }

  if (needsPendingRedirect) {
    return (
      <GateMessage
        icon={<ShieldCheck size={22} className="text-amber-500" />}
        title="Approval pending"
        message="Your medical license is still under review. Redirecting you to your approval status…"
      />
    );
  }

  return <>{children}</>;
}

function GateMessage({
  icon,
  title,
  message,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-slate-50">
        {icon}
      </div>
      <h1 className="text-lg font-semibold text-[#163A5F]">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      {action}
    </div>
  );
}
