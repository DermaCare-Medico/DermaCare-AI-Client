"use client";

import Link from "next/link";
import { useMemo } from "react";
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
  const token = useAppSelector((state) => state.auth.token);
  const { data, isLoading, isError, error, refetch } = useGetMeQuery(undefined, {
    skip: !token,
  });

  const identity = useMemo(() => readIdentity(data), [data]);
  const status: VerificationStatus = identity.status ?? "NOT_SUBMITTED";
  const content = copy[status];

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
        actions={<VerificationStatusBadge status={status} />}
      />

      <Card className="max-w-2xl border-slate-200">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <span className="grid size-12 place-items-center rounded-xl bg-[#E8F5F4] text-[#0F888D]">
            <Icon size={22} />
          </span>
          <CardTitle className="text-lg text-[#163A5F]">{content.title}</CardTitle>
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
                onClick={() => refetch()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </p>
          )}

          {!isLoading && !isError && (
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
