"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Clock,
  Edit,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "@/components/doctor/PageHeader";
import { VerificationStatusBadge } from "@/components/doctor/StatusBadge";

import { useGetMeQuery } from "@/redux/api/authApi";
import { useGetOwnDoctorProfileQuery } from "@/redux/api/doctorApi";
import { useAppSelector } from "@/redux/hooks";
import { readIdentity } from "@/lib/doctor/identity";
import { formatDate, getApiErrorMessage } from "@/lib/doctor/utils";
import type { VerificationStatus } from "@/types/doctor";

const copy: Record<VerificationStatus, { title: string; body: string }> = {
  NOT_SUBMITTED: {
    title: "License not submitted",
    body: "Submit your medical license to begin the verification process.",
  },
  PENDING_REVIEW: {
    title: "Pending review",
    body: "Your medical license is being reviewed by the medical board. You will be notified by email once a decision is made.",
  },
  APPROVED: {
    title: "License approved",
    body: "Your license is verified. You now have full access to the doctor dashboard and schedule.",
  },
  REJECTED: {
    title: "License rejected",
    body: "Your previous submission was rejected. Please review the requirements and submit a valid document.",
  },
};

export default function DoctorPendingApprovalPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const identityQuery = useGetMeQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const profileQuery = useGetOwnDoctorProfileQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const authIdentity = useMemo(() => readIdentity(identityQuery.data), [identityQuery.data]);
  const profileIdentity = useMemo(() => readIdentity(profileQuery.data), [profileQuery.data]);
  const identity = {
    id: profileIdentity.id ?? authIdentity.id,
    name: profileIdentity.name ?? authIdentity.name,
    email: profileIdentity.email ?? authIdentity.email,
    role: authIdentity.role ?? profileIdentity.role,
    licenseNumber: profileIdentity.licenseNumber ?? authIdentity.licenseNumber,
    licenseSubmittedAt: profileIdentity.licenseSubmittedAt ?? authIdentity.licenseSubmittedAt,
  };
  const status: VerificationStatus | undefined = profileIdentity.status ?? authIdentity.status;
  const content = status ? copy[status] : undefined;
  const isLoading = identityQuery.isLoading || profileQuery.isLoading;
  const isError = identityQuery.isError || profileQuery.isError;
  const error = profileQuery.error ?? identityQuery.error;

  useEffect(() => {
    if (!isLoading && !isError && identity.role?.toUpperCase() === "DOCTOR" && status === "APPROVED") {
      router.replace("/doctor");
    }
  }, [identity.role, isError, isLoading, router, status]);

  const Icon =
    status === "APPROVED"
      ? ShieldCheck
      : status === "REJECTED"
        ? XCircle
        : status === "PENDING_REVIEW"
          ? Clock
          : ShieldAlert;

  return (
    <section>
      <PageHeader
        eyebrow="Account approval"
        title="Verification status"
        description="Your doctor account is activated once your medical license is verified."
        actions={status ? <VerificationStatusBadge status={status} /> : undefined}
      />

      <Card className="max-w-2xl border-slate-200">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <span className="grid size-12 place-items-center rounded-xl bg-[#E8F5F4] text-[#0F888D]">
            <Icon size={22} />
          </span>
          <CardTitle className="text-lg text-[#163A5F]">{content?.title ?? "Verification status unavailable"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading && (
            <div className="space-y-3" aria-busy="true">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {isError && (
            <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              {getApiErrorMessage(error, "Could not load your verification status.")}{" "}
              <button
                type="button"
                onClick={() => { identityQuery.refetch(); profileQuery.refetch(); }}
                className="font-semibold underline"
              >
                Retry
              </button>
            </p>
          )}

          {!isLoading && !isError && status && content && (
            <>
              <p className="text-sm leading-6 text-slate-600">{content.body}</p>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Doctor" value={identity.name || "—"} />
                <Field
                  label="License number"
                  value={identity.licenseNumber || "—"}
                />
                <Field
                  label="Submitted"
                  value={
                    identity.licenseSubmittedAt
                      ? formatDate(identity.licenseSubmittedAt)
                      : "—"
                  }
                />
                <Field label="Status" value={status.replace(/_/g, " ")} />
              </div>

              {status === "APPROVED" ? (
                <Button asChild className="bg-[#0F888D] hover:bg-[#0C7479]">
                  <Link href="/doctor">
                    <BadgeCheck size={16} /> Go to dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild className="bg-[#0F888D] hover:bg-[#0C7479]">
                  <Link href="/doctor/profile">
                    <Edit size={16} />
                    {status === "PENDING_REVIEW"
                      ? "View profile & license"
                      : "Update profile & license"}
                  </Link>
                </Button>
              )}
            </>
          )}
          {!isLoading && !isError && !status && (
            <p role="alert" className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              The backend did not return a recognized doctor approval status. Retry or sign in again before accessing clinical tools. {" "}
              <button type="button" onClick={() => { identityQuery.refetch(); profileQuery.refetch(); }} className="font-semibold underline">Retry</button>
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}
