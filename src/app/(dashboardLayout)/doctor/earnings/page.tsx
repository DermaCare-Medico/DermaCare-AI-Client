"use client";

import { useMemo, useState } from "react";
import { Banknote, CalendarDays, CircleDollarSign, Percent, Search } from "lucide-react";

import { PageHeader } from "@/components/doctor/PageHeader";
import { StatCard } from "@/components/doctor/StatCard";
import { DataState } from "@/components/shared/DataState";
import { Input } from "@/components/ui/input";
import { earningPreviews, formatPreviewMoney } from "@/src/app/(dashboardLayout)/doctor/_components/doctor-preview-data";

export default function DoctorEarningsPage() {
  const [month, setMonth] = useState("All");
  const [query, setQuery] = useState("");
  const earnings = useMemo(() => earningPreviews.filter((item) => (month === "All" || item.month === month) && `${item.appointmentId} ${item.patientLabel}`.toLowerCase().includes(query.toLowerCase())), [month, query]);
  const totals = useMemo(() => earnings.reduce((sum, item) => ({ gross: sum.gross + item.gross, commission: sum.commission + item.commission, net: sum.net + item.net }), { gross: 0, commission: 0, net: 0 }), [earnings]);

  return <section className="mx-auto max-w-7xl">
    <PageHeader eyebrow="Financial preview" title="Earnings" description="Review illustrative consultation earnings using a 15% platform commission and 85% doctor share." />
    <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900" role="note">Preview figures only. These values are not invoices, account balances, tax records, or evidence of payment.</div>
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><StatCard title="Gross earnings" value={formatPreviewMoney(totals.gross)} icon={CircleDollarSign} hint="100% consultation value" /><StatCard title="Platform commission" value={formatPreviewMoney(totals.commission)} icon={Percent} hint="15% preview commission" /><StatCard title="Net earnings" value={formatPreviewMoney(totals.net)} icon={Banknote} hint="85% preview doctor share" /></div>
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} /><span className="sr-only">Search earnings</span><Input className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search appointment or patient label" /></label><select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700" value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Filter by month"><option>All</option><option>October</option><option>September</option><option>August</option></select></div>
    <DataState isEmpty={earnings.length === 0} emptyTitle="No earnings match" emptyMessage="Adjust the month or search terms to view preview records.">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="font-bold text-[#163A5F]">Appointment breakdown</h2><p className="mt-1 text-xs text-slate-500">Gross, 15% commission, and 85% net values by completed consultation.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Appointment</th><th className="px-5 py-3">Consultation</th><th className="px-5 py-3">Gross</th><th className="px-5 py-3">Commission</th><th className="px-5 py-3">Net</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{earnings.map((item) => <tr key={item.id} className="text-slate-600"><td className="px-5 py-4"><strong className="block text-slate-800">{item.appointmentId}</strong><span className="text-xs">{item.patientLabel}</span></td><td className="px-5 py-4"><span className="inline-flex items-center gap-2"><CalendarDays size={15} />{item.consultationDate}</span></td><td className="px-5 py-4 font-medium">{formatPreviewMoney(item.gross)}</td><td className="px-5 py-4 text-rose-600">− {formatPreviewMoney(item.commission)}</td><td className="px-5 py-4 font-bold text-emerald-700">{formatPreviewMoney(item.net)}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "Included" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span></td></tr>)}</tbody></table></div></div>
    </DataState>
  </section>;
}

