"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Check, CreditCard, ExternalLink, Loader2, MapPin, Package, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { useGetPatientOrderByIdQuery } from "@/redux/api/orderApi";
import { useCreateOrderCheckoutMutation, useGetOrderPaymentStatusQuery } from "@/redux/api/paymentApi";

const fulfillmentSteps = ["Order received", "Processing", "Packed", "Out for delivery", "Delivered"];
const statusProgress: Record<string, number> = {
  Pending: 1,
  Processing: 2,
  Packed: 3,
  "Out for delivery": 4,
  Delivered: 5,
  Cancelled: 1,
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id || "");

  const { data: rawData, isLoading, isError, refetch } = useGetPatientOrderByIdQuery(id, { skip: !id });
  const { data: paymentStatusData } = useGetOrderPaymentStatusQuery(id, { skip: !id });
  const [createCheckout, { isLoading: isCheckingOut }] = useCreateOrderCheckoutMutation();

  const apiData = (rawData as { data?: Record<string, unknown> })?.data ?? (rawData as unknown as Record<string, unknown>);
  const hasApi = Boolean(apiData && (apiData.id || apiData.orderId));

  if (isLoading) {
    return (
      <div className={s.page}>
        <PageState state="loading" title="Loading order..." message="Fetching order and payment details." />
      </div>
    );
  }

  if (isError || !hasApi) {
    return (
      <div className={s.page}>
        <PageState
          state="error"
          title="Order not found"
          message="This order record is unavailable or could not be loaded."
          onRetry={() => refetch()}
          
        />
        <div style={{ marginTop: 16 }}>
          <Button asChild variant="outline">
            <Link href="/patient/orders">
              <ArrowLeft size={16} /> Back to orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const rawStatus = String(apiData.status || "PENDING").toLowerCase();
  let normStatus = "Pending";
  if (rawStatus.includes("deliv")) normStatus = "Delivered";
  else if (rawStatus.includes("cancel")) normStatus = "Cancelled";
  else if (rawStatus.includes("out")) normStatus = "Out for delivery";
  else if (rawStatus.includes("pack")) normStatus = "Packed";
  else if (rawStatus.includes("proc")) normStatus = "Processing";

  const paymentDataObj = (paymentStatusData as { data?: Record<string, unknown> })?.data;
  const rawPay = String(paymentDataObj?.paymentStatus || apiData.paymentStatus || "PENDING").toLowerCase();
  let normPay: "Paid" | "Pending" | "Refunded" = "Pending";
  if (rawPay.includes("paid") || rawPay.includes("success")) normPay = "Paid";
  else if (rawPay.includes("refund")) normPay = "Refunded";

  const rawItems = Array.isArray(apiData.items) ? apiData.items : [];
  const subtotalNum = Number(apiData.subtotal || 0);
  const deliveryFeeNum = Number(apiData.deliveryFee || 0);
  const totalNum = Number(apiData.totalAmount || apiData.total || subtotalNum + deliveryFeeNum);

  const order = {
    id: String(apiData.id || apiData.orderId || id),
    placedOn: apiData.createdAt ? new Date(String(apiData.createdAt)).toLocaleDateString() : "Recently",
    status: normStatus,
    paymentStatus: normPay,
    subtotal: `$${subtotalNum.toFixed(2)}`,
    deliveryFee: `$${deliveryFeeNum.toFixed(2)}`,
    total: `$${totalNum.toFixed(2)}`,
    deliveryAddress: String(apiData.deliveryAddress || "Address provided during checkout"),
    estimatedDelivery: String(apiData.estimatedDelivery || "Standard 2-3 business days"),
    prescriptionId: apiData.prescriptionId ? String(apiData.prescriptionId) : undefined,
    items: rawItems.map((item: Record<string, unknown>) => {
      const unitPrice = Number(item.unitPrice || item.price || 0);
      const qty = Number(item.quantity) || 1;
      return {
        name: String(item.medicineName || item.name || "Medicine"),
        strength: String(item.strength || ""),
        quantity: qty,
        unitPrice: `$${unitPrice.toFixed(2)}`,
        lineTotal: `$${(unitPrice * qty).toFixed(2)}`,
      };
    }),
  };

  const handlePayNow = async () => {
    try {
      const res = await createCheckout(order.id).unwrap();
      const body = (res as { data?: { url?: string; checkoutUrl?: string } })?.data ?? (res as { url?: string; checkoutUrl?: string });
      const targetUrl = body?.url || body?.checkoutUrl;
      if (targetUrl) {
        window.location.assign(targetUrl);
      } else {
        toast.error("Could not obtain checkout session URL.");
      }
    } catch {
      toast.error("Unable to initiate online payment session.");
    }
  };

  return (
    <div className={s.page}>
      <PatientPageHeader
        eyebrow={`Order ${order.id}`}
        title="Order details"
        description={`Placed on ${order.placedOn}. Review items, delivery information, and fulfillment progress.`}
        action={
          <Button asChild variant="outline">
            <Link href="/patient/orders">
              <ArrowLeft size={16} /> All orders
            </Link>
          </Button>
        }
      />
      <div className={s.detailsLayout}>
        <div className={s.list}>
          <section className={s.panel}>
            <div className={s.rowBetween}>
              <div>
                <p className={s.eyebrow}>Fulfillment</p>
                <h2>{order.id}</h2>
              </div>
              <StatusPill tone={order.status === "Delivered" ? "success" : order.status === "Cancelled" ? "danger" : "info"}>
                {order.status}
              </StatusPill>
            </div>
            <div className={s.timeline}>
              {fulfillmentSteps.map((step, index) => {
                const done = order.status !== "Cancelled" && index < (statusProgress[order.status] ?? 1);
                return (
                  <div className={`${s.timelineItem} ${done ? s.timelineDone : ""}`} key={step}>
                    <span className={s.timelineDot}>{done ? <Check size={15} /> : index + 1}</span>
                    <div>
                      <h4>{step}</h4>
                      <p>{done ? "Completed in fulfillment timeline" : "Not reached"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            {order.status === "Cancelled" ? (
              <p className={s.muted}>This order was cancelled. Remaining fulfillment steps do not apply.</p>
            ) : null}
          </section>
          <section className={s.panel}>
            <div className={s.sectionTitle}>
              <h2>Medicine items</h2>
              <p>Items in this pharmacy order.</p>
            </div>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Unit price</th>
                    <th>Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={`${item.name}-${idx}`}>
                      <td>
                        <strong>{item.name}</strong>
                        {item.strength ? <br /> : null}
                        {item.strength ? <span className={s.muted}>{item.strength}</span> : null}
                      </td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice}</td>
                      <td>
                        <strong>{item.lineTotal}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
        <aside className={s.list}>
          <section className={s.panel}>
            <div className={s.iconLine}>
              <MapPin size={19} />
              <h3>Delivery</h3>
            </div>
            <p className={s.muted}>{order.deliveryAddress}</p>
            <div className={s.divider} />
            <div className={s.iconLine}>
              <Truck size={17} />
              {order.estimatedDelivery}
            </div>
          </section>
          <section className={s.panel}>
            <div className={s.iconLine}>
              <CreditCard size={19} />
              <h3>Payment summary</h3>
            </div>
            <div className={s.list} style={{ marginTop: 16 }}>
              <div className={s.rowBetween}>
                <span className={s.muted}>Subtotal</span>
                <strong>{order.subtotal}</strong>
              </div>
              <div className={s.rowBetween}>
                <span className={s.muted}>Delivery</span>
                <strong>{order.deliveryFee}</strong>
              </div>
              <div className={s.divider} />
              <div className={s.rowBetween}>
                <strong>Total</strong>
                <strong>{order.total}</strong>
              </div>
              <StatusPill tone={order.paymentStatus === "Paid" ? "success" : order.paymentStatus === "Refunded" ? "info" : "warning"}>
                {order.paymentStatus}
              </StatusPill>
              {order.paymentStatus === "Pending" && order.status !== "Cancelled" && (
                <Button
                  className={s.primaryButton}
                  style={{ marginTop: 12 }}
                  disabled={isCheckingOut}
                  onClick={handlePayNow}
                >
                  {isCheckingOut ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink size={16} style={{ marginRight: 6 }} />
                  )}
                  Pay with Stripe Checkout
                </Button>
              )}
            </div>
          </section>
          {order.prescriptionId ? (
            <section className={s.panel} style={{ background: "#f5fbfa" }}>
              <div className={s.iconLine}>
                <Package size={18} />
                <strong>Prescription order</strong>
              </div>
              <p className={s.muted}>
                Linked to prescription {order.prescriptionId}.
              </p>
              <Button asChild variant="outline">
                <Link href={`/patient/prescriptions/${order.prescriptionId}`}>View prescription</Link>
              </Button>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
