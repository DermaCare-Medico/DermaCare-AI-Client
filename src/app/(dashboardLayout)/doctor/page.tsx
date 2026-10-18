"use client";

import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Inbox,
} from "lucide-react";

import { AppointmentCard } from "@/components/doctor/AppointmentCard";
import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { PageHeader } from "@/components/doctor/PageHeader";
import { StatCard } from "@/components/doctor/StatCard";
import { useDoctorAppointments } from "@/src/hooks/useDoctorModule";
import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";
import { isToday } from "@/lib/doctor/utils";

export default function DoctorDashboardPage() {
  const { appointments, isDemo, isLoading, isError, error, refetch } =
    useDoctorAppointments();

  const token = useAppSelector((state) => state.auth.token);
  const decoded = useDecodedToken(token);
  const authUser = useAppSelector((state) => state.auth.user) as
    | { name?: string; firstName?: string }
    | null;

  const displayName =
    (typeof decoded?.firstName === "string" && decoded.firstName) ||
    authUser?.firstName ||
    authUser?.name ||
    (typeof decoded?.name === "string" && decoded.name) ||
    "Doctor";

  const todaysAppointments = appointments
    .filter(
      (a) =>
        isToday(a.scheduledTime) &&
        (a.status === "SCHEDULED" || a.status === "IN_PROGRESS")
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );

  const pendingRequests = appointments.filter(
    (a) => a.status === "CANCELLATION_REQUESTED"
  );

  const completed = appointments.filter((a) => a.status === "COMPLETED");

  const scheduled = appointments.filter((a) => a.status === "SCHEDULED");

  return (
    <section>
      <PageHeader
        eyebrow="Doctor dashboard"
        title={`Good to see you, ${displayName}`}
        description="Overview of your requests, today's schedule, and completed consultations."
        actions={
          <Link
            href="/doctor/appointments"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-[#0F888D]/40 hover:text-[#0F888D]"
          >
            <ClipboardList size={16} /> All appointments
          </Link>
        }
      />

      {isDemo && <DemoNotice className="mb-6" />}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending requests"
          value={pendingRequests.length}
          icon={Inbox}
          hint="Cancellation requests awaiting review"
        />
        <StatCard
          title="Today's appointments"
          value={todaysAppointments.length}
          icon={CalendarClock}
          hint="Scheduled or in progress today"
        />
        <StatCard
          title="Completed consultations"
          value={completed.length}
          icon={CheckCircle2}
          hint="All-time completed"
        />
        <StatCard
          title="Upcoming scheduled"
          value={scheduled.length}
          icon={CalendarCheck}
          hint="Booked and not started"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-bold text-[#163A5F]">
            Today&apos;s appointments
          </h2>
          <DataState
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={todaysAppointments.length === 0}
            emptyTitle="No appointments today"
            emptyMessage="Your schedule for today is clear."
            onRetry={refetch}
          >
            <div className="space-y-3">
              {todaysAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.appointmentId}
                  appointment={appointment}
                />
              ))}
            </div>
          </DataState>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold text-[#163A5F]">
            Pending requests
          </h2>
          <DataState
            isLoading={isLoading}
            isError={isError}
            error={error}
            isEmpty={pendingRequests.length === 0}
            emptyTitle="No pending requests"
            emptyMessage="Cancellation requests from patients will appear here."
            onRetry={refetch}
          >
            <div className="space-y-3">
              {pendingRequests.map((appointment) => (
                <AppointmentCard
                  key={appointment.appointmentId}
                  appointment={appointment}
                />
              ))}
            </div>
          </DataState>
        </div>
      </div>
    </section>
  );
}
