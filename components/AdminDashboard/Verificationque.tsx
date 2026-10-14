"use client";

import { useMemo, useState } from "react";
import { Check, Clock3, Search, ShieldCheck, X } from "lucide-react";

type VerificationStatus = "Pending" | "Approved" | "Declined";

type Application = {
  name: string;
  email: string;
  specialty: string;
  submitted: string;
  license: string;
  status: VerificationStatus;
  initials: string;
  tone: string;
};

const sampleApplications: Application[] = [
  {
    name: "Dr. Amara Rahman",
    email: "amara.rahman@example.com",
    specialty: "Medical Dermatology",
    submitted: "Today, 10:42 AM",
    license: "MD-284901",
    status: "Pending",
    initials: "AR",
    tone: "bg-teal-50 text-teal-700",
  },
  {
    name: "Dr. Nathan Cole",
    email: "nathan.cole@example.com",
    specialty: "Pediatric Dermatology",
    submitted: "Today, 09:18 AM",
    license: "MD-193847",
    status: "Pending",
    initials: "NC",
    tone: "bg-sky-50 text-sky-700",
  },
  {
    name: "Dr. Mei Tanaka",
    email: "mei.tanaka@example.com",
    specialty: "Cosmetic Dermatology",
    submitted: "Yesterday, 04:35 PM",
    license: "MD-540281",
    status: "Pending",
    initials: "MT",
    tone: "bg-violet-50 text-violet-700",
  },
  {
    name: "Dr. Omar Haddad",
    email: "omar.haddad@example.com",
    specialty: "Dermatopathology",
    submitted: "Yesterday, 02:10 PM",
    license: "MD-761923",
    status: "Pending",
    initials: "OH",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    name: "Dr. Priya Nair",
    email: "priya.nair@example.com",
    specialty: "Medical Dermatology",
    submitted: "Oct 12, 2026",
    license: "MD-672308",
    status: "Approved",
    initials: "PN",
    tone: "bg-rose-50 text-rose-700",
  },
];

const filters = ["All", "Pending", "Approved", "Declined"] as const;

export default function Verificationque() {
  const [applications, setApplications] = useState(sampleApplications);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [query, setQuery] = useState("");

  const visibleApplications = useMemo(
    () =>
      applications.filter((application) => {
        const matchesFilter = filter === "All" || application.status === filter;
        const matchesQuery = `${application.name} ${application.email} ${application.license}`
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesFilter && matchesQuery;
      }),
    [applications, filter, query],
  );

  function updateStatus(email: string, status: VerificationStatus) {
    setApplications((current) =>
      current.map((application) =>
        application.email === email ? { ...application, status } : application,
      ),
    );
  }

  const pendingCount = applications.filter(
    (application) => application.status === "Pending",
  ).length;
  const approvedCount = applications.filter(
    (application) => application.status === "Approved",
  ).length;

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0F888D]">
            Clinician onboarding
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#163A5F] sm:text-[28px]">
            Verification queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review professional credentials before clinicians join the network.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
          <Clock3 size={15} />
          {pendingCount} awaiting review
        </span>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Awaiting review",
            value: pendingCount,
            note: "Ready for your review",
            className: "text-amber-700 bg-amber-50",
          },
          {
            label: "Approved",
            value: approvedCount,
            note: "Clinicians verified",
            className: "text-emerald-700 bg-emerald-50",
          },
          {
            label: "Total applications",
            value: applications.length,
            note: "Sample queue entries",
            className: "text-[#0F777E] bg-[#E8F5F4]",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <span
                className={`grid size-9 place-items-center rounded-xl ${stat.className}`}
              >
                <ShieldCheck size={18} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-semibold text-[#163A5F]">
              Clinician applications
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review the submitted information and update each application.
            </p>
          </div>
          <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 focus-within:border-[#0F888D]">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search applications..."
              aria-label="Search verification applications"
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-52"
            />
          </label>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5 sm:px-6">
          {filters.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setFilter(item)}
              className={`shrink-0 border-b-2 px-3 py-3 text-xs font-medium transition-colors ${
                filter === item
                  ? "border-[#0F888D] text-[#0F777E]"
                  : "border-transparent text-slate-500 hover:text-[#163A5F]"
              }`}
            >
              {item}
              {item === "Pending" && (
                <span className="ml-2 rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-700">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Applicant</th>
                <th className="px-4 py-3">Specialty</th>
                <th className="px-4 py-3">License number</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleApplications.map((application) => (
                <tr key={application.email} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${application.tone}`}
                      >
                        {application.initials}
                      </span>
                      <div>
                        <p className="font-medium text-[#163A5F]">
                          {application.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {application.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {application.specialty}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">
                    {application.license}
                  </td>
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {application.submitted}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        application.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : application.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {application.status === "Pending" ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(application.email, "Approved")
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#E8F5F4] px-2.5 text-xs font-semibold text-[#0F777E] transition-colors hover:bg-[#D7EEEC]"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateStatus(application.email, "Declined")
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    ) : (
                      <span className="block text-right text-xs text-slate-400">
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {visibleApplications.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No applications match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
          Showing {visibleApplications.length} sample applications
        </div>
      </section>
    </div>
  );
}
