"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, CreditCard, PackageCheck, Search, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { orderPreviews, type OrderStatus } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

const statuses: Array<"All" | OrderStatus> = ["All", "Pending", "Processing", "Packed", "Out for delivery", "Delivered", "Cancelled"];
const tone = (status: OrderStatus) => status === "Delivered" ? "success" : status === "Cancelled" ? "danger" : status === "Out for delivery" ? "info" : "warning";

export default function PatientOrdersPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");
  const orders = useMemo(() => orderPreviews.filter((order) => (status === "All" || order.status === status) && `${order.id} ${order.items.map((item) => item.name).join(" ")}`.toLowerCase().includes(query.toLowerCase())), [query, status]);

  return <div className={s.page}>
    <PatientPageHeader eyebrow="Pharmacy" title="Order history" description="Track medicine orders, payment state, and delivery progress from one place." action={<Button asChild className={s.primaryButton}><Link href="/store">Explore store</Link></Button>} />
    <PreviewNotice />
    <section className={s.toolbar} aria-label="Order filters"><label className={s.search}><Search size={17} /><span className="sr-only">Search orders</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order ID or medicine" /></label><select className={s.select} value={status} onChange={(event) => setStatus(event.target.value as (typeof statuses)[number])} aria-label="Filter orders by status">{statuses.map((item) => <option key={item}>{item}</option>)}</select></section>
    {orders.length === 0 ? <PageState state="empty" title="No orders match" message="Try changing your search or delivery-status filter." /> : <section className={s.grid}>{orders.map((order) => <article className={s.card} key={order.id}>
      <div className={s.cardTop}><div><p className={s.eyebrow}>Order {order.id}</p><h2>{order.items.length} {order.items.length === 1 ? "item" : "items"}</h2></div><StatusPill tone={tone(order.status)}>{order.status}</StatusPill></div>
      <div className={s.metaGrid}><div className={s.metaItem}><span>Placed</span><strong><CalendarDays size={14} style={{ display: "inline", marginRight: 6 }} />{order.placedOn}</strong></div><div className={s.metaItem}><span>Total</span><strong>{order.total}</strong></div></div>
      <div className={s.divider} /><div className={s.iconLine}><CreditCard size={16} />{order.paymentStatus}</div><div className={s.iconLine} style={{ marginTop: 9 }}>{order.status === "Delivered" ? <PackageCheck size={16} /> : <Truck size={16} />}{order.estimatedDelivery}</div>
      <p className={s.muted}>{order.items.map((item) => `${item.quantity}× ${item.name}`).join(" · ")}</p>
      <div className={s.actions}><Button asChild variant="outline"><Link href={`/patient/orders/${order.id}`}>View order <ChevronRight size={15} /></Link></Button></div>
    </article>)}</section>}
  </div>;
}

