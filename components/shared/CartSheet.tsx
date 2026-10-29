"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, FileText, Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatMoney } from "@/lib/api/format";
import { useGetCartQuery, useRemoveCartItemMutation, useUpdateCartItemQuantityMutation } from "@/redux/api/orderApi";
import { useAppSelector } from "@/redux/hooks";

interface CartSheetProps { open: boolean; onOpenChange: (open: boolean) => void; }

const errorMessage = (error: unknown, fallback: string) =>
  typeof error === "object" && error !== null && "data" in error
    ? (error as { data?: { message?: string } }).data?.message || fallback
    : fallback;

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const isPatient = useAppSelector((state) => state.auth.user?.role === "PATIENT");
  const { data: cartData, isLoading: isCartLoading } = useGetCartQuery(undefined, { skip: !token || !isPatient });
  const cart = cartData?.data;
  const items = cart?.items ?? [];
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const [updateQuantity, { isLoading: isUpdating }] = useUpdateCartItemQuantityMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const isBusy = isUpdating || isRemoving;

  const updateItem = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeItem(itemId).unwrap();
        toast.success("Item removed from cart");
      } else await updateQuantity({ id: itemId, quantity }).unwrap();
    } catch (error) { toast.error(errorMessage(error, "Could not update item quantity.")); }
  };
  const remove = async (itemId: string) => {
    try { await removeItem(itemId).unwrap(); toast.success("Item removed from cart"); }
    catch (error) { toast.error(errorMessage(error, "Could not remove item.")); }
  };

  return <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
      <SheetHeader className="border-b border-slate-200 px-5 py-4 text-left">
        <SheetTitle className="flex items-center gap-2 text-[#102d31]"><ShoppingBag className="size-5 text-[#0F888D]" />Your Pharmacy Cart</SheetTitle>
        <SheetDescription>{token ? `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart.` : "Sign in as a patient to view and manage your cart."}</SheetDescription>
      </SheetHeader>
      {!token ? <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <ShoppingBag className="size-12 text-slate-300" /><p className="text-sm font-medium text-slate-600">Sign in to sync your cart</p>
        <p className="text-xs text-slate-400">Cart items and prescriptions are linked securely to your account.</p>
        <Button className="mt-2 bg-[#0F888D] hover:bg-[#0c6b6f]" onClick={() => { onOpenChange(false); router.push("/login?redirect=/store"); }}>Sign in as Patient</Button>
      </div> : isCartLoading ? <div className="flex flex-1 items-center justify-center"><Loader2 className="size-6 animate-spin text-[#0F888D]" /></div>
      : items.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <ShoppingBag className="size-12 text-slate-300" /><p className="text-sm font-medium text-slate-600">Your cart is empty</p>
        <p className="text-xs text-slate-400">Explore verified medicines and skincare items from the store.</p><Button variant="outline" className="mt-2" onClick={() => onOpenChange(false)}>Continue shopping</Button>
      </div> : <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
        <div className="divide-y divide-slate-200">{items.map((item) => <div key={item.id} className="py-4">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-[#102d31]">{item.name}</h4>{item.strength && <p className="text-xs text-slate-500">{item.strength}</p>}
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
              {item.requiresPrescription && <span className="inline-flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 font-medium text-slate-600"><FileText size={11} />{item.prescriptionVerified ? "Prescription attached" : "Prescription needed"}</span>}
              {item.stockQuantity < item.quantity && <span className="inline-flex items-center gap-1 rounded border border-slate-200 px-1.5 py-0.5 font-medium text-slate-700"><AlertCircle size={11} />Stock limited ({item.stockQuantity})</span>}
            </div></div><div className="text-right"><span className="text-sm font-bold text-[#102d31]">{formatMoney(item.lineTotal, "BDT")}</span><p className="text-[11px] text-slate-400">{formatMoney(item.unitPrice, "BDT")} each</p></div></div>
          <div className="mt-2.5 flex items-center justify-between"><div className="flex items-center rounded-full border border-slate-300">
            <button type="button" disabled={isBusy} onClick={() => updateItem(item.id, item.quantity - 1)} className="p-1.5 text-slate-600 disabled:opacity-40" aria-label="Decrease quantity"><Minus size={13} /></button><span className="min-w-8 text-center text-xs font-semibold">{item.quantity}</span>
            <button type="button" disabled={isBusy || item.quantity >= item.stockQuantity} onClick={() => updateItem(item.id, item.quantity + 1)} className="p-1.5 text-slate-600 disabled:opacity-40" aria-label="Increase quantity"><Plus size={13} /></button>
          </div><button type="button" disabled={isBusy} onClick={() => remove(item.id)} className="inline-flex items-center gap-1 text-xs text-slate-500 disabled:opacity-40"><Trash2 size={13} />Remove</button></div>
        </div>)}</div>
        <div className="my-3 space-y-3 border-t border-slate-200 pt-4"><div className="flex justify-between text-xs text-slate-600"><span>Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}</span><strong className="text-sm text-[#102d31]">{formatMoney(cart?.subtotal ?? 0, "BDT")}</strong></div>
          {cart && !cart.eligibleForCheckout && <p className="text-[11px] text-slate-600">Resolve stock or prescription requirements before checkout.</p>}</div>
      </div>}
      {token && items.length > 0 && <SheetFooter className="border-t border-slate-200 px-5 py-4 sm:flex-col"><Button className="w-full bg-[#0F888D] hover:bg-[#0c6b6f]" disabled={isBusy || !cart?.eligibleForCheckout} onClick={() => { onOpenChange(false); router.push("/checkout"); }}>Proceed to Checkout</Button></SheetFooter>}
    </SheetContent>
  </Sheet>;
}
