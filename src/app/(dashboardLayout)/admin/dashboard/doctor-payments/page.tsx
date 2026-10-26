"use client";

import { useMemo, useState } from "react";
import { Banknote, Eye, Percent, WalletCards, AlertCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "../_components/AdminPreviewUI";
import {
  useGetAdminDoctorPaymentsQuery,
  useSendAdminDoctorPayoutMutation,
  useGenerateAdminDoctorPayoutMutation,
} from "@/redux/api/adminApi";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const money = (value: number) => `BDT ${Number(value || 0).toLocaleString()}`;

export default function DoctorPaymentsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);

  // Generate modal states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genDoctorId, setGenDoctorId] = useState("");
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genNotes, setGenNotes] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminDoctorPaymentsQuery({
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const [sendPayout, { isLoading: isSending }] = useSendAdminDoctorPayoutMutation();
  const [generatePayout, { isLoading: isGenerating }] = useGenerateAdminDoctorPayoutMutation();

  const rawPayments = data?.data ?? data;
  const paymentList: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(rawPayments)) {
      return rawPayments.filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null);
    }
    if (rawPayments && typeof rawPayments === "object") {
      const payProp = (rawPayments as Record<string, unknown>).payments;
      if (Array.isArray(payProp)) {
        return payProp.filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null);
      }
      const itemProp = (rawPayments as Record<string, unknown>).items;
      if (Array.isArray(itemProp)) {
        return itemProp.filter((p): p is Record<string, unknown> => typeof p === "object" && p !== null);
      }
    }
    return [];
  }, [rawPayments]);

  const totals = useMemo(() => {
    return paymentList.reduce<{ gross: number; commission: number; net: number }>(
      (sum, item) => ({
        gross: sum.gross + (Number(item.grossAmount ?? item.gross ?? item.amount) || 0),
        commission: sum.commission + (Number(item.commissionAmount ?? item.commission) || 0),
        net: sum.net + (Number(item.netAmount ?? item.net) || 0),
      }),
      { gross: 0, commission: 0, net: 0 }
    );
  }, [paymentList]);

  const handleSendPayout = async (payoutId: string) => {
    try {
      await sendPayout(payoutId).unwrap();
      toast.success("Payout marked as sent/processed.");
      setSelected(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to send payout.");
      toast.error(message);
    }
  };

  const handleGeneratePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genDoctorId.trim()) {
      toast.error("Please enter a valid Doctor ID.");
      return;
    }
    try {
      await generatePayout({
        doctorId: genDoctorId.trim(),
        year: Number(genYear),
        month: Number(genMonth),
        notes: genNotes.trim() || undefined,
      }).unwrap();
      toast.success("Monthly payout generated successfully.");
      setShowGenerateModal(false);
      setGenDoctorId("");
      setGenNotes("");
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to generate monthly payout.");
      toast.error(message);
    }
  };

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Finance operations"
        title="Doctor payments"
        description="Review doctor monthly earnings calculations and manage platform payouts."
        action={
          <Button onClick={() => setShowGenerateModal(true)}>
            <WalletCards className="size-4" /> Generate Monthly Payout
          </Button>
        }
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load doctor payments from backend.</span>
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
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Total Consultations</p>
            <span className="grid size-9 place-items-center rounded-xl bg-cyan-50 text-[#0F888D]">
              <Banknote className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#163A5F]">{money(totals.gross)}</p>
          <p className="mt-1 text-xs text-slate-500">Gross consultation billings</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Platform Commission</p>
            <span className="grid size-9 place-items-center rounded-xl bg-cyan-50 text-[#0F888D]">
              <Percent className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#163A5F]">{money(totals.commission)}</p>
          <p className="mt-1 text-xs text-slate-500">Total retained platform fees</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-600">Doctor Net Payable</p>
            <span className="grid size-9 place-items-center rounded-xl bg-cyan-50 text-[#0F888D]">
              <WalletCards className="size-4" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-4 text-2xl font-bold text-emerald-700">{money(totals.net)}</p>
          <p className="mt-1 text-xs text-slate-500">Total disbursed or pending payouts</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Payment filters">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mb-1 block text-xs font-semibold text-slate-600">Filter Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All payout statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#0F888D]" />
            Loading doctor payments...
          </div>
        </div>
      ) : paymentList.length === 0 ? (
        <AdminEmptyState title="No payout records found" description="No doctor payment settlements match this criteria." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentList.map((payment) => {
                const id = String(payment.id ?? payment._id ?? "PAY");
                const docObj = (typeof payment.doctor === "object" && payment.doctor !== null ? payment.doctor : {}) as Record<string, unknown>;
                const userObj = (typeof docObj.user === "object" && docObj.user !== null ? docObj.user : {}) as Record<string, unknown>;
                const docName = String(userObj.name ?? payment.doctorName ?? "Doctor");

                const gross = Number(payment.grossAmount ?? payment.gross ?? payment.amount ?? 0);
                const comm = Number(payment.commissionAmount ?? payment.commission ?? 0);
                const net = Number(payment.netAmount ?? payment.net ?? gross - comm);
                const pStatus = String(payment.status ?? "PENDING");

                return (
                  <TableRow key={id}>
                    <TableCell className="font-semibold text-[#163A5F]">{id}</TableCell>
                    <TableCell>
                      <p className="font-medium">{docName}</p>
                    </TableCell>
                    <TableCell>{money(gross)}</TableCell>
                    <TableCell>{money(comm)}</TableCell>
                    <TableCell className="font-semibold">{money(net)}</TableCell>
                    <TableCell>
                      <StatusBadge value={pStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelected(payment)}>
                        <Eye className="size-4" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Details & Disburse Dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payment Breakdown</DialogTitle>
            <DialogDescription>
              Settlement details for{" "}
              {String(
                ((typeof selected?.doctor === "object" && selected?.doctor !== null)
                  ? ((selected.doctor as Record<string, unknown>).user as Record<string, unknown> | undefined)?.name
                  : "") ??
                selected?.doctorName ??
                "Doctor"
              )}.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">Reference</p>
                  <p className="font-semibold text-[#163A5F]">{String(selected.id ?? selected._id)}</p>
                </div>
                <StatusBadge value={String(selected.status ?? "PENDING")} />
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-slate-500">Gross</dt>
                  <dd className="font-semibold">
                    {money(Number(selected.grossAmount ?? selected.gross ?? selected.amount ?? 0))}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Commission</dt>
                  <dd className="font-semibold">
                    - {money(Number(selected.commissionAmount ?? selected.commission ?? 0))}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Net Earnings</dt>
                  <dd className="font-bold text-emerald-700">
                    {money(Number(selected.netAmount ?? selected.net ?? 0))}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Date</dt>
                  <dd>
                    {selected.createdAt ? new Date(String(selected.createdAt)).toLocaleDateString() : "Recent"}
                  </dd>
                </div>
              </dl>
              {selected.status !== "PAID" && (
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isSending}
                  onClick={() => handleSendPayout(String(selected.id ?? selected._id))}
                >
                  <Send className="size-4" />
                  {isSending ? "Processing Payout..." : "Send / Finalize Doctor Payout"}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Payout Dialog */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Monthly Doctor Payout</DialogTitle>
            <DialogDescription>
              Calculate payable completed consultations and generate a payout statement.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGeneratePayout} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="gen-doctor-id">
                Doctor ID *
              </label>
              <Input
                id="gen-doctor-id"
                required
                placeholder="Doctor User ID or Profile ID"
                value={genDoctorId}
                onChange={(e) => setGenDoctorId(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600" htmlFor="gen-year">
                  Year *
                </label>
                <Input
                  id="gen-year"
                  type="number"
                  min="2020"
                  max="2035"
                  required
                  value={genYear}
                  onChange={(e) => setGenYear(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600" htmlFor="gen-month">
                  Month (1-12) *
                </label>
                <Input
                  id="gen-month"
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={genMonth}
                  onChange={(e) => setGenMonth(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="gen-notes">
                Notes (Optional)
              </label>
              <Input
                id="gen-notes"
                placeholder="e.g. Monthly payout for consultations"
                value={genNotes}
                onChange={(e) => setGenNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Payout"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
