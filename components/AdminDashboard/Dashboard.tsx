import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ClipboardCheck,
  ScanFace,
  ShieldCheck,
  Users,
} from "lucide-react";

const metrics = [
  {
    label: "Total users",
    value: "2,480",
    change: "+12.8%",
    detail: "vs. last month",
    color: "#0F888D",
    icon: Users,
    points: "0,42 24,34 45,39 66,25 88,29 111,16 134,23 158,6",
  },
  {
    label: "Verified clinicians",
    value: "186",
    change: "+8.4%",
    detail: "vs. last month",
    color: "#3A7897",
    icon: ShieldCheck,
    points: "0,37 24,30 45,33 66,17 88,22 111,11 134,17 158,4",
  },
  {
    label: "Pending verification",
    value: "24",
    change: "Needs attention",
    detail: "in verification queue",
    color: "#D38B32",
    icon: ClipboardCheck,
    points: "0,14 24,21 45,13 66,29 88,23 111,34 134,27 158,40",
  },
];

const activity = [
  {
    name: "Dr. Amara Rahman",
    email: "amara.rahman@example.com",
    type: "Dermatologist",
    date: "Today, 10:42 AM",
    status: "Pending review",
    initials: "AR",
    color: "bg-teal-50 text-teal-700",
  },
  {
    name: "Dr. Nathan Cole",
    email: "nathan.cole@example.com",
    type: "Dermatologist",
    date: "Today, 09:18 AM",
    status: "Pending review",
    initials: "NC",
    color: "bg-sky-50 text-sky-700",
  },
  {
    name: "Sofia Martinez",
    email: "sofia.martinez@example.com",
    type: "Patient",
    date: "Yesterday, 04:35 PM",
    status: "Active",
    initials: "SM",
    color: "bg-violet-50 text-violet-700",
  },
  {
    name: "Dr. Priya Nair",
    email: "priya.nair@example.com",
    type: "Dermatologist",
    date: "Yesterday, 02:10 PM",
    status: "Verified",
    initials: "PN",
    color: "bg-amber-50 text-amber-700",
  },
];

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
  const Icon = metric.icon;
  const isPending = metric.label === "Pending verification";
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{metric.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
            {metric.value}
          </p>
        </div>
        <span
          className="grid size-10 place-items-center rounded-xl"
          style={{ backgroundColor: `${metric.color}14`, color: metric.color }}
        >
          <Icon size={19} />
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="flex items-center gap-1 text-xs font-semibold text-slate-500">
          {isPending ? (
            <ArrowDownRight size={14} className="text-amber-600" />
          ) : (
            <ArrowUpRight size={14} className="text-emerald-600" />
          )}
          <span className={isPending ? "text-amber-700" : "text-emerald-700"}>
            {metric.change}
          </span>
          <span className="font-normal">{metric.detail}</span>
        </p>
        <svg
          viewBox="0 0 158 48"
          className="h-10 w-28"
          role="img"
          aria-label={`${metric.label} trend`}
        >
          <polyline
            points={metric.points}
            fill="none"
            stroke={metric.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0 3)"
          />
        </svg>
      </div>
    </article>
  );
}

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0F888D]">
            Wednesday, October 14, 2026
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#163A5F] sm:text-[28px]">
            Dashboard overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here’s what’s happening across your DermaCare platform.
          </p>
        </div>
        <Link
          href="/admin/dashboard/verification-queue"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0F888D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0D777E]"
        >
          <ClipboardCheck size={16} />
          Review queue
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
            24
          </span>
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="font-semibold text-[#163A5F]">Recent activity</h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest account activity across the platform
              </p>
            </div>
            <Link
              href="/admin/dashboard/user-list"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0F888D] hover:underline"
            >
              View users <ArrowRight size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-4 py-3">Account type</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activity.map((item) => (
                  <tr key={item.email} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${item.color}`}
                        >
                          {item.initials}
                        </span>
                        <div>
                          <p className="font-medium text-[#163A5F]">{item.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{item.type}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {item.date}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          item.status === "Pending review"
                            ? "bg-amber-50 text-amber-700"
                            : item.status === "Verified"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-sky-50 text-sky-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
            Showing 4 of 2,480 accounts
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-[#163A5F]">
                Verification queue
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Clinicians awaiting approval
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <ScanFace size={19} />
            </span>
          </div>
          <div className="mt-7 flex items-end gap-3">
            <p className="text-5xl font-semibold tracking-tight text-[#163A5F]">
              24
            </p>
            <p className="mb-1 text-xs text-slate-500">
              applications need
              <br />
              your attention
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Submitted today</span>
              <span className="font-semibold text-[#163A5F]">6</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Oldest application</span>
              <span className="font-semibold text-[#163A5F]">2 days ago</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[68%] rounded-full bg-[#14A3A0]" />
            </div>
            <p className="text-[11px] text-slate-400">
              68% reviewed within 24 hours
            </p>
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
        <span>DermaCare AI · Admin workspace</span>
        <span>Mock dashboard data</span>
      </footer>
    </div>
  );
}
