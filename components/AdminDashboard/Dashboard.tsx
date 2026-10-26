"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  ScanFace,
  ShieldCheck,
  Users,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { useGetAdminDashboardSummaryQuery } from "@/redux/api/adminApi";

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useGetAdminDashboardSummaryQuery();

  const summary = (data?.data ?? data ?? {}) as Record<string, unknown>;

  const totalUsers = (summary.totalUsers ?? summary.usersCount ?? summary.users ?? 0) as number;
  const verifiedDoctors = (summary.verifiedDoctors ?? summary.doctorsCount ?? summary.approvedDoctors ?? 0) as number;
  const pendingApprovals = (summary.pendingApprovals ?? summary.pendingDoctorsCount ?? summary.pendingDoctors ?? 0) as number;
  const totalAppointments = (summary.totalAppointments ?? summary.appointmentsCount ?? summary.appointments ?? 0) as number;

  const recentUsers: Record<string, unknown>[] = (
    (summary.recentUsers ?? summary.latestUsers ?? summary.usersList ?? []) as unknown[]
  ).filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0F888D]">
            Admin Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#163A5F] sm:text-[28px]">
            Dashboard overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time platform metrics and administrative health.
          </p>
        </div>
        <Link
          href="/admin/dashboard/verification-queue"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0F888D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0D777E]"
        >
          <ClipboardCheck size={16} />
          Review queue
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
            {isLoading ? "..." : pendingApprovals}
          </span>
        </Link>
      </section>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Failed to load live dashboard summary. Showing zeroed counters.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="grid min-h-[160px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#0F888D]" />
            Loading dashboard analytics...
          </div>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
                  {Number(totalUsers).toLocaleString()}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <Users size={19} />
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-500">Platform patient & clinician accounts</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Verified Clinicians</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
                  {Number(verifiedDoctors).toLocaleString()}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
                <ShieldCheck size={19} />
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-500">Active approved medical practitioners</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
                  {Number(pendingApprovals).toLocaleString()}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <ClipboardCheck size={19} />
              </span>
            </div>
            <p className="mt-4 text-xs text-amber-700 font-medium">Awaiting document verification</p>
          </article>

          <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Appointments</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
                  {Number(totalAppointments).toLocaleString()}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
                <CalendarCheck size={19} />
              </span>
            </div>
            <p className="mt-4 text-xs text-slate-500">Total recorded consultations</p>
          </article>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-[#163A5F]">Recent Activity</h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest account and platform registrations
              </p>
            </div>
            <Link
              href="/admin/dashboard/user-list"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0F888D] hover:underline"
            >
              View all users <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-slate-500">
                      No recent user activity recorded.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((item, index) => {
                    const userObj = (typeof item.user === "object" && item.user !== null ? item.user : {}) as Record<string, unknown>;
                    const name = String(item.name ?? userObj.name ?? item.email ?? "User");
                    const email = String(item.email ?? userObj.email ?? "");
                    const role = String(item.role ?? userObj.role ?? "USER");
                    const status = String(item.status ?? "ACTIVE");
                    const initials = name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) || "U";

                    return (
                      <tr key={String(item.id ?? item.email ?? index)} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-semibold text-teal-700">
                              {initials}
                            </span>
                            <div>
                              <p className="font-medium text-[#163A5F]">{name}</p>
                              <p className="mt-0.5 text-xs text-slate-400">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">{role}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                              status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700"
                                : status === "SUSPENDED"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[#163A5F]">Verification Queue</h2>
                <p className="mt-1 text-xs text-slate-500">Clinicians awaiting review</p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
                <ScanFace size={19} />
              </span>
            </div>
            <div className="mt-7 flex items-end gap-3">
              <p className="text-5xl font-semibold tracking-tight text-[#163A5F]">
                {isLoading ? "..." : pendingApprovals}
              </p>
              <p className="mb-1 text-xs text-slate-500">
                doctor applications
                <br />
                pending review
              </p>
            </div>
          </div>
          <Link
            href="/admin/dashboard/verification-queue"
            className="mt-6 flex h-10 items-center justify-center gap-2 rounded-lg border border-[#C7E5E3] text-xs font-semibold text-[#0F777E] transition-colors hover:bg-[#EFF9F8]"
          >
            Open verification queue <ArrowRight size={14} />
          </Link>
        </aside>
      </section>

      <footer className="flex items-center justify-between border-t border-slate-200/70 pt-4 text-[11px] text-slate-400">
        <span>DermaCare AI - Admin workspace</span>
        <span>Connected to backend API</span>
      </footer>
    </div>
  );
}
