"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, CreditCard, MapPin, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, PreviewNotice, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { orderPreviews } from "@/src/app/(dashboardLayout)/patient/_components/patient-preview-data";

const fulfillmentSteps = ["Order received", "Processing", "Packed", "Out for delivery", "Delivered"];
const statusProgress: Record<string, number> = { Pending: 1, Processing: 2, Packed: 3, "Out for delivery": 4, Delivered: 5, Cancelled: 1 };

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const order = orderPreviews.find((item) => item.id === decodeURIComponent(params.id));
  if (!order) return <div className={s.page}><PageState state="error" title="Order not found" message="This preview order is unavailable. No payment or fulfillment state was changed." /><Button asChild variant="outline"><Link href="/patient/orders"><ArrowLeft size={16} /> Back to orders</Link></Button></div>;

  return <div className={s.page}>
    <PatientPageHeader eyebrow={`Order ${order.id}`} title="Order details" description={`Placed on ${order.placedOn}. Review items, delivery information, and fulfillment progress.`} action={<Button asChild variant="outline"><Link href="/patient/orders"><ArrowLeft size={16} /> All orders</Link></Button>} />
    <PreviewNotice />
    <div className={s.detailsLayout}>
      <div className={s.list}>
        <section className={s.panel}><div className={s.rowBetween}><div><p className={s.eyebrow}>Fulfillment</p><h2>{order.id}</h2></div><StatusPill tone={order.status === "Delivered" ? "success" : order.status === "Cancelled" ? "danger" : "info"}>{order.status}</StatusPill></div><div className={s.timeline}>{fulfillmentSteps.map((step, index) => { const done = order.status !== "Cancelled" && index < statusProgress[order.status]; return <div className={`${s.timelineItem} ${done ? s.timelineDone : ""}`} key={step}><span className={s.timelineDot}>{done ? <Check size={15} /> : index + 1}</span><div><h4>{step}</h4><p>{done ? "Completed in this preview timeline" : "Not reached"}</p></div></div>; })}</div>{order.status === "Cancelled" ? <p className={s.muted}>This order was cancelled. Remaining fulfillment steps do not apply.</p> : null}</section>
        <section className={s.panel}><div className={s.sectionTitle}><h2>Medicine items</h2><p>Pricing shown from isolated preview data.</p></div><div className={s.tableWrap}><table className={s.table}><thead><tr><th>Medicine</th><th>Quantity</th><th>Unit price</th><th>Line total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.name}><td><strong>{item.name}</strong><br /><span className={s.muted}>{item.strength}</span></td><td>{item.quantity}</td><td>{item.unitPrice}</td><td><strong>{item.lineTotal}</strong></td></tr>)}</tbody></table></div></section>
      </div>
      <aside className={s.list}>
        <section className={s.panel}><div className={s.iconLine}><MapPin size={19} /><h3>Delivery</h3></div><p className={s.muted}>{order.deliveryAddress}</p><div className={s.divider} /><div className={s.iconLine}><Truck size={17} />{order.estimatedDelivery}</div></section>
        <section className={s.panel}><div className={s.iconLine}><CreditCard size={19} /><h3>Payment summary</h3></div><div className={s.list} style={{ marginTop: 16 }}><div className={s.rowBetween}><span className={s.muted}>Subtotal</span><strong>{order.subtotal}</strong></div><div className={s.rowBetween}><span className={s.muted}>Delivery</span><strong>{order.deliveryFee}</strong></div><div className={s.divider} /><div className={s.rowBetween}><strong>Total</strong><strong>{order.total}</strong></div><StatusPill tone={order.paymentStatus === "Paid" ? "success" : order.paymentStatus === "Refunded" ? "info" : "warning"}>{order.paymentStatus}</StatusPill></div></section>
        {order.prescriptionId ? <section className={s.panel} style={{ background: "#f5fbfa" }}><div className={s.iconLine}><Package size={18} /><strong>Prescription order</strong></div><p className={s.muted}>Linked to {order.prescriptionId}. Backend verification is required before prescription-only checkout.</p><Button asChild variant="outline"><Link href={`/patient/prescriptions/${order.prescriptionId}`}>View prescription</Link></Button></section> : null}
      </aside>
    </div>
  </div>;
}

