import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HeartPulse,
  ScanFace,
  ShieldCheck,
} from "lucide-react";

const appointments = [
  {
    clinician: "Dr. Aisha Patel",
    specialty: "Dermatologist",
    date: "October 16, 2026",
    time: "10:30 AM",
    status: "Confirmed",
    initials: "AP",
  },
  {
    clinician: "Dr. James Rivera",
    specialty: "Skin consultation",
    date: "October 22, 2026",
    time: "2:00 PM",
    status: "Requested",
    initials: "JR",
  },
];

const carePlan = [
  { label: "Gentle cleanser", detail: "Morning and evening", done: true },
  { label: "Daily SPF 30+", detail: "Every morning", done: true },
  { label: "Moisturizer", detail: "Evening", done: false },
];

export default function UserDashboard() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0F888D]">
          Your care at a glance
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#163A5F] sm:text-[28px]">
          Good morning, Alex
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Keep up with your skin health and upcoming care.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          {
            label: "Skin assessments",
            value: "3",
            detail: "Your recent check-ins",
            icon: ScanFace,
            iconClass: "bg-[#E8F5F4] text-[#0F777E]",
          },
          {
            label: "Upcoming appointments",
            value: "2",
            detail: "Next visit Oct 16",
            icon: CalendarDays,
            iconClass: "bg-sky-50 text-sky-700",
          },
          {
            label: "Care plan progress",
            value: "On track",
            detail: "Updated 2 days ago",
            icon: HeartPulse,
            iconClass: "bg-rose-50 text-rose-700",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <span
                  className={`grid size-10 place-items-center rounded-xl ${item.iconClass}`}
                >
                  <Icon size={19} />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-[#163A5F]">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-[#E8F5F4] text-[#0F777E]">
                  <ClipboardList size={18} />
                </span>
                <h2 className="font-semibold text-[#163A5F]">Your care plan</h2>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                A simple routine prepared with your care team.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              On track
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {carePlan.map(({ label, detail, done }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-[#F8FAFB] px-4 py-3"
              >
                <CheckCircle2
                  size={19}
                  className={done ? "text-[#0F888D]" : "text-slate-300"}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#163A5F]">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {detail}
                  </p>
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    done ? "text-[#0F777E]" : "text-slate-400"
                  }`}
                >
                  {done ? "Done today" : "Up next"}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/user"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F888D] hover:underline"
          >
            View your care plan <ArrowRight size={14} />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-[#163A5F]">
                Upcoming appointments
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your next visits with care providers
              </p>
            </div>
            <CalendarDays size={19} className="text-[#0F888D]" />
          </div>
          <div className="mt-5 space-y-3">
            {appointments.map((appointment) => (
              <article
                key={appointment.clinician}
                className="rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-[#E8F5F4] text-xs font-semibold text-[#0F777E]">
                    {appointment.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#163A5F]">
                      {appointment.clinician}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {appointment.specialty}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                      appointment.status === "Confirmed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {appointment.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} />
                    {appointment.time}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#163A5F] p-5 text-white sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#73DED2]">
            <ShieldCheck size={20} />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Your next skin check-in</h2>
            <p className="mt-1 text-xs leading-5 text-white/70">
              Keep your care team up to date with a new skin assessment.
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-[#163A5F] transition-colors hover:bg-[#E8F5F4]"
        >
          Start assessment <ArrowRight size={14} />
        </Link>
      </section>
      <p className="text-right text-[11px] text-slate-400">
        Sample dashboard data for preview
      </p>
    </div>
  );
}
