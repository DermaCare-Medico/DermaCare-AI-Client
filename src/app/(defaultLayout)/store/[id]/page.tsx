"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Minus, PackageCheck, Pill, Plus, ShieldAlert, ShoppingCart } from "lucide-react";

import { formatMoney } from "@/lib/api/format";
import { useGetStoreMedicineByIdQuery, useGetStoreMedicinesQuery } from "@/redux/api/publicApi";
import CartSheet from "@/components/shared/CartSheet";
import AddToCartModal from "@/components/public/AddToCartModal";
import type { Medicine } from "@/types/doctor";

export default function StoreMedicineDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id || "");
  const [quantity, setQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: rawApi, isLoading, isError, refetch } = useGetStoreMedicineByIdQuery(id, { skip: !id });
  const { data: rawCatalog } = useGetStoreMedicinesQuery({ limit: 4 });

  const apiItem = (rawApi as unknown as { data?: Record<string, unknown> })?.data ?? (rawApi as unknown as Record<string, unknown>);
  const hasApi = Boolean(apiItem && (apiItem.id || apiItem.name));

  const related = useMemo<Medicine[]>(() => {
    if (!rawCatalog) return [];
    const body = (rawCatalog as { data?: unknown }).data ?? rawCatalog;
    let list: Medicine[] = [];
    if (Array.isArray(body)) list = body as Medicine[];
    else if (body && typeof body === "object" && "medicines" in body && Array.isArray((body as { medicines: unknown }).medicines)) {
      list = (body as { medicines: Medicine[] }).medicines;
    }
    return list.filter((m) => m.id !== id).slice(0, 3);
  }, [rawCatalog, id]);

  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-[#F7F9FC] px-6 py-16">
        <div className="mx-auto grid max-w-3xl place-items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <Pill className="size-10 animate-pulse text-[#0F888D]" />
          <h1 className="mt-4 text-2xl font-bold text-[#102d31]">Loading medicine details...</h1>
        </div>
      </main>
    );
  }

  if (isError || !hasApi) {
    return (
      <main className="min-h-[70vh] bg-[#F7F9FC] px-6 py-16">
        <div className="mx-auto grid max-w-3xl place-items-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <PackageCheck className="size-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold text-[#102d31]">Medicine details unavailable</h1>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            This item could not be retrieved from the catalog or is currently offline.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Retry
            </button>
            <Link
              href="/store"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F888D] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <ArrowLeft className="size-4" /> Back to store
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const medicine = {
    id: String(apiItem.id || id),
    name: String(apiItem.name || "Medicine"),
    genericName: String(apiItem.genericName || ""),
    strength: String(apiItem.strength || ""),
    dosageForm: String(apiItem.dosageForm || "Standard"),
    packSize: String(apiItem.packSize || "Standard pack"),
    category: String(apiItem.category || "Dermatology"),
    price: Number(apiItem.price || 0),
    currency: String(apiItem.currency || "USD"),
    requiresPrescription: Boolean(apiItem.requiresPrescription),
    inStock: apiItem.inStock !== undefined ? Boolean(apiItem.inStock) : (Number(apiItem.stockQuantity) || 0) > 0,
    stockQuantity: Number(apiItem.stockQuantity ?? 50),
    description: String(apiItem.description || "Clinically tested dermatological medication."),
    manufacturer: String(apiItem.manufacturer || "DermaCare Certified"),
    storageInstructions: String(apiItem.storageInstructions || "Store at room temperature away from direct sunlight."),
    imageLabels: [String(apiItem.dosageForm || "Packaging"), "Blister pack", "Clinical leaflet"],
  };

  const maxQuantity = Math.min(medicine.stockQuantity || 10, 10);

  const handleAddToCart = () => {
    setIsAddModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#F7F9FC] px-4 py-10 text-[#172033] sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl space-y-8">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0F888D]">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link href="/store" className="hover:text-[#0F888D]">
            Store
          </Link>
          <ChevronRight className="size-4" />
          <span className="max-w-52 truncate text-slate-700" aria-current="page">
            {medicine.name}
          </span>
        </nav>
        <div className="flex items-center justify-between">
          <Link href="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F888D]">
            <ArrowLeft className="size-4" /> Back to medicines
          </Link>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0F888D] shadow-sm hover:bg-slate-50"
          >
            <ShoppingCart className="size-4" /> View Cart
          </button>
        </div>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
          <div className="space-y-3">
            <div className="grid aspect-[4/3] place-items-center rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-slate-100 shadow-sm">
              <div className="text-center">
                <span className="mx-auto grid size-24 place-items-center rounded-3xl bg-white text-[#0F888D] shadow-lg">
                  <Pill className="size-12" />
                </span>
                <p className="mt-5 text-sm font-semibold text-[#163A5F]">{medicine.imageLabels[0]}</p>
                <p className="mt-1 text-xs text-slate-500">Illustrative product packaging</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {medicine.imageLabels.map((label, index) => (
                <div
                  key={label}
                  className={`grid aspect-square place-items-center rounded-2xl border bg-white p-3 text-center text-xs font-medium ${
                    index === 0 ? "border-[#0F888D] text-[#0F888D]" : "border-slate-200 text-slate-500"
                  }`}
                >
                  <div>
                    <Pill className="mx-auto mb-2 size-6" />
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-[#0F777E]">
                {medicine.category}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  medicine.inStock ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {medicine.inStock ? "Available" : "Out of stock"}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#102d31]">{medicine.name}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {medicine.genericName} - {medicine.strength} - {medicine.packSize}
            </p>
            <p className="mt-6 text-3xl font-bold text-[#0F888D]">
              {formatMoney(medicine.price, medicine.currency)}
            </p>
            <p className="mt-5 text-sm leading-6 text-slate-600">{medicine.description}</p>
            <dl className="mt-6 grid gap-3 border-y border-slate-100 py-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Dosage form</dt>
                <dd className="font-semibold text-[#163A5F]">{medicine.dosageForm}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Manufacturer</dt>
                <dd className="font-semibold text-[#163A5F]">{medicine.manufacturer}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Storage</dt>
                <dd className="font-semibold text-[#163A5F]">{medicine.storageInstructions}</dd>
              </div>
            </dl>
            {medicine.requiresPrescription && (
              <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />
                <div>
                  <h2 className="font-semibold text-[#102d31]">Prescription required</h2>
                  <p className="mt-1 text-sm text-amber-800">
                    A valid clinician-issued prescription is required during checkout to fulfill this order.
                  </p>
                </div>
              </div>
            )}
            <div className="mt-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#163A5F]" htmlFor="quantity">
                    Quantity
                  </label>
                  <div className="mt-2 flex w-fit items-center rounded-xl border border-slate-200">
                    <button
                      type="button"
                      className="p-3 disabled:text-slate-300"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </button>
                    <output id="quantity" className="min-w-10 text-center text-sm font-bold" aria-live="polite">
                      {quantity}
                    </output>
                    <button
                      type="button"
                      className="p-3 disabled:text-slate-300"
                      disabled={!medicine.inStock || quantity >= maxQuantity}
                      onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
                <p className={`text-sm font-medium ${medicine.stockQuantity <= 10 ? "text-amber-700" : "text-emerald-700"}`}>
                  {medicine.inStock ? `${medicine.stockQuantity} units available` : "Currently unavailable"}
                </p>
              </div>
              <button
                type="button"
                disabled={!medicine.inStock}
                onClick={handleAddToCart}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F888D] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c6b6f] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
              >
                <ShoppingCart className="size-4" />
                {medicine.inStock ? "Add to cart" : "Out of stock"}
              </button>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0F888D]">You may also view</p>
              <h2 className="mt-2 text-2xl font-bold text-[#102d31]">Related medicines</h2>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/store/${item.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <span className="grid size-11 place-items-center rounded-xl bg-cyan-50 text-[#0F888D]">
                    <Pill className="size-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-[#102d31]">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {item.category} - {item.strength}
                  </p>
                  <p className="mt-4 font-bold text-[#0F888D]">{formatMoney(item.price, item.currency)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <AddToCartModal
        medicine={medicine}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => setIsCartOpen(true)}
      />

      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </main>
  );
}
