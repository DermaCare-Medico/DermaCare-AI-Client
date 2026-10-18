"use client";

import { useMemo } from "react";

import {
  useGetDoctorsQuery,
  useGetPublicDoctorByIdQuery,
  useGetPublicDoctorSlotsQuery,
  useGetStoreMedicinesQuery,
  type DoctorSearchArgs,
  type MedicineSearchArgs,
} from "@/redux/api/publicApi";
import {
  PUBLIC_DEMO_ENABLED,
  demoDoctorProfiles,
  demoDoctors,
  demoMedicines,
  demoPublicSlots,
} from "@/lib/public/demoData";
import { extractList, unwrapEnvelope } from "@/types/doctor";
import type { DoctorListItem, DoctorProfile, DoctorSlot, Medicine } from "@/types/doctor";

/**
 * Public Pages data hooks.
 *
 * Mirrors the Doctor Module pattern: call the real backend contract, and only
 * fall back to clearly separated demo data when (a) the request failed AND
 * (b) `NEXT_PUBLIC_PUBLIC_DEMO === "true"`. `isDemo` drives the visible notice.
 */

export function usePublicDoctors(args?: DoctorSearchArgs) {
  const query = useGetDoctorsQuery(args);
  const live = useMemo(
    () => extractList<DoctorListItem>(unwrapEnvelope(query.data)),
    [query.data]
  );
  const isDemo = query.isError && PUBLIC_DEMO_ENABLED;

  const rawSearch = args?.search;
  const specialty = args?.specialty;

  const doctors = useMemo(() => {
    if (!isDemo) return live;
    const search = rawSearch?.toLowerCase().trim();
    const specialtyFilter = specialty?.toLowerCase().trim();
    return demoDoctors.filter((doctor) => {
      const matchesSearch =
        !search ||
        doctor.name.toLowerCase().includes(search) ||
        (doctor.specialties ?? []).some((s) => s.toLowerCase().includes(search));
      const matchesSpecialty =
        !specialtyFilter ||
        (doctor.specialties ?? []).some((s) =>
          s.toLowerCase().includes(specialtyFilter)
        );
      return matchesSearch && matchesSpecialty;
    });
  }, [isDemo, live, rawSearch, specialty]);

  return {
    doctors,
    isDemo,
    isLoading: query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePublicDoctor(doctorId: string | undefined) {
  const query = useGetPublicDoctorByIdQuery(doctorId as string, {
    skip: !doctorId,
  });
  const live = useMemo(() => {
    const payload = unwrapEnvelope(query.data);
    return payload && typeof payload === "object"
      ? (payload as DoctorProfile)
      : undefined;
  }, [query.data]);

  const isDemo = query.isError && PUBLIC_DEMO_ENABLED;
  const doctor = isDemo && doctorId ? demoDoctorProfiles[doctorId] : live;

  return {
    doctor,
    isDemo,
    isLoading: query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePublicDoctorSlots(doctorId: string | undefined) {
  const query = useGetPublicDoctorSlotsQuery(
    { doctorId: doctorId as string },
    { skip: !doctorId }
  );
  const live = useMemo(
    () => extractList<DoctorSlot>(unwrapEnvelope(query.data)),
    [query.data]
  );
  const isDemo = query.isError && PUBLIC_DEMO_ENABLED;
  const slots = isDemo ? demoPublicSlots : live;

  return {
    slots,
    isDemo,
    isLoading: query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useStoreMedicines(args?: MedicineSearchArgs) {
  const query = useGetStoreMedicinesQuery(args);
  const live = useMemo(
    () => extractList<Medicine>(unwrapEnvelope(query.data)),
    [query.data]
  );
  const isDemo = query.isError && PUBLIC_DEMO_ENABLED;

  const rawSearch = args?.search;
  const category = args?.category;
  const requiresPrescription = args?.requiresPrescription;

  const medicines = useMemo(() => {
    if (!isDemo) return live;
    const search = rawSearch?.toLowerCase().trim();
    return demoMedicines.filter((medicine) => {
      const matchesSearch =
        !search ||
        medicine.name.toLowerCase().includes(search) ||
        (medicine.genericName ?? "").toLowerCase().includes(search);
      const matchesCategory = !category || medicine.category === category;
      const matchesRx =
        requiresPrescription === undefined ||
        medicine.requiresPrescription === requiresPrescription;
      return matchesSearch && matchesCategory && matchesRx;
    });
  }, [isDemo, live, rawSearch, category, requiresPrescription]);

  return {
    medicines,
    isDemo,
    isLoading: query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}
