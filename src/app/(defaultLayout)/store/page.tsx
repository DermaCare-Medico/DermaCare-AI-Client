"use client";

import { useMemo, useState } from "react";
import { Search, ShoppingBag } from "lucide-react";

import { MedicineCard } from "@/components/public/MedicineCard";
import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { useStoreMedicines } from "@/src/hooks/usePublicCatalog";

type RxFilter = "ALL" | "OTC" | "RX";

export default function StorePage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [rxFilter, setRxFilter] = useState<RxFilter>("ALL");

  const args = useMemo(
    () => ({
      search: appliedSearch || undefined,
      category,
      requiresPrescription:
        rxFilter === "RX" ? true : rxFilter === "OTC" ? false : undefined,
      limit: 24,
    }),
    [appliedSearch, category, rxFilter]
  );

  const { medicines, isDemo, isLoading, isError, error, refetch } =
    useStoreMedicines(args);

  // Categories derived from the returned catalog (works for live + demo data).
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          medicines.map((m) => m.category).filter((c): c is string => Boolean(c))
        )
      ).sort(),
    [medicines]
  );

  return (
    <section className="min-h-screen bg-[#F7F9FC] px-6 py-16 font-sans text-[#172033] md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#0F888D]/10 px-3 py-1 text-xs font-semibold text-[#0F888D]">
            <ShoppingBag className="h-3.5 w-3.5" />
            DermaCare Store
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F2942] sm:text-4xl">
            Explore DermaCare Store
          </h1>
          <p className="max-w-2xl text-sm text-[#64748B]">
            Browse dermatological medicines and skincare essentials. Items that
            require a prescription can be ordered once a doctor issues one.
          </p>
        </header>

        {isDemo && (
          <DemoNotice description="The backend store service is not implemented yet, so a placeholder catalog is shown." />
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setAppliedSearch(searchInput.trim());
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search medicine name or active ingredient"
                aria-label="Search medicines"
                className="w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 pl-9 pr-3 text-sm text-[#0F2942] shadow-sm outline-none focus:border-[#0F888D]"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-[#0F888D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b6f]"
            >
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: "ALL", label: "All items" },
                { value: "OTC", label: "Over the counter" },
                { value: "RX", label: "Prescription required" },
              ] as { value: RxFilter; label: string }[]
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setRxFilter(item.value)}
                aria-pressed={rxFilter === item.value}
                className={
                  rxFilter === item.value
                    ? "rounded-full border border-[#0F888D] bg-[#0F888D] px-3.5 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:border-[#0F888D]/40 hover:text-[#0F888D]"
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory(undefined)}
                aria-pressed={category === undefined}
                className={
                  category === undefined
                    ? "rounded-full border border-[#0F2942] bg-[#0F2942] px-3.5 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:border-[#0F2942]/40"
                }
              >
                All categories
              </button>
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                  className={
                    category === item
                      ? "rounded-full border border-[#0F2942] bg-[#0F2942] px-3.5 py-1.5 text-xs font-semibold text-white"
                      : "rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:border-[#0F2942]/40"
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </form>

        <DataState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={medicines.length === 0}
          emptyTitle="No products found"
          emptyMessage="Try a different search term or clear the filters."
          onRetry={refetch}
          skeleton={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white"
                />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {medicines.map((medicine) => (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                detailsHref={isDemo ? `/store/${medicine.id}` : undefined}
              />
            ))}
          </div>
        </DataState>

        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
          Educational prototype: orders and payments are simulated. No real
          medicine is sold and no real money is charged.
        </p>
      </div>
    </section>
  );
}
