"use client";

import { useMemo } from "react";

import {
  useGetAppointmentByIdQuery,
  useGetAppointmentsQuery,
  useGetDoctorByIdQuery,
  useGetDoctorSlotsQuery,
  useGetMedicationsQuery,
  useGetPreConsultationQuery,
  useGetPrescriptionsQuery,
} from "@/redux/api/doctorApi";
import {
  DOCTOR_DEMO_ENABLED,
  demoAppointmentDetails,
  demoAppointments,
  demoDoctorId,
  demoDoctorProfile,
  demoMedications,
  demoPreConsultations,
  demoPrescriptions,
  demoSlots,
} from "@/src/app/(dashboardLayout)/doctor/mockData";
import {
  extractList,
  normalizeAppointmentDetail,
  normalizeAppointments,
  normalizeDoctorProfile,
  unwrapEnvelope,
} from "@/types/doctor";
import type {
  AppointmentDetail,
  AppointmentStatus,
  DoctorSlot,
  Medication,
  PreConsultation,
  Prescription,
} from "@/types/doctor";

/**
 * Doctor Module data hooks.
 *
 * Each hook calls the real backend contract and only falls back to clearly
 * separated demo data when (a) the request has failed AND (b) demo mode is
 * explicitly enabled (`NEXT_PUBLIC_DOCTOR_DEMO=true`). `isDemo` is exposed so
 * the UI can show a visible demo notice.
 */

export function useDoctorAppointments(
  status?: AppointmentStatus,
  page = 1,
  limit = 10
) {
  const query = useGetAppointmentsQuery({ status, page, limit });
  const live = useMemo(
    () => normalizeAppointments(unwrapEnvelope(query.data)),
    [query.data]
  );
  const isDemo = query.isError && DOCTOR_DEMO_ENABLED;
  const appointments = useMemo(() => {
    if (!isDemo) return live;
    return status ? demoAppointments.filter((a) => a.status === status) : demoAppointments;
  }, [isDemo, live, status]);

  return {
    appointments,
    pagination: query.data?.pagination,
    isDemo,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDoctorAppointmentDetail(id: string | undefined) {
  const query = useGetAppointmentByIdQuery(id as string, { skip: !id });
  const detail = useMemo(
    () => normalizeAppointmentDetail(unwrapEnvelope(query.data)) ?? undefined,
    [query.data]
  );

  const isDemo = query.isError && DOCTOR_DEMO_ENABLED;
  const data: AppointmentDetail | undefined =
    isDemo && id ? demoAppointmentDetails[id] : detail;

  return {
    appointment: data,
    isDemo,
    isLoading: query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDoctorPreConsultation(id: string | undefined) {
  const query = useGetPreConsultationQuery(id as string, { skip: !id });
  const data = useMemo(() => {
    const payload = unwrapEnvelope(query.data);
    return payload && typeof payload === "object"
      ? (payload as PreConsultation)
      : undefined;
  }, [query.data]);

  const isDemo = query.isError && DOCTOR_DEMO_ENABLED;
  const preConsultation = isDemo && id ? demoPreConsultations[id] : data;

  return {
    preConsultation,
    isDemo,
    isLoading: query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDoctorProfile(doctorId?: string) {
  const id = doctorId || demoDoctorId;
  const query = useGetDoctorByIdQuery(id, { skip: !doctorId });
  const data = useMemo(() => {
    const payload = unwrapEnvelope(query.data);
    return payload ? normalizeDoctorProfile(payload) ?? undefined : undefined;
  }, [query.data]);

  const isDemo = (!doctorId || query.isError) && DOCTOR_DEMO_ENABLED;
  const profile = isDemo ? demoDoctorProfile : data;

  return {
    profile,
    isDemo,
    isLoading: Boolean(doctorId) && query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDoctorSlots(doctorId?: string) {
  const id = doctorId || demoDoctorId;
  const query = useGetDoctorSlotsQuery({ doctorId: id }, { skip: !doctorId });
  const live = useMemo(
    () => extractList<DoctorSlot>(unwrapEnvelope(query.data)),
    [query.data]
  );
  const isDemo = (!doctorId || query.isError) && DOCTOR_DEMO_ENABLED;
  const slots = isDemo ? demoSlots : live;

  return {
    slots,
    isDemo,
    isLoading: Boolean(doctorId) && query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDoctorPrescriptions() {
  const query = useGetPrescriptionsQuery();
  const live = useMemo(
    () => extractList<Prescription>(unwrapEnvelope(query.data)),
    [query.data]
  );
  const isDemo = query.isError && DOCTOR_DEMO_ENABLED;
  const prescriptions = isDemo ? demoPrescriptions : live;

  return {
    prescriptions,
    isDemo,
    isLoading: query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDoctorMedications(patientId?: string) {
  const query = useGetMedicationsQuery(patientId ? { patientId } : undefined, {
    skip: !patientId,
  });
  const live = useMemo(
    () => extractList<Medication>(unwrapEnvelope(query.data)),
    [query.data]
  );
  const isDemo = (!patientId || query.isError) && DOCTOR_DEMO_ENABLED;
  const medications = isDemo ? demoMedications : live;

  return {
    medications,
    isDemo,
    isLoading: Boolean(patientId) && query.isLoading,
    isError: query.isError && !isDemo,
    error: query.error,
    refetch: query.refetch,
  };
}
