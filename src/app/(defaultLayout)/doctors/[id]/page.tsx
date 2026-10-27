"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  GraduationCap,
  ShieldCheck,
  Star,
  Stethoscope,
} from "lucide-react";

import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { formatMoney } from "@/lib/api/format";
import { formatCurrency, formatDateTime, formatRating, qualificationList } from "@/lib/doctor/utils";
import { usePublicDoctor, usePublicDoctorSlots } from "@/src/hooks/usePublicCatalog";
import { useAppSelector } from "@/redux/hooks";
import { useBookAppointmentMutation } from "@/redux/api/appointmentApi";
import { useState } from "react";

export default function PublicDoctorProfilePage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : undefined;

  const { doctor, isDemo, isLoading, isError, error, refetch } = usePublicDoctor(id);
  const slotsState = usePublicDoctorSlots(id);
  const searchParams = useSearchParams();
  const role = useAppSelector((state) => state.auth.user?.role);
  const token = useAppSelector((state) => state.auth.token);
  const [bookAppointment, bookingState] = useBookAppointmentMutation();
  const [bookingNotice, setBookingNotice] = useState("");
  const book = async (slotId: string) => {
    if (!id) return;
    setBookingNotice("");
    try {
      const response = await bookAppointment({ doctorId: id, slotId, screeningId: searchParams.get("screeningId") || undefined, historySharingConsent: true }).unwrap();
      const appointmentId = response.data.appointmentId ?? response.data.id;
      setBookingNotice("Appointment request created successfully.");
      if (appointmentId) window.location.assign(`/patient/appointments/${encodeURIComponent(appointmentId)}`);
    } catch (error) {
      if (typeof error === "object" && error && "data" in error && typeof error.data === "object" && error.data && "message" in error.data && typeof error.data.message === "string") setBookingNotice(error.data.message);
      else setBookingNotice("The appointment could not be booked.");
    }
  };

  const qualifications = qualificationList(doctor?.qualifications);
  const availableSlots = slotsState.slots
    .filter((slot) => !slot.status || slot.status === "AVAILABLE")
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

  return (
    <section className="min-h-screen bg-[#F7F9FC] px-6 py-12 font-sans text-[#172033] md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link
          href="/doctors"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#64748B] transition-colors hover:text-[#0F888D]"
        >
          <ArrowLeft size={16} /> Back to all doctors
        </Link>

        {isDemo && (
          <DemoNotice description="The backend doctor service is not implemented yet, so a placeholder profile is shown." />
        )}

        <DataState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!doctor}
          emptyTitle="Doctor not found"
          emptyMessage="This profile may have been removed or is not yet verified."
          onRetry={refetch}
          skeleton={
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white" />
              <div className="h-56 animate-pulse rounded-2xl border border-[#E2E8F0] bg-white" />
            </div>
          }
        >
          {doctor && (
            <>
              {/* Profile header */}
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#E8F5F4] text-[#0F888D]">
                    <Stethoscope size={28} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight text-[#0F2942]">
                        {doctor.name}
                      </h1>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5F4] px-2 py-0.5 text-xs font-semibold text-[#0F777E]">
                        <ShieldCheck size={13} /> Verified
                      </span>
                    </div>

                    {doctor.specialties && doctor.specialties.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {doctor.specialties.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-[#64748B]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#64748B]">
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0F2942]">
                        <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                        {formatRating(doctor.rating)}
                        {(doctor.ratingCount ?? doctor.reviewCount ?? doctor.totalReviews) !==
                          undefined && (
                          <span className="font-normal text-[#64748B]">
                            ({doctor.ratingCount ?? doctor.reviewCount ?? doctor.totalReviews} reviews)
                          </span>
                        )}
                      </span>
                      {(doctor.experienceYears ?? doctor.yearsExperience) !==
                        undefined && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap size={15} />
                          {doctor.experienceYears ?? doctor.yearsExperience} years experience
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <span className="text-xs text-[#64748B]">Consultation fee</span>
                    <span className="text-2xl font-bold text-[#0F2942]">
                      {formatMoney(doctor.consultationFee, doctor.currency ?? "USD")}
                    </span>
                    <Link
                      href={token && role === "PATIENT" ? "#available-slots" : "/login"}
                      className="rounded-xl bg-[#0F888D] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0c6b6f]"
                    >
                      {token && role === "PATIENT" ? "Choose a slot" : "Sign in to book"}
                    </Link>
                    <p className="max-w-[12rem] text-[11px] leading-4 text-[#94A3B8]">
                      Booking happens after you sign in as a patient.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                {/* Bio + qualifications */}
                <div className="space-y-6">
                  <div id="available-slots" className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-bold text-[#0F2942]">
                      <BadgeCheck size={18} className="text-[#0F888D]" />
                      About
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-[#64748B]">
                      {doctor.bio ||
                        "This doctor has not added a professional bio yet."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-bold text-[#0F2942]">
                      <GraduationCap size={18} className="text-[#0F888D]" />
                      Qualifications
                    </h2>
                    {qualifications.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {qualifications.map((q, i) => (
                          <li
                            key={i}
                            className="rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] p-3 text-sm text-[#334155]"
                          >
                            {q}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-[#64748B]">
                        No qualifications on record yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
                    <h2 className="flex items-center gap-2 text-base font-bold text-[#0F2942]">
                      <CalendarClock size={18} className="text-[#0F888D]" />
                      Available slots
                    </h2>
                    <div className="mt-3">
                      <DataState
                        isLoading={slotsState.isLoading}
                        isError={slotsState.isError}
                        error={slotsState.error}
                        isEmpty={availableSlots.length === 0}
                        emptyTitle="No open slots"
                        emptyMessage="This doctor has not published any available times yet."
                        onRetry={slotsState.refetch}
                      >
                        <ul className="space-y-2">
                          {availableSlots.map((slot) => (
                            <li
                              key={slot.id}
                              className="flex items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F7F9FC] px-3 py-2 text-sm"
                            >
                              <span className="text-[#334155]">
                                {formatDateTime(slot.startTime)}
                              </span>
                              {slot.fee !== undefined && (
                                <span className="text-xs font-semibold text-[#0F2942]">
                                  {formatCurrency(slot.fee)}
                                </span>
                              )}
                              {token && role === "PATIENT" ? <button type="button" disabled={bookingState.isLoading} onClick={() => void book(slot.id)} className="rounded-lg bg-[#0F888D] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">Book</button> : null}
                            </li>
                          ))}
                        </ul>
                      </DataState>
                      {bookingNotice ? <p className="mt-3 text-xs text-[#64748B]" role="status">{bookingNotice}</p> : null}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">
                    Preliminary AI screening is not a diagnosis. A consultation
                    with a qualified dermatologist is required for medical advice.
                  </div>
                </div>
              </div>
            </>
          )}
        </DataState>
      </div>
    </section>
  );
}
