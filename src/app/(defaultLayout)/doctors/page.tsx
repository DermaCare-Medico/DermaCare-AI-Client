"use client";

import { useMemo, useState } from "react";
import { Search, Stethoscope } from "lucide-react";

import { DoctorCard } from "@/components/public/DoctorCard";
import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { usePublicDoctors } from "@/src/hooks/usePublicCatalog";

export default function AllDoctorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [specialty, setSpecialty] = useState<string | undefined>(undefined);

  const args = useMemo(
    () => ({
      search: appliedSearch || undefined,
      specialty,
      limit: 24,
    }),
    [appliedSearch, specialty]
  );

  const { doctors, allDoctors, isDemo, isLoading, isError, error, refetch } =
    usePublicDoctors(args);

  const availableSpecialties = useMemo(() => {
    const set = new Set<string>();
    for (const d of allDoctors) {
      if (d.specialization) set.add(d.specialization);
      for (const s of d.specialties ?? []) {
        if (s) set.add(s);
      }
    }
    return Array.from(set).sort();
  }, [allDoctors]);

  return (
    <section className="min-h-screen bg-[#F7F9FC] px-4 py-16 font-sans text-[#172033] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#0F888D]/10 px-3 py-1 text-xs font-semibold text-[#0F888D]">
            <Stethoscope className="h-3.5 w-3.5" />
            Verified dermatologists
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F2942] sm:text-4xl">
            All Doctors
          </h1>
          <p className="max-w-2xl text-sm text-[#64748B]">
            Browse board-certified dermatologists. Every profile is verified
            before it appears here. Filter by specialty or search by name.
          </p>
        </header>

        {isDemo && (
          <DemoNotice description="The backend doctor-discovery service is not implemented yet, so placeholder doctors are shown." />
        )}

        {/* Search + filters */}
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
                placeholder="Search by doctor name or specialty"
                aria-label="Search doctors"
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
            <button
              type="button"
              onClick={() => setSpecialty(undefined)}
              aria-pressed={specialty === undefined}
              className={
                specialty === undefined
                  ? "rounded-full border border-[#0F888D] bg-[#0F888D] px-3.5 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:border-[#0F888D]/40 hover:text-[#0F888D]"
              }
            >
              All specialties
            </button>
            {availableSpecialties.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSpecialty(item)}
                aria-pressed={specialty === item}
                className={
                  specialty === item
                    ? "rounded-full border border-[#0F888D] bg-[#0F888D] px-3.5 py-1.5 text-xs font-semibold text-white"
                    : "rounded-full border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:border-[#0F888D]/40 hover:text-[#0F888D]"
                }
              >
                {item}
              </button>
            ))}
          </div>
        </form>

        <DataState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={doctors.length === 0}
          emptyTitle="No doctors found"
          emptyMessage="Try a different specialty or clear your search filters."
          onRetry={refetch}
          skeleton={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white"
                />
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </DataState>
      </div>
    </section>
  );
}
