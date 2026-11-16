"use client";

import Link from "next/link";
import { DoctorCard } from "@/components/public/DoctorCard";
import { Button, ButtonArrow } from "@/components/ui/button";
import { usePublicDoctors } from "@/hooks/usePublicCatalog";

export default function FeaturedDoctorsSection() {
  const { doctors, isLoading } = usePublicDoctors({ limit: 4 });

  return (
    <section className="w-full bg-transparent px-4 py-20 font-sans text-[#172033] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E2E8F0] pb-6 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-3xl font-bold tracking-tight text-[#0F2942] sm:text-4xl">Featured Doctors</h2>
            <p className="text-sm text-[#64748B]">Trusted board-certified experts tailored to your preliminary scan results.</p>
          </div>
          <Button asChild variant="cta"><Link href="/doctors">View All Doctors <ButtonArrow /></Link></Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[480px] animate-pulse rounded-2xl bg-slate-100" />
          )) : doctors.slice(0, 4).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </div>
    </section>
  );
}
