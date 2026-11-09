"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CreditCard, ExternalLink, Loader2, MapPin, Package, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { baseApi } from "@/redux/api/baseApi";
import { useAppDispatch } from "@/redux/hooks";
import { useGetPatientOrderByIdQuery } from "@/redux/api/orderApi";
import { useCreateOrderCheckoutMutation, useGetOrderPaymentStatusQuery, useLazyGetOrderPaymentStatusQuery, type PaymentStatus } from "@/redux/api/paymentApi";
import { formatMoney } from "@/lib/api/format";

const fulfillmentSteps = ["Order received", "Processing", "Packed", "Out for delivery", "Delivered"];
const statusProgress: Record<string, number> = {
  Confirmed: 1,
  Pending: 1,
  Processing: 2,
  Packed: 3,
  "Out for delivery": 4,
  Delivered: 5,
  Cancelled: 1,
};

const MAX_PAYMENT_CHECKS = 10;
const PAYMENT_CHECK_DELAY = 2500;
const normalize = (value: unknown) => typeof value === "string" ? value.trim().toUpperCase() : "";

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const id = decodeURIComponent(params.id || "");

  const { data: rawData, isLoading, isError, refetch } = useGetPatientOrderByIdQuery(id, { skip: !id, refetchOnMountOrArgChange: true });
  const { data: paymentStatusData, isFetching: isPaymentFetching, refetch: refetchPayment } = useGetOrderPaymentStatusQuery(id, { skip: !id, refetchOnMountOrArgChange: true });
  const [verifyPayment] = useLazyGetOrderPaymentStatusQuery();
  const [createCheckout, { isLoading: isCheckingOut }] = useCreateOrderCheckoutMutation();
  const [returnState, setReturnState] = useState<"idle" | "verifying" | "delayed" | "failed" | "cancelled">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runId = useRef(0);

  const paymentReturn = searchParams.get("payment");
  const returnContext = searchParams.get("context");
  const returnOrderId = searchParams.get("orderId");
  const returnSessionId = searchParams.get("session_id");
  const validSuccessReturn = paymentReturn === "success" && returnContext === "order" && returnOrderId === id && Boolean(returnSessionId?.startsWith("cs_") && returnSessionId.length <= 500);
  const validCancelledReturn = paymentReturn === "cancelled" && returnContext === "order" && returnOrderId === id;

  const pollPayment = useCallback(async () => {
    if (!id || !validSuccessReturn) return;
    const currentRun = ++runId.current;
    setReturnState("verifying");
    for (let attempt = 1; attempt <= MAX_PAYMENT_CHECKS; attempt += 1) {
      try {
        const response = await verifyPayment(id, false).unwrap();
        if (currentRun !== runId.current) return;
        const data = response.data;
        const backendStatus = normalize(data.payment?.status ?? data.paymentStatus ?? data.status);
        if (data.isPaid === true && backendStatus === "PAID") {
          sessionStorage.removeItem("dermacare.checkout.pendingOrderId");
          sessionStorage.removeItem("dermacare.checkout.idempotencyKey");
          dispatch(baseApi.util.invalidateTags(["Cart", "Orders", "Payment"]));
          await Promise.all([refetch(), refetchPayment()]);
          router.replace(`/patient/orders/${encodeURIComponent(id)}`);
          return;
        }
        if (["FAILED", "CANCELLED"].includes(backendStatus)) { setReturnState("failed"); return; }
      } catch {
        if (currentRun !== runId.current) return;
        if (attempt === 1) { setReturnState("failed"); return; }
      }
      if (attempt < MAX_PAYMENT_CHECKS) {
        await new Promise<void>((resolve) => { timer.current = setTimeout(resolve, PAYMENT_CHECK_DELAY); });
        if (currentRun !== runId.current) return;
      }
    }
    if (currentRun === runId.current) setReturnState("delayed");
  }, [dispatch, id, refetch, refetchPayment, router, validSuccessReturn, verifyPayment]);

  useEffect(() => {
    if (validCancelledReturn) { timer.current = setTimeout(() => setReturnState("cancelled"), 0); return () => { if (timer.current) clearTimeout(timer.current); }; }
    if (!validSuccessReturn) return;
    timer.current = setTimeout(() => void pollPayment(), 0);
    return () => { runId.current += 1; if (timer.current) clearTimeout(timer.current); };
  }, [pollPayment, validCancelledReturn, validSuccessReturn]);

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
  if (rawStatus.includes("confirm")) normStatus = "Confirmed";
  else if (rawStatus.includes("deliv")) normStatus = "Delivered";
  else if (rawStatus.includes("cancel")) normStatus = "Cancelled";
  else if (rawStatus.includes("out")) normStatus = "Out for delivery";
  else if (rawStatus.includes("pack")) normStatus = "Packed";
  else if (rawStatus.includes("proc")) normStatus = "Processing";

  const paymentDataObj = paymentStatusData?.data as PaymentStatus | undefined;
  const appointmentPay = normalize(apiData.paymentStatus);
  const endpointPay = normalize(paymentDataObj?.payment?.status ?? paymentDataObj?.paymentStatus ?? paymentDataObj?.status);
  const backendPaid = apiData.isPaid === true || paymentDataObj?.isPaid === true;
  const rawPay = backendPaid && (appointmentPay === "PAID" || endpointPay === "PAID") ? "PAID" : endpointPay || appointmentPay || "PENDING";
  const normPay: "PAID" | "PENDING" | "FAILED" | "CANCELLED" | "REFUNDED" = ["PAID", "FAILED", "CANCELLED", "REFUNDED"].includes(rawPay) ? rawPay as "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" : "PENDING";

  const rawItems = Array.isArray(apiData.items) ? apiData.items : [];
  const subtotalNum = Number(apiData.subtotal || 0);
  const deliveryFeeNum = Number(apiData.deliveryFee || 0);
  const totalNum = Number(apiData.totalAmount || apiData.total || subtotalNum + deliveryFeeNum);

  const order = {
    id: String(apiData.id || apiData.orderId || id),
    placedOn: apiData.createdAt ? new Date(String(apiData.createdAt)).toLocaleDateString() : "Recently",
    status: normStatus,
    paymentStatus: normPay,
    subtotal: formatMoney(subtotalNum, "BDT"),
    deliveryFee: formatMoney(deliveryFeeNum, "BDT"),
    total: formatMoney(totalNum, "BDT"),
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
        unitPrice: formatMoney(unitPrice, "BDT"),
        lineTotal: formatMoney(unitPrice * qty, "BDT"),
      };
    }),
  };

  const handlePayNow = async () => {
    if (isCheckingOut || normPay === "PAID" || !["PENDING", "FAILED", "CANCELLED"].includes(normPay) || ["confirmed", "cancelled"].includes(rawStatus)) return;
    try {
      const res = await createCheckout(order.id).unwrap();
      const body = (res as { data?: { url?: string; checkoutUrl?: string } })?.data ?? (res as { url?: string; checkoutUrl?: string });
      const targetUrl = body?.url || body?.checkoutUrl;
      if (targetUrl) {
        const destination = new URL(targetUrl);
        if (destination.protocol !== "https:") throw new Error("Invalid checkout URL");
        window.location.assign(destination.href);
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
      {returnState !== "idle" ? <div className={s.previewNotice} role="status">
        {returnState === "verifying" ? "Verifying payment with the backend..." : null}
        {returnState === "delayed" ? <>Payment confirmation is taking longer than expected. The order remains pending until the backend confirms it. <button className="font-semibold underline" onClick={() => void pollPayment()}>Check again</button></> : null}
        {returnState === "failed" ? <>Payment could not be confirmed. Review the status below and retry checkout if eligible.</> : null}
        {returnState === "cancelled" ? "Stripe checkout was cancelled. No payment was recorded from the return URL." : null}
      </div> : null}
      <div className={s.detailsLayout}>
        <div className={s.list}>
          <section className={s.panel}>
            <div className={s.rowBetween}>
              <div>
                <p className={s.eyebrow}>Fulfillment</p>
                <h2>{order.id}</h2>
              </div>
              <StatusPill tone={order.status === "Delivered" || order.status === "Confirmed" ? "success" : order.status === "Cancelled" ? "danger" : "info"}>
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
              <StatusPill tone={order.paymentStatus === "PAID" ? "success" : order.paymentStatus === "FAILED" || order.paymentStatus === "CANCELLED" ? "danger" : order.paymentStatus === "REFUNDED" ? "info" : "warning"}>
                {order.paymentStatus}
              </StatusPill>
              {["PENDING", "FAILED", "CANCELLED"].includes(order.paymentStatus) && order.status !== "Cancelled" && order.status !== "Confirmed" && (
                  <Button
                    className={s.primaryButton}
                    style={{ marginTop: 12 }}
                    disabled={isCheckingOut || isPaymentFetching || returnState === "verifying"}
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
