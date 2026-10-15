"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

const initialUsers = [
  {
    name: "Dr. Amara Rahman",
    email: "amara.rahman@example.com",
    type: "Dermatologist",
    joined: "Oct 14, 2026",
    status: "Pending",
    initials: "AR",
    tone: "bg-teal-50 text-teal-700",
  },
  {
    name: "Sofia Martinez",
    email: "sofia.martinez@example.com",
    type: "Patient",
    joined: "Oct 13, 2026",
    status: "Active",
    initials: "SM",
    tone: "bg-violet-50 text-violet-700",
  },
  {
    name: "Dr. Nathan Cole",
    email: "nathan.cole@example.com",
    type: "Dermatologist",
    joined: "Oct 13, 2026",
    status: "Pending",
    initials: "NC",
    tone: "bg-sky-50 text-sky-700",
  },
  {
    name: "Maya Thompson",
    email: "maya.thompson@example.com",
    type: "Patient",
    joined: "Oct 12, 2026",
    status: "Active",
    initials: "MT",
    tone: "bg-rose-50 text-rose-700",
  },
  {
    name: "Dr. Priya Nair",
    email: "priya.nair@example.com",
    type: "Dermatologist",
    joined: "Oct 11, 2026",
    status: "Verified",
    initials: "PN",
    tone: "bg-amber-50 text-amber-700",
  },
  {
    name: "Ethan Williams",
    email: "ethan.williams@example.com",
    type: "Patient",
    joined: "Oct 10, 2026",
    status: "Active",
    initials: "EW",
    tone: "bg-blue-50 text-blue-700",
  },
];

export default function UserPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All users");
  const users = useMemo(
    () =>
      initialUsers.filter((user) => {
        const matchesQuery = `${user.name} ${user.email} ${user.type}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesFilter =
          filter === "All users" ||
          (filter === "Patients" && user.type === "Patient") ||
          (filter === "Clinicians" && user.type === "Dermatologist");
        return matchesQuery && matchesFilter;
      }),
    [query, filter],
  );

  return (
    <div className="mx-auto max-w-[1440px] space-y-7">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#0F888D]">
          Directory
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#163A5F] sm:text-[28px]">
          Users
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Browse and manage patient and clinician accounts.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total accounts", "2,480", "All registered users"],
          ["Patients", "2,294", "92.5% of accounts"],
          ["Clinicians", "186", "24 pending verification"],
        ].map(([label, value, detail]) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Users size={17} className="text-[#0F888D]" />
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[#163A5F]">
              {value}
            </p>
            <p className="mt-1 text-xs text-slate-400">{detail}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-semibold text-[#163A5F]">All accounts</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing sample users for dashboard preview
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 focus-within:border-[#0F888D]">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users..."
                aria-label="Search users"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-48"
              />
            </label>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter user type"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0F888D]"
            >
              <option>All users</option>
              <option>Patients</option>
              <option>Clinicians</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-4 py-3">Account type</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50/70">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${user.tone}`}
                      >
                        {user.initials}
                      </span>
                      <div>
                        <p className="font-medium text-[#163A5F]">{user.name}</p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{user.type}</td>
                  <td className="px-4 py-3.5 text-slate-500">{user.joined}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        user.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : user.status === "Verified"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-sky-50 text-sky-700"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
          Showing {users.length} sample accounts
        </div>
      </section>
    </div>
  );
}
