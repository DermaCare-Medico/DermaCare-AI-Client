"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, FileText, Loader2, LockKeyhole, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/api/format";
import { useGetCartQuery, usePlaceOrderMutation, type ShippingAddressDto } from "@/redux/api/orderApi";
import { useCreateOrderCheckoutMutation } from "@/redux/api/paymentApi";
import { useAppSelector } from "@/redux/hooks";

const PENDING_ORDER_KEY = "dermacare.checkout.pendingOrderId";
const IDEMPOTENCY_KEY = "dermacare.checkout.idempotencyKey";
const emptyAddress: ShippingAddressDto = { street: "", city: "Dhaka", state: "Dhaka", postalCode: "", country: "Bangladesh" };

const getErrorMessage = (error: unknown, fallback: string) =>
  typeof error === "object" && error !== null && "data" in error
    ? (error as { data?: { message?: string } }).data?.message || fallback
    : fallback;

export default function CheckoutPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const role = useAppSelector((state) => state.auth.user?.role);
  const { data: cartData, isLoading, isError, refetch } = useGetCartQuery(undefined, { skip: !token || role !== "PATIENT", refetchOnMountOrArgChange: true });
  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();
  const [createCheckout, { isLoading: isCreatingCheckout }] = useCreateOrderCheckoutMutation();
  const [address, setAddress] = useState<ShippingAddressDto>(emptyAddress);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddressDto, string>>>({});
  const [pendingOrderId, setPendingOrderId] = useState("");
  const cart = cartData?.data;
  const items = useMemo(() => cart?.items ?? [], [cart?.items]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isBusy = isPlacing || isCreatingCheckout;

  useEffect(() => {
    if (!token || role !== "PATIENT") router.replace("/login?redirect=%2Fcheckout");
  }, [role, router, token]);

  useEffect(() => { setPendingOrderId(sessionStorage.getItem(PENDING_ORDER_KEY) || ""); }, []);

  const eligibilityIssues = useMemo(() => items.flatMap((item) => {
    const issues: string[] = [];
    if (item.quantity > item.stockQuantity) issues.push(`${item.name} exceeds available stock.`);
    if (item.requiresPrescription && !item.prescriptionVerified) issues.push(`${item.name} needs a verified prescription.`);
    return issues;
  }), [items]);

  const setField = (field: keyof ShippingAddressDto, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
    if (value.trim()) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateAddress = () => {
    const next: typeof errors = {};
    for (const field of Object.keys(address) as Array<keyof ShippingAddressDto>) {
      if (!address[field].trim()) next[field] = "Required";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const redirectToStripe = async (orderId: string) => {
    try {
      const response = await createCheckout(orderId).unwrap();
      const checkout = response.data;
      const target = checkout.url || checkout.checkoutUrl || checkout.redirectUrl;
      if (!target) throw new Error("Missing checkout URL");
      const destination = new URL(target);
      if (destination.protocol !== "https:") throw new Error("Invalid checkout URL");
      window.location.assign(destination.href);
    } catch (error) {
      toast.error(getErrorMessage(error, "Order created, but Stripe checkout could not start. Retry payment below."));
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pendingOrderId) { await redirectToStripe(pendingOrderId); return; }
    if (!validateAddress()) { toast.error("Complete the delivery address."); return; }
    if (!cart?.eligibleForCheckout || eligibilityIssues.length > 0 || items.length === 0) { toast.error("Your cart is not eligible for checkout."); return; }

    let idempotencyKey = sessionStorage.getItem(IDEMPOTENCY_KEY);
    if (!idempotencyKey) {
      idempotencyKey = `cart-order-${crypto.randomUUID()}`;
      sessionStorage.setItem(IDEMPOTENCY_KEY, idempotencyKey);
    }
    try {
      const response = await placeOrder({
        fromCart: true,
        shippingAddress: {
          street: address.street.trim(), city: address.city.trim(), state: address.state.trim(),
          postalCode: address.postalCode.trim(), country: address.country.trim(),
        },
        idempotencyKey,
      }).unwrap();
      const orderId = String(response.data.id || response.data.orderId || "");
      if (!orderId) throw new Error("Order response did not include an ID");
      sessionStorage.setItem(PENDING_ORDER_KEY, orderId);
      setPendingOrderId(orderId);
      await redirectToStripe(orderId);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create the order. Check availability and try again."));
    }
  };

  if (!token || role !== "PATIENT") return null;
  if (isLoading) return <main className="mx-auto flex min-h-[55vh] max-w-6xl items-center justify-center px-5"><Loader2 className="size-7 animate-spin text-primary" /></main>;
  if (isError) return <main className="mx-auto min-h-[55vh] max-w-6xl px-5 py-16 text-center"><h1 className="text-2xl font-semibold text-slate-900">Could not load your cart</h1><p className="mt-2 text-sm text-slate-500">Try again before placing an order.</p><Button className="mt-6" onClick={() => refetch()}>Retry</Button></main>;

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
    <Link href="/store" className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft size={16} />Back to pharmacy</Link>
    <div className="mb-9 max-w-2xl"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Secure checkout</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Delivery and payment</h1><p className="mt-3 text-sm leading-6 text-slate-600">Confirm where your pharmacy order should be delivered, then continue to Stripe for secure payment.</p></div>

    {pendingOrderId ? <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5" role="status"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-5 text-primary" /><div><h2 className="font-semibold text-slate-900">Order {pendingOrderId} is ready for payment</h2><p className="mt-1 text-sm text-slate-600">The order already exists. Retrying will open payment for this order without creating another.</p><Link href={`/patient/orders/${encodeURIComponent(pendingOrderId)}`} className="mt-2 inline-block text-sm font-semibold text-primary underline underline-offset-4">View order details</Link></div></div></section> : null}

    {!pendingOrderId && items.length === 0 ? <section className="rounded-xl border border-slate-200 p-10 text-center"><ShoppingBag className="mx-auto size-10 text-slate-300" /><h2 className="mt-4 text-lg font-semibold">Your cart is empty</h2><p className="mt-2 text-sm text-slate-500">Add pharmacy items before checking out.</p><Button asChild className="mt-6"><Link href="/store">Browse pharmacy</Link></Button></section>
    : <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="mb-6"><h2 className="text-xl font-semibold text-slate-950">Delivery address</h2><p className="mt-1 text-sm text-slate-500">Enter the recipient’s complete delivery details.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2"><Label htmlFor="street">Street address</Label><Input id="street" value={address.street} disabled={Boolean(pendingOrderId)} onChange={(e) => setField("street", e.target.value)} placeholder="House, road, area" className="mt-2" aria-invalid={Boolean(errors.street)} />{errors.street && <p className="mt-1 text-xs text-destructive">{errors.street}</p>}</div>
          {(["city", "state", "postalCode", "country"] as const).map((field) => <div key={field}><Label htmlFor={field}>{field === "state" ? "State / division" : field === "postalCode" ? "Postal code" : field[0].toUpperCase() + field.slice(1)}</Label><Input id={field} value={address[field]} disabled={Boolean(pendingOrderId)} onChange={(e) => setField(field, e.target.value)} className="mt-2" aria-invalid={Boolean(errors[field])} />{errors[field] && <p className="mt-1 text-xs text-destructive">{errors[field]}</p>}</div>)}
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
        <div className="flex items-end justify-between border-b border-slate-200 pb-4"><div><h2 className="text-lg font-semibold text-slate-950">Order summary</h2><p className="mt-1 text-xs text-slate-500">{itemCount} {itemCount === 1 ? "item" : "items"}</p></div></div>
        <div className="divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-sm"><div><p className="font-medium text-slate-900">{item.name}</p><p className="mt-1 text-xs text-slate-500">{item.strength ? `${item.strength} · ` : ""}Qty {item.quantity}{item.requiresPrescription ? <span className="ml-2 inline-flex items-center gap-1"><FileText size={11} />Prescription</span> : null}</p></div><span className="shrink-0 font-medium">{formatMoney(item.lineTotal, "BDT")}</span></div>)}</div>
        <div className="space-y-3 border-t border-slate-200 pt-4 text-sm"><div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatMoney(cart?.subtotal ?? 0, "BDT")}</span></div><div className="flex justify-between text-slate-600"><span>Shipping</span><span>{formatMoney(cart?.shipping ?? 0, "BDT")}</span></div><div className="flex justify-between border-t border-slate-200 pt-4 text-base font-semibold text-slate-950"><span>Total</span><span>{formatMoney(cart?.total ?? 0, "BDT")}</span></div></div>
        {!pendingOrderId && (!cart?.eligibleForCheckout || eligibilityIssues.length > 0) ? <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-600"><p className="flex items-center gap-2 font-medium text-slate-800"><AlertCircle size={16} />Checkout unavailable</p>{eligibilityIssues.map((issue) => <p className="mt-2 text-xs" key={issue}>{issue}</p>)}</div> : null}
        <Button type="submit" className="mt-6 w-full" size="lg" disabled={isBusy || (!pendingOrderId && (!cart?.eligibleForCheckout || items.length === 0))}>{isBusy && <Loader2 className="mr-2 size-4 animate-spin" />}{pendingOrderId ? "Retry Stripe Checkout" : "Place Order & Pay"}</Button>
        {/* <p className="mt-3 text-center text-xs leading-5 text-slate-500">Payment is confirmed only after backend verification.</p> */}
      </aside>
    </form>}
  </main>;
}
