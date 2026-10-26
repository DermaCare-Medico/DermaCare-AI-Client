"use client";

import { useMemo, useState } from "react";
import { Banknote, CalendarDays, CircleDollarSign, Eye, Landmark, Percent } from "lucide-react";

import { PageHeader } from "@/components/doctor/PageHeader";
import { StatCard } from "@/components/doctor/StatCard";
import { DataState } from "@/components/shared/DataState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/api/format";
import { useGetDoctorPayoutHistoryQuery } from "@/redux/api/doctorApi";

type PayoutStatus = "Pending" | "Scheduled" | "Settled" | "On hold";

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700",
  Scheduled: "bg-blue-50 text-blue-700",
  Settled: "bg-emerald-50 text-emerald-700",
  "On hold": "bg-rose-50 text-rose-700",
  PAID: "bg-emerald-50 text-emerald-700",
};

interface UnifiedPayout {
  id: string;
  period: string;
  status: PayoutStatus;
  gross: number;
  commission: number;
  net: number;
  appointments: number;
  settlementDate?: string;
  settlementReference?: string;
  note?: string;
}

export default function DoctorPayoutsPage() {
  const [status, setStatus] = useState<"All" | PayoutStatus>("All");
  const [selected, setSelected] = useState<UnifiedPayout | null>(null);

  const queryParams = status !== "All" ? { status: status.toUpperCase() } : undefined;
  const { data: rawData, isLoading, isError, error, refetch } = useGetDoctorPayoutHistoryQuery(queryParams);

  const payouts = useMemo<UnifiedPayout[]>(() => {
    if (!rawData) return [];
    const body = (rawData as { data?: unknown }).data ?? rawData;
    let list: Array<Record<string, unknown>> = [];
    if (Array.isArray(body)) {
      list = body as Array<Record<string, unknown>>;
    } else if (body && typeof body === "object" && "payouts" in body && Array.isArray((body as { payouts: unknown }).payouts)) {
      list = (body as { payouts: Array<Record<string, unknown>> }).payouts;
    } else {
      return [];
    }

    return list.map((item, idx) => {
      const gross = Number(item.gross || item.amount || 0);
      const commission = Number(item.commission || gross * 0.15);
      const net = Number(item.net || item.netAmount || gross - commission);
      const rawStat = String(item.status || "PENDING").toUpperCase();
      let normStatus: PayoutStatus = "Pending";
      if (rawStat === "PAID" || rawStat === "SETTLED") normStatus = "Settled";
      else if (rawStat === "SCHEDULED") normStatus = "Scheduled";
      else if (rawStat === "ON_HOLD" || rawStat === "HELD") normStatus = "On hold";

      return {
        id: String(item.id || item.payoutId || `PAY-${202600 + idx}`),
        period: String(item.period || item.month || "Current Month"),
        status: normStatus,
        gross,
        commission,
        net,
        appointments: Number(item.appointments || item.consultationCount || 0),
        settlementDate: item.settledAt || item.settlementDate ? new Date(String(item.settledAt || item.settlementDate)).toLocaleDateString() : undefined,
        settlementReference: item.reference ? String(item.reference) : undefined,
        note: item.note ? String(item.note) : undefined,
      };
    });
  }, [rawData]);

  const filtered = useMemo(() => {
    return status === "All" ? payouts : payouts.filter((item) => item.status === status);
  }, [payouts, status]);

  const pendingNet = payouts
    .filter((item) => item.status === "Pending" || item.status === "Scheduled")
    .reduce((sum, item) => sum + item.net, 0);

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Financial settlements"
        title="Payouts"
        description="Review monthly settlement records, calculations, and disbursements."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Awaiting settlement"
          value={formatMoney(pendingNet, "USD")}
          icon={Banknote}
          hint="Pending + scheduled totals"
        />
        <StatCard
          title="Platform commission"
          value="15%"
          icon={Percent}
          hint="Commercial agreement split"
        />
        <StatCard
          title="Doctor share"
          value="85%"
          icon={CircleDollarSign}
          hint="Net earnings share"
        />
        <StatCard
          title="Settlement method"
          value="Bank Transfer"
          icon={Landmark}
          hint="Verified clinician account"
        />
      </div>
      <div className="mb-5 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3">
        {(["All", "Pending", "Scheduled", "Settled", "On hold"] as const).map((item) => (
          <Button
            key={item}
            variant={status === item ? "default" : "ghost"}
            className={status === item ? "bg-[#0F888D] hover:bg-[#0C7479]" : ""}
            onClick={() => setStatus(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <DataState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={filtered.length === 0}
        emptyTitle="No payout records found"
        emptyMessage={status !== "All" ? "No payout records match this filter status." : "No payouts have been generated yet."}
        onRetry={refetch}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((payout) => (
            <article key={payout.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-[#0F888D]">{payout.id}</p>
                  <h2 className="mt-1 text-lg font-bold text-[#163A5F]">{payout.period}</h2>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[payout.status] || "bg-slate-100 text-slate-700"}`}>
                  {payout.status}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[11px] uppercase text-slate-400">Gross</span>
                  <strong className="mt-1 block text-sm text-slate-700">{formatMoney(payout.gross, "USD")}</strong>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[11px] uppercase text-slate-400">15% fee</span>
                  <strong className="mt-1 block text-sm text-rose-600">{formatMoney(payout.commission, "USD")}</strong>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <span className="text-[11px] uppercase text-emerald-600">Net 85%</span>
                  <strong className="mt-1 block text-sm text-emerald-800">{formatMoney(payout.net, "USD")}</strong>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className="text-xs text-slate-500">{payout.appointments} consultations</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelected(payout)}
                  aria-label={`View payout details for ${payout.period}`}
                >
                  <Eye size={15} /> View details
                </Button>
              </div>
            </article>
          ))}
        </div>
      </DataState>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payout detail</DialogTitle>
            <DialogDescription>
              Settlement calculation and disbursement breakdown.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">Settlement period</p>
                  <strong className="text-[#163A5F]">{selected.period}</strong>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[selected.status] || "bg-slate-100 text-slate-700"}`}>
                  {selected.status}
                </span>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Gross consultations ({selected.appointments})</dt>
                  <dd className="font-semibold">{formatMoney(selected.gross, "USD")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Platform commission (15%)</dt>
                  <dd className="font-semibold text-rose-600">- {formatMoney(selected.commission, "USD")}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <dt className="font-semibold">Net doctor share (85%)</dt>
                  <dd className="font-bold text-emerald-700">{formatMoney(selected.net, "USD")}</dd>
                </div>
              </dl>
              {selected.settlementDate && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarDays size={16} /> Settled on {selected.settlementDate}
                </div>
              )}
              {selected.settlementReference && (
                <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                  Reference: {selected.settlementReference}
                </p>
              )}
              {selected.note && <p className="text-xs leading-5 text-slate-500">{selected.note}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
