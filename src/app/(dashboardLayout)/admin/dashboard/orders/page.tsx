"use client";

import { useMemo, useState } from "react";
import { Eye, Search, SlidersHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "../_components/AdminPreviewUI";
import { useGetAdminOrdersQuery, useUpdateAdminOrderStatusMutation } from "@/redux/api/adminApi";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [statusOrder, setStatusOrder] = useState<Record<string, unknown> | null>(null);
  const [nextStatus, setNextStatus] = useState("PROCESSING");
  const [statusReason, setStatusReason] = useState("");

  const { data, isLoading, isError, refetch } = useGetAdminOrdersQuery({
    status: status === "ALL" ? undefined : status,
  });

  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateAdminOrderStatusMutation();

  const rawOrders = data?.data ?? data;
  const orderList: Record<string, unknown>[] = useMemo(() => {
    if (Array.isArray(rawOrders)) {
      return rawOrders.filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null);
    }
    if (rawOrders && typeof rawOrders === "object") {
      const ordersProp = (rawOrders as Record<string, unknown>).orders;
      if (Array.isArray(ordersProp)) {
        return ordersProp.filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null);
      }
      const itemsProp = (rawOrders as Record<string, unknown>).items;
      if (Array.isArray(itemsProp)) {
        return itemsProp.filter((o): o is Record<string, unknown> => typeof o === "object" && o !== null);
      }
    }
    return [];
  }, [rawOrders]);

  const orders = useMemo(() => {
    return orderList.filter((order) => {
      const id = String(order.id ?? order._id ?? "");
      const patObj = (typeof order.patient === "object" && order.patient !== null ? order.patient : {}) as Record<string, unknown>;
      const userObj = (typeof order.user === "object" && order.user !== null ? order.user : patObj.user) as Record<string, unknown> | undefined;
      const patName = String(userObj?.name ?? order.patientName ?? "");

      const term = search.toLowerCase();
      const matchSearch = `${id} ${patName}`.toLowerCase().includes(term);
      const matchStatus = status === "ALL" || String(order.status ?? "PENDING") === status;
      return matchSearch && matchStatus;
    });
  }, [orderList, search, status]);

  const total = (order: Record<string, unknown>) => {
    if (order.totalAmount !== undefined) return Number(order.totalAmount);
    if (order.amount !== undefined) return Number(order.amount);
    if (Array.isArray(order.items)) {
      return order.items.reduce((sum: number, it: unknown) => {
        const itemObj = (typeof it === "object" && it !== null ? it : {}) as Record<string, unknown>;
        return sum + Number(itemObj.price ?? 0) * Number(itemObj.quantity ?? 1);
      }, 0);
    }
    return 0;
  };

  const handleUpdateStatus = async () => {
    if (!statusOrder) return;
    const orderId = String(statusOrder.id ?? statusOrder._id);
    try {
      await updateOrderStatus({
        orderId,
        status: nextStatus,
        reason: statusReason.trim() || undefined,
      }).unwrap();
      toast.success(`Order status updated to ${nextStatus}.`);
      setStatusOrder(null);
      setStatusReason("");
      setSelected(null);
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown>;
      const errorData = errorObj?.data as Record<string, unknown> | undefined;
      const message = String(errorData?.message ?? errorObj?.message ?? "Failed to update order status.");
      toast.error(message);
    }
  };

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        eyebrow="Pharmacy operations"
        title="Orders"
        description="Track payments, medicine items, delivery progress, and fulfillment status."
      />

      {isError && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>Could not load orders from backend.</span>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_230px]">
          <label className="relative">
            <span className="sr-only">Search orders</span>
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search order ID or patient"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label>
            <span className="sr-only">Order status</span>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="ALL">All fulfillment statuses</option>
              {orderStatuses.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {isLoading ? (
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#0F888D]" />
            Loading orders catalog...
          </div>
        </div>
      ) : orders.length === 0 ? (
        <AdminEmptyState title="No orders found" description="Try adjusting the search query or status filter." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const id = String(order.id ?? order._id ?? "ORD");
                const patObj = (typeof order.patient === "object" && order.patient !== null ? order.patient : {}) as Record<string, unknown>;
                const userObj = (typeof order.user === "object" && order.user !== null ? order.user : patObj.user) as Record<string, unknown> | undefined;
                const patName = String(userObj?.name ?? order.patientName ?? "Patient");

                const itemCount = Array.isArray(order.items)
                  ? order.items.reduce((sum: number, it: unknown) => {
                      const itemObj = (typeof it === "object" && it !== null ? it : {}) as Record<string, unknown>;
                      return sum + Number(itemObj.quantity ?? 1);
                    }, 0)
                  : Number(order.itemCount ?? 1);

                const pStatus = String(order.paymentStatus ?? (order.isPaid ? "PAID" : "PENDING"));
                const ordStatus = String(order.status ?? "PENDING");
                const orderDate = order.createdAt
                  ? new Date(String(order.createdAt)).toLocaleDateString()
                  : String(order.placedAt ?? "Recent");

                return (
                  <TableRow key={id}>
                    <TableCell>
                      <p className="font-semibold text-[#163A5F]">{id}</p>
                      <p className="text-xs text-slate-500">{orderDate}</p>
                    </TableCell>
                    <TableCell>{patName}</TableCell>
                    <TableCell>{itemCount}</TableCell>
                    <TableCell>BDT {total(order).toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusBadge value={pStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge value={ordStatus} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelected(order)}
                          aria-label={`View ${id}`}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setNextStatus(ordStatus);
                            setStatusOrder(order);
                            setStatusReason("");
                          }}
                          aria-label={`Update status for ${id}`}
                        >
                          <SlidersHorizontal className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>
      )}

      {/* Order details Dialog */}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{String(selected?.id ?? selected?._id ?? "Order details")}</DialogTitle>
            <DialogDescription>Item, delivery, and payment information.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={String(selected.status ?? "PENDING")} />
                <StatusBadge value={String(selected.paymentStatus ?? (selected.isPaid ? "PAID" : "PENDING"))} />
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Deliver to</p>
                <p className="mt-1 font-medium text-[#163A5F]">
                  {String(
                    ((typeof selected.patient === "object" && selected.patient !== null)
                      ? ((selected.patient as Record<string, unknown>).user as Record<string, unknown> | undefined)?.name
                      : "") ??
                    ((typeof selected.user === "object" && selected.user !== null)
                      ? (selected.user as Record<string, unknown>).name
                      : "") ??
                    selected.patientName ??
                    "Customer"
                  )}
                </p>
                <p className="text-sm text-slate-600">
                  {String(selected.shippingAddress ?? selected.address ?? "Address on record")}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#163A5F]">Items</h3>
                <div className="mt-2 divide-y rounded-xl border">
                  {Array.isArray(selected.items) && selected.items.length > 0 ? (
                    selected.items.map((item: unknown, idx: number) => {
                      const itemObj = (typeof item === "object" && item !== null ? item : {}) as Record<string, unknown>;
                      const medObj = (typeof itemObj.medicine === "object" && itemObj.medicine !== null ? itemObj.medicine : {}) as Record<string, unknown>;
                      const medName = String(medObj.name ?? itemObj.name ?? "Medicine");
                      const qty = Number(itemObj.quantity ?? 1);
                      const price = Number(itemObj.price ?? 0);

                      return (
                        <div key={idx} className="flex justify-between gap-4 p-3 text-sm">
                          <div>
                            <p className="font-medium">{medName}</p>
                            <p className="text-slate-500">Quantity: {qty}</p>
                          </div>
                          <p className="font-semibold">
                            BDT {(price * qty).toLocaleString()}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-sm text-slate-500">No items listed.</div>
                  )}
                  <div className="flex justify-between p-3 font-bold">
                    <span>Total</span>
                    <span>BDT {total(selected).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update status Dialog */}
      <Dialog open={Boolean(statusOrder)} onOpenChange={(open) => !open && setStatusOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update fulfillment status for order <strong>{String(statusOrder?.id ?? statusOrder?._id)}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="order-next-status">
                New Status
              </label>
              <select
                id="order-next-status"
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
              >
                {orderStatuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600" htmlFor="status-reason">
                Status / Courier Note (Optional)
              </label>
              <Textarea
                id="status-reason"
                rows={2}
                placeholder="e.g. Package dispatched with courier."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStatusOrder(null)}>
                Cancel
              </Button>
              <Button disabled={isUpdating} onClick={handleUpdateStatus}>
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
