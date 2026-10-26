"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { BadgeCheck, LockKeyhole, Mail, ShieldCheck, UserRound, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader, StatusBadge } from "../_components/AdminPreviewUI";
import { useGetCurrentUserProfileQuery, useUpdateCurrentUserProfileMutation } from "@/redux/api/adminApi";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const { data, isLoading, isError, refetch } = useGetCurrentUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateCurrentUserProfileMutation();

  const user = ((typeof data?.data === "object" && data?.data !== null ? data.data : data?.user ?? data ?? {}) as Record<string, unknown>);

  const initialName = String(user.name ?? user.fullName ?? "");
  const initialEmail = String(user.email ?? "");
  const initialPhone = String(user.phone ?? "");

  const [formName, setFormName] = useState<string | null>(null);
  const [formPhone, setFormPhone] = useState<string | null>(null);

  const fullName = formName ?? initialName;
  const email = initialEmail;
  const phone = formPhone ?? initialPhone;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter a valid name.");
      return;
    }

    try {
      await updateProfile({
        name: fullName.trim(),
        phone: phone.trim() || undefined,
      }).unwrap();
      toast.success("Profile updated successfully.");
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to update profile.");
      toast.error(message);
    }
  };

  const initials = (fullName || "Admin")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AD";

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Account"
        title="Admin profile"
        description="Review administrator account credentials and update personal details."
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load account profile from backend.</span>
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
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#0F888D]" />
            Loading profile information...
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <span className="mx-auto grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-[#163A5F] to-[#0F888D] text-2xl font-bold text-white">
                {initials}
              </span>
              <h2 className="mt-4 text-lg font-bold text-[#163A5F]">{fullName || "Administrator"}</h2>
              <p className="text-sm text-slate-500">{String(user.role ?? "ADMIN")}</p>
              <div className="mt-4">
                <StatusBadge value={String(user.status ?? "ACTIVE")} />
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-[#163A5F]">Account Details</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="flex gap-3">
                  <BadgeCheck className="mt-0.5 size-4 text-[#0F888D]" />
                  <div>
                    <dt className="text-slate-500">Role</dt>
                    <dd className="font-medium">{String(user.role ?? "Administrator")}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 size-4 text-[#0F888D]" />
                  <div>
                    <dt className="text-slate-500">Access level</dt>
                    <dd className="font-medium">Platform operations</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <LockKeyhole className="mt-0.5 size-4 text-[#0F888D]" />
                  <div>
                    <dt className="text-slate-500">Authentication</dt>
                    <dd className="font-medium">Verified Identity</dd>
                  </div>
                </div>
              </dl>
            </section>
          </aside>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <span className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-[#0F888D]">
                <UserRound className="size-5" />
              </span>
              <div>
                <h2 className="font-bold text-[#163A5F]">Personal Information</h2>
                <p className="text-sm text-slate-500">
                  Update administrative display name and telephone contact.
                </p>
              </div>
            </div>
            <form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  required
                  value={fullName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    disabled
                    className="pl-9 bg-slate-50 text-slate-500 cursor-not-allowed"
                    value={email}
                  />
                </div>
                <p className="text-xs text-slate-400">Account email is managed by identity provider.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+880 1700 000 000"
                  value={phone}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormPhone(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-end">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
