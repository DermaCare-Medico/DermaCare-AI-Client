"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, FileText, Pill, Search, Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageState, PatientPageHeader, StatusPill, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import { useGetPatientPrescriptionsQuery } from "@/redux/api/prescriptionApi";

interface UnifiedPrescription {
  id: string;
  doctor: string;
  specialty: string;
  issuedOn: string;
  appointmentId: string;
  diagnosis: string;
  medicineCount: number;
}

export default function PatientPrescriptionsPage() {
  const [query, setQuery] = useState("");
  const { data: rawData, isLoading, isError, refetch } = useGetPatientPrescriptionsQuery();

  const prescriptions = useMemo<UnifiedPrescription[]>(() => {
    if (!rawData) return [];
    const body = (rawData as { data?: unknown }).data ?? rawData;
    let list: Array<Record<string, unknown>> = [];
    if (Array.isArray(body)) {
      list = body as Array<Record<string, unknown>>;
    } else if (body && typeof body === "object" && "prescriptions" in body && Array.isArray((body as { prescriptions: unknown }).prescriptions)) {
      list = (body as { prescriptions: Array<Record<string, unknown>> }).prescriptions;
    } else {
      return [];
    }

    return list.map((item) => {
      const doctorObj = (item.doctor as Record<string, unknown>) || {};
      const itemsList = Array.isArray(item.items) ? item.items : [];
      const issuedRaw = (item.issuedAt || item.createdAt || "") as string;
      const issuedDate = issuedRaw ? new Date(issuedRaw).toLocaleDateString() : "Recently";
      return {
        id: String(item.id || item._id || item.prescriptionId || ""),
        doctor: String(doctorObj.name || item.doctorName || "Doctor"),
        specialty: String(doctorObj.specialty || item.doctorSpecialty || "Dermatology"),
        issuedOn: issuedDate,
        appointmentId: String(item.appointmentId || "N/A"),
        diagnosis: String(item.diagnosis || "Consultation record"),
        medicineCount: itemsList.length,
      };
    });
  }, [rawData]);

  const filtered = useMemo(() => {
    return prescriptions.filter((item) =>
      `${item.id} ${item.doctor} ${item.diagnosis}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [prescriptions, query]);

  return (
    <div className={s.page}>
      <PatientPageHeader
        eyebrow="Clinical records"
        title="My prescriptions"
        description="View prescription summaries issued after completed consultations."
      />
      <section className={s.toolbar}>
        <label className={s.search}>
          <Search size={17} />
          <span className="sr-only">Search prescriptions</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search doctor, diagnosis, or prescription ID"
          />
        </label>
      </section>

      {isLoading ? (
        <PageState state="loading" title="Loading prescriptions..." message="Fetching your prescription history." />
      ) : isError ? (
        <PageState
          state="error"
          title="Could not load prescriptions"
          message="Unable to connect to the prescription service. Please try again later."
          onRetry={() => refetch()}
          
        />
      ) : filtered.length === 0 ? (
        <PageState
          state="empty"
          title="No prescriptions found"
          message={query ? "No prescriptions match your search criteria." : "You do not have any issued prescriptions yet."}
        />
      ) : (
        <section className={s.grid}>
          {filtered.map((item) => (
            <article className={s.card} key={item.id}>
              <div className={s.cardTop}>
                <div className={s.avatar}>
                  <FileText size={20} />
                </div>
                <StatusPill tone="success">Finalized</StatusPill>
              </div>
              <h2 style={{ marginTop: 16 }}>{item.diagnosis}</h2>
              <p className={s.muted}>{item.id} - Appointment {item.appointmentId}</p>
              <div className={s.divider} />
              <div className={s.iconLine}>
                <Stethoscope size={16} />
                <strong>{item.doctor}</strong> - {item.specialty}
              </div>
              <div className={s.iconLine} style={{ marginTop: 10 }}>
                <CalendarDays size={16} />
                {item.issuedOn}
              </div>
              <div className={s.iconLine} style={{ marginTop: 10 }}>
                <Pill size={16} />
                {item.medicineCount} medicines
              </div>
              <div className={s.actions}>
                <Button asChild variant="outline">
                  <Link href={`/patient/prescriptions/${item.id}`}>
                    View details <ChevronRight size={15} />
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/store">Explore store</Link>
                </Button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
