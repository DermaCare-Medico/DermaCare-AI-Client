"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Minus, Plus, ShieldAlert, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/api/format";
import { useAppSelector } from "@/redux/hooks";
import { useAddToCartMutation } from "@/redux/api/orderApi";
import { useGetPatientPrescriptionsQuery } from "@/redux/api/prescriptionApi";
import type { Medicine } from "@/types/doctor";

interface AddToCartModalProps {
  medicine: Medicine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddToCartModal({
  medicine,
  open,
  onOpenChange,
  onSuccess,
}: AddToCartModalProps) {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);
  const isPatient = user?.role === "PATIENT";

  const [quantity, setQuantity] = useState(1);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string>("");

  const [addToCartMutation, { isLoading: isAdding }] = useAddToCartMutation();

  // Load real patient finalized prescriptions if this medicine requires one
  const { data: rxData, isLoading: isRxLoading } = useGetPatientPrescriptionsQuery(undefined, {
    skip: !token || !isPatient || !medicine?.requiresPrescription,
  });

  const prescriptions = useMemo(() => {
    if (!rxData) return [];
    const body = (rxData as { data?: unknown })?.data ?? rxData;
    let list: Array<Record<string, unknown>> = [];
    if (Array.isArray(body)) list = body as Array<Record<string, unknown>>;
    else if (body && typeof body === "object" && "prescriptions" in body && Array.isArray((body as { prescriptions: unknown }).prescriptions)) {
      list = (body as { prescriptions: Array<Record<string, unknown>> }).prescriptions;
    }
    return list;
  }, [rxData]);

  if (!medicine) return null;

  const inStock = medicine.inStock ?? (medicine.stockQuantity ?? 0) > 0;
  const maxStock = medicine.stockQuantity ?? 10;
  const requiresRx = Boolean(medicine.requiresPrescription);

  const handleConfirm = async () => {
    if (!token) {
      toast.error("Please sign in as a patient to add items to your cart.");
      onOpenChange(false);
      router.push("/login?redirect=/store");
      return;
    }

    if (!isPatient) {
      toast.error("Only patient accounts can purchase pharmacy items.");
      return;
    }

    if (requiresRx && !selectedPrescriptionId) {
      toast.error("Please select a doctor prescription for this medicine.");
      return;
    }

    try {
      await addToCartMutation({
        medicineId: medicine.id,
        quantity,
        prescriptionId: requiresRx ? selectedPrescriptionId : undefined,
      }).unwrap();

      toast.success(`Added ${quantity} x ${medicine.name} to your cart.`);
      setQuantity(1);
      setSelectedPrescriptionId("");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = typeof err === "object" && err !== null && "data" in err
        ? (err as { data?: { message?: string } }).data?.message || "Failed to add item to cart."
        : "Failed to add item to cart.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#102d31]">
            <ShoppingBag className="size-4 text-[#0F888D]" />
            Add to Pharmacy Cart
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Select quantity and attach a verified doctor prescription if required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Medicine brief summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#102d31]">{medicine.name}</h4>
                <p className="text-xs text-slate-500">
                  {[medicine.genericName, medicine.strength].filter(Boolean).join(" · ")}
                </p>
              </div>
              <span className="text-sm font-bold text-[#0F888D]">
                {formatMoney(medicine.price, medicine.currency ?? "BDT")}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px]">
              <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium ${
                requiresRx ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
              }`}>
                {requiresRx ? "Prescription Required" : "Over the Counter"}
              </span>
              <span className="text-slate-500">
                {inStock ? `${maxStock} available` : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Prescription Selection (if required) */}
          {requiresRx && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-700">
                Select Finalized Prescription *
              </Label>

              {isRxLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                  <Loader2 className="size-4 animate-spin text-[#0F888D]" />
                  Checking your medical records…
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <ShieldAlert className="size-4 text-amber-700" />
                    No eligible prescription found
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    This medication requires a finalized prescription issued by a licensed doctor during consultation.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {prescriptions.map((rx) => {
                    const isSelected = selectedPrescriptionId === rx.id;
                    return (
                      <button
                        key={String(rx.id)}
                        type="button"
                        onClick={() => setSelectedPrescriptionId(String(rx.id))}
                        className={`w-full text-left rounded-xl border p-2.5 transition-colors text-xs flex items-center justify-between ${
                          isSelected
                            ? "border-[#0F888D] bg-[#E8F5F4] text-[#0F777E]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold truncate">
                            {String(rx.diagnosis || "Prescription record")}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {rx.doctorName ? `By ${String(rx.doctorName)}` : "Verified consultation"} · ID: {String(rx.id).slice(0, 8)}…
                          </p>
                        </div>
                        <FileText className={`size-4 shrink-0 ${isSelected ? "text-[#0F888D]" : "text-slate-400"}`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-700">Quantity</span>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white">
              <button
                type="button"
                disabled={quantity <= 1 || isAdding}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-8 text-center text-xs font-bold">{quantity}</span>
              <button
                type="button"
                disabled={quantity >= maxStock || isAdding}
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isAdding || !inStock || (requiresRx && !selectedPrescriptionId)}
            className="bg-[#0F888D] hover:bg-[#0c6b6f] text-xs font-semibold"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" /> Adding…
              </>
            ) : (
              "Add to Cart"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
