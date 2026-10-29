"use client";

import { Package, Pill, ShieldPlus, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { formatMoney } from "@/lib/api/format";
import type { Medicine } from "@/types/doctor";

interface MedicineCardProps {
  medicine: Medicine;
  detailsHref?: string;
  onAddToCart?: (medicine: Medicine) => void;
  isAdding?: boolean;
}

/** Public store catalog card. */
export function MedicineCard({
  medicine,
  detailsHref = `/store/${medicine.id}`,
  onAddToCart,
  isAdding = false,
}: MedicineCardProps) {
  const inStock = medicine.inStock ?? (medicine.stockQuantity ?? 0) > 0;

  return (
    <article className="flex flex-col justify-between gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#E8F5F4] text-[#0F888D]">
          <Pill size={20} />
        </span>
        <div className="min-w-0">
          <Link href={detailsHref} className="hover:text-[#0F888D] transition-colors">
            <h3 className="truncate text-base font-bold text-[#102d31]">
              {medicine.name}
            </h3>
          </Link>
          <p className="truncate text-xs text-[#64748B]">
            {[medicine.genericName, medicine.strength && `${medicine.strength}`]
              .filter(Boolean)
              .join(" · ") || "Dermatology medicine"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {medicine.category && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
            {medicine.category}
          </span>
        )}
        {medicine.dosageForm && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
            {medicine.dosageForm}
          </span>
        )}
        {medicine.packSize && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
            {medicine.packSize}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
        <span
          className={
            medicine.requiresPrescription
              ? "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800"
              : "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800"
          }
        >
          <ShieldPlus size={12} />
          {medicine.requiresPrescription ? "Prescription required" : "Over the counter"}
        </span>
        <span
          className={
            inStock
              ? "inline-flex items-center gap-1 rounded-full bg-[#E8F5F4] px-2 py-0.5 text-[#0F777E]"
              : "inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-rose-700"
          }
        >
          <Package size={12} />
          {inStock ? "In stock" : "Out of stock"}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-[#E2E8F0] pt-3">
        <span className="text-xs text-[#64748B]">Price</span>
        <span className="text-lg font-bold text-[#0F2942]">
          {formatMoney(medicine.price, medicine.currency ?? "BDT")}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {onAddToCart ? (
          <button
            type="button"
            disabled={!inStock || isAdding}
            onClick={() => onAddToCart(medicine)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F888D] px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-[#0c6b6f] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <ShoppingCart size={15} />
            {isAdding ? "Adding…" : inStock ? "Add to Cart" : "Out of stock"}
          </button>
        ) : null}

        <Link
          href={detailsHref}
          className="rounded-xl border border-slate-200 px-4 py-2 text-center text-xs font-semibold text-slate-700 transition-colors hover:border-[#0F888D] hover:text-[#0F888D]"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
