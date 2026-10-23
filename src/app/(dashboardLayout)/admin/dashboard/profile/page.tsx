"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { BadgeCheck, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader, PreviewNotice, StatusBadge } from "../_components/AdminPreviewUI";
import { ADMIN_PREVIEW_NOTICE } from "../_components/admin-preview-data";

const initialProfile = { fullName: "Admin User", email: "admin.preview@example.com", phone: "+880 1700 000 000", title: "Platform Administrator" };

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const errors = {
    fullName: profile.fullName.trim().length < 2 ? "Enter at least 2 characters." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? "" : "Enter a valid email address.",
    phone: profile.phone.replace(/\D/g, "").length < 10 ? "Enter a valid phone number." : "",
    title: profile.title.trim().length < 2 ? "Enter an administrative title." : "",
  };
  const field = (name: keyof typeof profile) => ({ value: profile[name], onChange: (event: ChangeEvent<HTMLInputElement>) => setProfile((current) => ({ ...current, [name]: event.target.value })), onBlur: () => setTouched((current) => ({ ...current, [name]: true })), "aria-invalid": Boolean(touched[name] && errors[name]), "aria-describedby": `${name}-feedback` });

  return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
    <AdminPageHeader eyebrow="Account" title="Admin profile" description="Review account information and preview personal-information edits." />
    <PreviewNotice>{ADMIN_PREVIEW_NOTICE} The contact details below are fictitious and contain no production credentials.</PreviewNotice>
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4"><section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><span className="mx-auto grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-[#163A5F] to-[#0F888D] text-2xl font-bold text-white">AU</span><h2 className="mt-4 text-lg font-bold text-[#163A5F]">{profile.fullName || "Admin preview"}</h2><p className="text-sm text-slate-500">{profile.title || "Platform administrator"}</p><div className="mt-4"><StatusBadge value="ACTIVE"/></div></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-[#163A5F]">Account details</h2><dl className="mt-4 space-y-4 text-sm"><div className="flex gap-3"><BadgeCheck className="mt-0.5 size-4 text-[#0F888D]"/><div><dt className="text-slate-500">Role</dt><dd className="font-medium">Administrator</dd></div></div><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 text-[#0F888D]"/><div><dt className="text-slate-500">Access level</dt><dd className="font-medium">Platform operations</dd></div></div><div className="flex gap-3"><LockKeyhole className="mt-0.5 size-4 text-[#0F888D]"/><div><dt className="text-slate-500">Security</dt><dd className="font-medium">Managed by authentication service</dd></div></div></dl></section></aside>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3 border-b border-slate-100 pb-5"><span className="grid size-10 place-items-center rounded-xl bg-cyan-50 text-[#0F888D]"><UserRound className="size-5"/></span><div><h2 className="font-bold text-[#163A5F]">Personal information</h2><p className="text-sm text-slate-500">Fields are editable locally for validation preview.</p></div></div><form className="mt-6 grid gap-5 sm:grid-cols-2" onSubmit={(event) => event.preventDefault()} noValidate><div className="space-y-2 sm:col-span-2"><Label htmlFor="fullName">Full name</Label><Input id="fullName" {...field("fullName")}/><p id="fullName-feedback" className={`text-xs ${touched.fullName && errors.fullName ? "text-rose-600" : "text-slate-500"}`} aria-live="polite">{touched.fullName ? errors.fullName || "Name looks good." : "Use the name shown to other administrators."}</p></div><div className="space-y-2"><Label htmlFor="email">Email address</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400"/><Input id="email" type="email" className="pl-9" {...field("email")}/></div><p id="email-feedback" className={`text-xs ${touched.email && errors.email ? "text-rose-600" : "text-slate-500"}`} aria-live="polite">{touched.email ? errors.email || "Email format is valid." : "A preview address only."}</p></div><div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" type="tel" {...field("phone")}/><p id="phone-feedback" className={`text-xs ${touched.phone && errors.phone ? "text-rose-600" : "text-slate-500"}`} aria-live="polite">{touched.phone ? errors.phone || "Phone format is valid." : "Do not enter a real number in preview mode."}</p></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="title">Administrative title</Label><Input id="title" {...field("title")}/><p id="title-feedback" className={`text-xs ${touched.title && errors.title ? "text-rose-600" : "text-slate-500"}`} aria-live="polite">{touched.title ? errors.title || "Title looks good." : "For display within the admin workspace."}</p></div><div className="flex flex-col gap-2 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">Changes remain in this browser view and are discarded on reload.</p><Button type="submit" disabled>Save profile — API required</Button></div></form></section>
    </div>
  </main>;
}
