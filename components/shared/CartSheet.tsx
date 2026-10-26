"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearCart, removeFromCart, setDeliveryAddress, setPrescriptionId, updateQuantity } from "@/redux/features/cartSlice";
import { usePlaceOrderMutation } from "@/redux/api/orderApi";
import { useCreateOrderCheckoutMutation } from "@/redux/api/paymentApi";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, prescriptionId, deliveryAddress } = useAppSelector((state) => state.cart);
  const token = useAppSelector((state) => state.auth.token);

  const [address, setAddress] = useState(deliveryAddress || "");
  const [rxId, setRxId] = useState(prescriptionId || "");

  const [placeOrder, { isLoading: isPlacing }] = usePlaceOrderMutation();
  const [createCheckout, { isLoading: isCheckingOut }] = useCreateOrderCheckoutMutation();

  const isBusy = isPlacing || isCheckingOut;

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasRxItem = items.some((item) => item.requiresPrescription);

  const handleCheckout = async () => {
    if (!token) {
      toast.error("Please sign in as a patient to place an order.");
      router.push("/login?redirect=/store");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter a delivery address.");
      return;
    }

    if (hasRxItem && !rxId.trim()) {
      toast.error("One or more items require a prescription ID.");
      return;
    }

    try {
      const orderRes = await placeOrder({
        deliveryAddress: address.trim(),
        prescriptionId: rxId.trim() || undefined,
        items: items.map((i) => ({
          medicineId: i.medicineId,
          quantity: i.quantity,
        })),
      }).unwrap();

      const orderBody = (orderRes as { data?: Record<string, unknown> })?.data ?? (orderRes as unknown as Record<string, unknown>);
      const orderId = String(orderBody?.id || orderBody?.orderId || "");

      dispatch(clearCart());
      toast.success("Order placed successfully!");

      if (orderId) {
        try {
          const checkoutRes = await createCheckout(orderId).unwrap();
          const checkoutBody = (checkoutRes as { data?: { url?: string; checkoutUrl?: string } })?.data ?? (checkoutRes as { url?: string; checkoutUrl?: string });
          const redirectUrl = checkoutBody?.url || checkoutBody?.checkoutUrl;
          if (redirectUrl) {
            window.location.assign(redirectUrl);
            return;
          }
        } catch {
          // Fallback if checkout endpoint fails
        }
        onOpenChange(false);
        router.push(`/patient/orders/${orderId}`);
      } else {
        onOpenChange(false);
        router.push("/patient/orders");
      }
    } catch (err: unknown) {
      const msg = typeof err === "object" && err !== null && "data" in err
        ? (err as { data?: { message?: string } }).data?.message || "Failed to place order."
        : "Failed to place order. Please try again.";
      toast.error(msg);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[#0F2942]">
            <ShoppingBag className="size-5 text-[#0F888D]" />
            Your Pharmacy Cart
          </SheetTitle>
          <SheetDescription>
            {items.length === 0 ? "Your cart is currently empty." : `You have ${items.length} item(s) in your cart.`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingBag className="size-16 text-slate-200" />
            <p className="mt-4 text-sm font-medium text-slate-500">Add medicines from the store to proceed.</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-between overflow-y-auto pr-1">
            <div className="space-y-4 py-4">
              {items.map((item) => (
                <div key={item.medicineId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0F2942]">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      ${item.price.toFixed(2)} {item.strength ? `� ${item.strength}` : ""}
                    </p>
                    {item.requiresPrescription && (
                      <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                        Rx Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                      <button
                        type="button"
                        className="px-2 py-1 text-slate-500 hover:text-black"
                        onClick={() => dispatch(updateQuantity({ medicineId: item.medicineId, quantity: item.quantity - 1 }))}
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="min-w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        className="px-2 py-1 text-slate-500 hover:text-black"
                        onClick={() => dispatch(updateQuantity({ medicineId: item.medicineId, quantity: item.quantity + 1 }))}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-rose-600"
                      onClick={() => dispatch(removeFromCart(item.medicineId))}
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="delivery-address" className="text-xs">
                    Delivery Address *
                  </Label>
                  <Input
                    id="delivery-address"
                    placeholder="Enter your street address, city"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      dispatch(setDeliveryAddress(e.target.value));
                    }}
                  />
                </div>

                {hasRxItem && (
                  <div className="space-y-1">
                    <Label htmlFor="rx-id" className="text-xs">
                      Prescription ID *
                    </Label>
                    <Input
                      id="rx-id"
                      placeholder="e.g. prsc_xxxx or paste prescription ID"
                      value={rxId}
                      onChange={(e) => {
                        setRxId(e.target.value);
                        dispatch(setPrescriptionId(e.target.value));
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <SheetFooter className="border-t border-slate-100 pt-4">
              <div className="w-full space-y-3">
                <div className="flex justify-between text-base font-bold text-[#0F2942]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full bg-[#0F888D] hover:bg-[#0C7479]"
                  disabled={isBusy}
                  onClick={handleCheckout}
                >
                  {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isBusy ? "Processing Order..." : "Proceed to Checkout"}
                </Button>
              </div>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
