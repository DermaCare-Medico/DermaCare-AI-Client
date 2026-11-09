"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, CreditCard, PackageCheck, Search, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { useGetPatientOrdersQuery } from "@/redux/api/orderApi";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Packed"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

const statuses: Array<"All" | OrderStatus> = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Out for delivery",
  "Delivered",
  "Cancelled",
];

const tone = (status: string) =>
  status === "Delivered"
    ? "success"
    : status === "Confirmed"
    ? "success"
    : status === "Cancelled"
    ? "danger"
    : status === "Out for delivery"
    ? "info"
    : "warning";

interface UnifiedOrder {
  id: string;
  placedOn: string;
  status: OrderStatus;
  paymentStatus: "Paid" | "Pending" | "Refunded" | "Payment pending";
  total: string;
  estimatedDelivery: string;
  items: Array<{ name: string; quantity: number }>;
}

export default function PatientOrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");

  const queryParams = status !== "All" ? { status: status.toUpperCase() } : undefined;
  const { data: rawData, isLoading, isError, refetch } = useGetPatientOrdersQuery(queryParams);
  const confirmedTotal = rawData?.pagination?.confirmedTotal;

  const orders = useMemo<UnifiedOrder[]>(() => {
    if (!rawData) return [];
    const body = (rawData as { data?: unknown }).data ?? rawData;
    let list: Array<Record<string, unknown>> = [];
    if (Array.isArray(body)) {
      list = body as Array<Record<string, unknown>>;
    } else if (body && typeof body === "object" && "orders" in body && Array.isArray((body as { orders: unknown }).orders)) {
      list = (body as { orders: Array<Record<string, unknown>> }).orders;
    } else {
      return [];
    }

    return list.map((order) => {
      const rawStatus = String(order.status || "PENDING").toLowerCase();
      let normStatus: OrderStatus = "Pending";
      if (rawStatus.includes("confirm")) normStatus = "Confirmed";
      else if (rawStatus.includes("deliv")) normStatus = "Delivered";
      else if (rawStatus.includes("cancel")) normStatus = "Cancelled";
      else if (rawStatus.includes("out")) normStatus = "Out for delivery";
      else if (rawStatus.includes("pack")) normStatus = "Packed";
      else if (rawStatus.includes("proc")) normStatus = "Processing";

      const rawPay = String(order.paymentStatus || "PENDING").toLowerCase();
      let normPay: "Paid" | "Pending" | "Refunded" = "Pending";
      if (rawPay === "paid") normPay = "Paid";
      else if (rawPay.includes("refund")) normPay = "Refunded";

      const rawItems = Array.isArray(order.items) ? order.items : [];
      const totalAmount = Number(order.totalAmount || order.total || 0);

      return {
        id: String(order.id || order.orderId || ""),
        placedOn: order.createdAt ? new Date(String(order.createdAt)).toLocaleDateString() : "Recently",
        status: normStatus,
        paymentStatus: normPay,
        total: new Intl.NumberFormat(undefined, { style: "currency", currency: "BDT" }).format(totalAmount),
        estimatedDelivery: String(order.estimatedDelivery || "Standard 2-3 business days"),
        items: rawItems.map((item: Record<string, unknown>) => ({
          name: String(item.medicineName || item.name || "Medicine"),
          quantity: Number(item.quantity) || 1,
        })),
      };
    });
  }, [rawData]);

  const filtered = useMemo(() => {
    return orders.filter(
      (order) =>
        (status === "All" || order.status === status) &&
        `${order.id} ${order.items.map((item) => item.name).join(" ")}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [orders, query, status]);

  return (
    <div className={s.page}>
      <PatientPageHeader
        eyebrow="Pharmacy"
        title="Order history"
        description={`Track medicine orders, payment state, and delivery progress from one place.${typeof confirmedTotal === "number" ? ` ${confirmedTotal} completed ${confirmedTotal === 1 ? "purchase" : "purchases"}.` : ""}`}
        action={
          <Button asChild className={s.primaryButton}>
            <Link href="/store">Explore store</Link>
          </Button>
        }
      />
      <section className={s.toolbar} aria-label="Order filters">
        <label className={s.search}>
          <Search size={17} />
          <span className="sr-only">Search orders</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order ID or medicine"
          />
        </label>
        <select
          className={s.select}
          value={status}
          onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])}
          aria-label="Filter orders by status"
        >
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>

      {isLoading ? (
        <PageState state="loading" title="Loading orders..." message="Fetching your medicine orders." />
      ) : isError ? (
        <PageState
          state="error"
          title="Could not load orders"
          message="Unable to retrieve orders from the server. Please try again."
          onRetry={() => refetch()}
          
        />
      ) : filtered.length === 0 ? (
        <PageState
          state="empty"
          title="No orders found"
          message={query || status !== "All" ? "No orders match your filter criteria." : "You have not placed any medicine orders yet."}
        />
      ) : (
        <section className={s.grid}>
          {filtered.map((order) => (
            <article className={s.card} key={order.id}>
              <div className={s.cardTop}>
                <div>
                  <p className={s.eyebrow}>Order {order.id}</p>
                  <h2>
                    {order.items.length} {order.items.length === 1 ? "item" : "items"}
                  </h2>
                </div>
                <StatusPill tone={tone(order.status)}>{order.status}</StatusPill>
              </div>
              <div className={s.metaGrid}>
                <div className={s.metaItem}>
                  <span>Placed</span>
                  <strong>
                    <CalendarDays size={14} style={{ display: "inline", marginRight: 6 }} />
                    {order.placedOn}
                  </strong>
                </div>
                <div className={s.metaItem}>
                  <span>Total</span>
                  <strong>{order.total}</strong>
                </div>
              </div>
              <div className={s.divider} />
              <div className={s.iconLine}>
                <CreditCard size={16} />
                {order.paymentStatus}
              </div>
              <div className={s.iconLine} style={{ marginTop: 9 }}>
                {order.status === "Delivered" ? <PackageCheck size={16} /> : <Truck size={16} />}
                {order.estimatedDelivery}
              </div>
              <p className={s.muted}>
                {order.items.map((item) => `${item.quantity}x ${item.name}`).join(" - ")}
              </p>
              <div className={s.actions}>
                <Button asChild variant="outline">
                  <Link href={`/patient/orders/${order.id}`}>
                    View order <ChevronRight size={15} />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
