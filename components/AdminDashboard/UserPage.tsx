"use client";

import { useMemo, useState } from "react";
import { Search, Users, AlertCircle, Loader2 } from "lucide-react";
import { adminCollection, adminCollectionTotal, useGetAdminUsersQuery, useUpdateAdminUserStatusMutation } from "@/redux/api/adminApi";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UserPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [targetUser, setTargetUser] = useState<Record<string, unknown> | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useGetAdminUsersQuery({
    role: roleFilter === "ALL" ? undefined : roleFilter,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const [updateUserStatus, { isLoading: isUpdating }] = useUpdateAdminUserStatusMutation();

  const userList = useMemo(() => adminCollection(data, ["users"]), [data]);

  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const name = String(user.name ?? user.fullName ?? "");
      const email = String(user.email ?? "");
      const role = String(user.role ?? "");
      const matchesSearch = `${name} ${email} ${role}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesSearch;
    });
  }, [userList, query]);

  const totalCount = adminCollectionTotal(data, userList.length);
  const patientCount = userList.filter((u) => String(u.role ?? "").toUpperCase() === "PATIENT").length;
  const doctorCount = userList.filter((u) => String(u.role ?? "").toUpperCase() === "DOCTOR").length;

  const handleToggleStatus = async (user: Record<string, unknown>) => {
    const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await updateUserStatus({ userId: String(user.id), status: nextStatus }).unwrap();
      toast.success(`User status updated to ${nextStatus}.`);
      setTargetUser(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to update user status.");
      toast.error(message);
    }
  };

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
          Browse and manage platform patient and doctor accounts.
        </p>
      </section>

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load users from backend.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total accounts", totalCount, "All loaded accounts"],
          ["Patients", patientCount, "Registered patients"],
          ["Doctors", doctorCount, "Clinical practitioners"],
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
              {isLoading ? "..." : value}
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
              {isLoading && !data ? "Fetching accounts..." : `${isFetching ? "Refreshing · " : ""}Showing ${filteredUsers.length} users`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 focus-within:border-[#0F888D]">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name or email..."
                aria-label="Search users"
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-48"
              />
            </label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              aria-label="Filter role"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0F888D]"
            >
              <option value="ALL">All Roles</option>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter status"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#0F888D]"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && !data ? (
            <div className="grid min-h-[180px] place-items-center">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin text-[#0F888D]" />
                Loading users...
              </div>
            </div>
          ) : (
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const name = String(user.name ?? user.fullName ?? "User");
                  const email = String(user.email ?? "");
                  const role = String(user.role ?? "PATIENT");
                  const status = String(user.status ?? "ACTIVE");
                  const initials = name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "U";

                  return (
                    <tr key={String(user.id ?? user.email)} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
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
                          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                            status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setTargetUser(user)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            status === "ACTIVE"
                              ? "border border-rose-200 text-rose-700 hover:bg-rose-50"
                              : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {status === "ACTIVE" ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No user accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Status confirmation dialog */}
      <Dialog open={Boolean(targetUser)} onOpenChange={(open) => !open && setTargetUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {targetUser?.status === "ACTIVE" ? "Suspend User Account" : "Activate User Account"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              {targetUser?.status === "ACTIVE" ? "suspend" : "activate"}{" "}
              <strong className="text-slate-800">
                {String(targetUser?.name ?? targetUser?.email ?? "this user")}
              </strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setTargetUser(null)}>
              Cancel
            </Button>
            <Button
              variant={targetUser?.status === "ACTIVE" ? "destructive" : "default"}
              disabled={isUpdating}
              onClick={() => targetUser && handleToggleStatus(targetUser)}
            >
              {isUpdating ? "Updating..." : targetUser?.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
