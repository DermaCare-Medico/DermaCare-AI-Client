"use client";

import { useMemo, useState } from "react";
import { Banknote, CalendarDays, CircleDollarSign, Percent, Search } from "lucide-react";

import { PageHeader } from "@/components/doctor/PageHeader";
import { StatCard } from "@/components/doctor/StatCard";
import { DataState } from "@/components/shared/DataState";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/api/format";
import {
  useGetDoctorEarningsSummaryQuery,
  useGetDoctorEarningsHistoryQuery,
} from "@/redux/api/doctorApi";

interface UnifiedEarning {
  id: string;
  appointmentId: string;
  patientLabel: string;
  consultationDate: string;
  gross: number;
  commission: number;
  net: number;
  status: "Included" | "Pending";
  month: string;
}

export default function DoctorEarningsPage() {
  const [month, setMonth] = useState("All");
  const [query, setQuery] = useState("");

  const { data: rawSummary, isLoading: summaryLoading } = useGetDoctorEarningsSummaryQuery();
  const {
    data: rawHistory,
    isLoading: historyLoading,
    isError,
    error,
    refetch,
  } = useGetDoctorEarningsHistoryQuery();

  const earnings = useMemo<UnifiedEarning[]>(() => {
    if (!rawHistory) return [];
    const body = (rawHistory as { data?: unknown }).data ?? rawHistory;
    let list: Array<Record<string, unknown>> = [];
    if (Array.isArray(body)) {
      list = body as Array<Record<string, unknown>>;
    } else if (body && typeof body === "object" && "earnings" in body && Array.isArray((body as { earnings: unknown }).earnings)) {
      list = (body as { earnings: Array<Record<string, unknown>> }).earnings;
    } else {
      return [];
    }

    return list.map((item, idx) => {
      const gross = Number(item.gross || item.fee || item.amount || 0);
      const commission = Number(item.commission || item.platformFee || gross * 0.15);
      const net = Number(item.net || item.doctorShare || gross - commission);
      const d = item.consultationDate || item.date || item.createdAt;
      const dateObj = d ? new Date(String(d)) : new Date();
      const monthName = dateObj.toLocaleString("default", { month: "long" });

      return {
        id: String(item.id || `earn-${idx}`),
        appointmentId: String(item.appointmentId || `APT-${1000 + idx}`),
        patientLabel: String(item.patientLabel || item.patientName || "Patient"),
        consultationDate: dateObj.toLocaleDateString(),
        gross,
        commission,
        net,
        status: (item.status === "Included" || item.isSettled ? "Included" : "Pending") as "Included" | "Pending",
        month: monthName,
      };
    });
  }, [rawHistory]);

  const filtered = useMemo(() => {
    return earnings.filter(
      (item) =>
        (month === "All" || item.month.toLowerCase() === month.toLowerCase()) &&
        `${item.appointmentId} ${item.patientLabel}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [earnings, month, query]);

  const summaryObj = (rawSummary as { data?: Record<string, unknown> })?.data;
  const totals = useMemo(() => {
    if (summaryObj) {
      const gross = Number(summaryObj.totalGross || summaryObj.gross || 0);
      const commission = Number(summaryObj.totalCommission || summaryObj.commission || gross * 0.15);
      const net = Number(summaryObj.totalNet || summaryObj.net || gross - commission);
      if (gross > 0) return { gross, commission, net };
    }
    return filtered.reduce(
      (sum, item) => ({
        gross: sum.gross + item.gross,
        commission: sum.commission + item.commission,
        net: sum.net + item.net,
      }),
      { gross: 0, commission: 0, net: 0 }
    );
  }, [summaryObj, filtered]);

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Financial overview"
        title="Earnings"
        description="Review consultation earnings based on platform commission and doctor share."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Gross earnings"
          value={formatMoney(totals.gross, "USD")}
          icon={CircleDollarSign}
          hint="100% consultation value"
        />
        <StatCard
          title="Platform commission"
          value={formatMoney(totals.commission, "USD")}
          icon={Percent}
          hint="15% platform commission"
        />
        <StatCard
          title="Net earnings"
          value={formatMoney(totals.net, "USD")}
          icon={Banknote}
          hint="85% doctor share"
        />
      </div>
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <span className="sr-only">Search earnings</span>
          <Input
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search appointment or patient label"
          />
        </label>
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          aria-label="Filter by month"
        >
          <option>All</option>
          <option>October</option>
          <option>September</option>
          <option>August</option>
        </select>
      </div>
      <DataState
        isLoading={summaryLoading || historyLoading}
        isError={isError}
        error={error}
        isEmpty={filtered.length === 0}
        emptyTitle="No earnings records found"
        emptyMessage={query || month !== "All" ? "No earnings match your filters." : "You have not completed any paid consultations yet."}
        onRetry={refetch}
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-[#163A5F]">Appointment breakdown</h2>
            <p className="mt-1 text-xs text-slate-500">
              Gross, 15% commission, and 85% net values by completed consultation.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Appointment</th>
                  <th className="px-5 py-3">Consultation</th>
                  <th className="px-5 py-3">Gross</th>
                  <th className="px-5 py-3">Commission</th>
                  <th className="px-5 py-3">Net</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="text-slate-600">
                    <td className="px-5 py-4">
                      <strong className="block text-slate-800">{item.appointmentId}</strong>
                      <span className="text-xs">{item.patientLabel}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={15} />
                        {item.consultationDate}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium">{formatMoney(item.gross, "USD")}</td>
                    <td className="px-5 py-4 text-rose-600">- {formatMoney(item.commission, "USD")}</td>
                    <td className="px-5 py-4 font-bold text-emerald-700">{formatMoney(item.net, "USD")}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.status === "Included"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
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
        </div>
      </DataState>
    </section>
  );
}
