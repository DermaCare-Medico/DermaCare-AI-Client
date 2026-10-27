"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Calendar, ShieldCheck, Star, Stethoscope } from "lucide-react";

import { formatMoney } from "@/lib/api/format";
import { formatDateTime, formatRating } from "@/lib/doctor/utils";
import type { DoctorListItem } from "@/types/doctor";

/**
 * Public doctor card used by the All Doctors catalog page.
 * Styling mirrors the existing landing "Featured Doctors" section.
 */
export function DoctorCard({ doctor }: { doctor: DoctorListItem }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const showAvatar = Boolean(doctor.avatarUrl) && !avatarFailed;

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        {showAvatar ? (
          <Image
            src={doctor.avatarUrl as string}
            alt={doctor.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#E8F5F4] text-[#0F888D]">
            <Stethoscope size={42} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F2942]/80 via-transparent to-transparent" />

        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#0F2942] shadow-sm backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-[#0F888D]" />
            Verified
          </span>
          {doctor.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0F888D] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-white">
            {doctor.name}
          </h3>
          {doctor.matchedCondition && (
            <span className="text-xs font-medium text-teal-200">
              Matches: {doctor.matchedCondition}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3.5 p-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 text-xs">
          <div className="flex items-center gap-1 font-semibold text-[#0F2942]">
            <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
            <span>{formatRating(doctor.rating)}</span>
            {(doctor.ratingCount !== undefined || doctor.totalReviews !== undefined) && (
              <span className="font-normal text-[#64748B]">
                ({doctor.ratingCount ?? doctor.totalReviews})
              </span>
            )}
          </div>
          {doctor.nextAvailableSlot && (
            <div className="flex items-center gap-1 rounded-md bg-[#0F888D]/10 px-2 py-0.5 text-[11px] font-medium text-[#0F888D]">
              <Calendar className="h-3 w-3" />
              <span>{formatDateTime(doctor.nextAvailableSlot)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(doctor.specialties ?? []).slice(0, 3).map((spec, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#64748B]"
            >
              {spec}
            </span>
          ))}
          {(doctor.specialties ?? []).length === 0 && doctor.specialization && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#64748B]">
              {doctor.specialization}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-[#64748B]">Consultation Fee</span>
            <span className="text-base font-bold text-[#0F2942]">
              {formatMoney(doctor.consultationFee, doctor.currency ?? "USD")}
            </span>
          </div>
          <Link
            href={`/doctors/${doctor.id}`}
            className="w-full rounded-xl bg-[#0F888D] py-2.5 text-center text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b6f]"
          >
            View Profile &amp; Book
          </Link>
        </div>
      </div>
    </article>
  );
}
