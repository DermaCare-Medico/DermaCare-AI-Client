"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Loader2,
  Pill,
  PlayCircle,
  ShieldAlert,
  StopCircle,
  UserRound,
  Video,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { AppointmentStatusBadge } from "@/components/doctor/StatusBadge";
import { ConsultationChatPopup } from "@/components/doctor/ConsultationChatPopup";
import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { PageHeader } from "@/components/doctor/PageHeader";
import { PrescriptionDialog } from "@/components/doctor/PrescriptionDialog";

import {
  useCancelAppointmentMutation,
  useFinalizePrescriptionMutation,
  useSendPrescriptionToPatientMutation,
  useGetAppointmentVideoQuery,
  useReviewCancellationMutation,
  useUpdateConsultationMutation,
} from "@/redux/api/doctorApi";
import {
  useDoctorAppointmentDetail,
  useDoctorMedications,
  useDoctorPreConsultation,
  useDoctorPrescriptions,
} from "@/src/hooks/useDoctorModule";
import {
  formatDateTime,
  getApiErrorMessage,
  humanizeStatus,
} from "@/lib/doctor/utils";
import { buildVideoUrl } from "@/types/doctor";
import type { AttachedScreening, VideoAccess } from "@/types/doctor";

function isForbidden(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && (error as { status?: number }).status === 403);
}

function ScreeningCard({ screening }: { screening: AttachedScreening }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#163A5F]">
          {screening.detectedCondition}
        </p>
        <span
          className={
            screening.riskLevel === "HIGH"
              ? "rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700"
              : screening.riskLevel === "MODERATE"
                ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                : "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
          }
        >
          {humanizeStatus(screening.riskLevel)} risk
        </span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
        <div>
          <dt className="text-slate-400">Body part</dt>
          <dd className="font-medium text-slate-700">{humanizeStatus(screening.bodyPart)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Confidence</dt>
          <dd className="font-medium text-slate-700">
            {Math.round((screening.confidenceScore ?? 0) * 100)}%
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Red flag</dt>
          <dd className="font-medium text-slate-700">
            {screening.redFlagDetected ? "Detected" : "None"}
          </dd>
        </div>
        <div>
          <dt className="text-slate-400">Screening ID</dt>
          <dd className="font-medium text-slate-700">{screening.id}</dd>
        </div>
      </dl>
      {screening.signedImageUrl && (
        <a
          href={screening.signedImageUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-medium text-[#0F777E] underline"
        >
          Open screening image
        </a>
      )}
    </div>
  );
}

export default function DoctorAppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === "string" ? params.id : undefined;

  const {
    appointment,
    isDemo,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctorAppointmentDetail(id);

  const pre = useDoctorPreConsultation(id);

  const { prescriptions, isDemo: rxDemo } = useDoctorPrescriptions();
  const appointmentPrescriptions = useMemo(
    () =>
      prescriptions.filter(
        (rx) => !rx.appointmentId || rx.appointmentId === id
      ),
    [prescriptions, id]
  );

  const {
    medications,
    isDemo: medsDemo,
    isLoading: medsLoading,
    isError: medsError,
    error: medsErr,
  } = useDoctorMedications(appointment?.patientId);

  const [updateConsultation, updateState] = useUpdateConsultationMutation();
  const [reviewCancellation, reviewState] = useReviewCancellationMutation();
  const [cancelAppointment, cancelState] = useCancelAppointmentMutation();
  const [finalizePrescription, finalizeState] = useFinalizePrescriptionMutation();
  const [sendPrescription, sendState] = useSendPrescriptionToPatientMutation();

  async function handleSend(prescriptionId: string) {
    try {
      await sendPrescription(prescriptionId).unwrap();
      toast.success("Prescription sent to patient successfully.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not send the prescription."));
    }
  }

  const [completionSummary, setCompletionSummary] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [videoRequested, setVideoRequested] = useState(false);

  const {
    data: videoData,
    isLoading: videoLoading,
    isError: videoError,
    error: videoErr,
  } = useGetAppointmentVideoQuery(id as string, { skip: !id || !videoRequested });

  const video = (videoData?.data ?? videoData) as VideoAccess | undefined;
  const videoUrl = buildVideoUrl(video);

  const status = appointment?.status;

  async function handleTransition(next: "IN_PROGRESS" | "COMPLETED") {
    if (!id) return;
    try {
      await updateConsultation({
        id,
        status: next,
        completionSummary: next === "COMPLETED" ? completionSummary.trim() || undefined : undefined,
      }).unwrap();
      toast.success(next === "IN_PROGRESS" ? "Consultation started." : "Consultation completed.");
      if (next === "COMPLETED") setCompletionSummary("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not update the consultation."));
    }
  }

  async function handleReview(action: "APPROVE" | "REJECT") {
    if (!id) return;
    if (!reviewNotes.trim()) {
      toast.error("Please add review notes for the cancellation decision.");
      return;
    }
    try {
      await reviewCancellation({ id, action, reviewNotes: reviewNotes.trim() }).unwrap();
      toast.success(action === "APPROVE" ? "Cancellation approved." : "Cancellation rejected.");
      setReviewNotes("");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not review the cancellation."));
    }
  }

  async function handleCancel() {
    if (!id) return;
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason.");
      return;
    }
    try {
      await cancelAppointment({ id, reason: cancelReason.trim() }).unwrap();
      toast.success("Appointment cancelled.");
      setCancelReason("");
      setCancelDialogOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not cancel the appointment."));
    }
  }

  async function handleFinalize(prescriptionId: string) {
    try {
      await finalizePrescription(prescriptionId).unwrap();
      toast.success("Prescription finalized.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not finalize the prescription."));
    }
  }

  const attachedScreening = pre.preConsultation?.attachedScreening ?? undefined;
  const hasFinalizedPrescription = appointmentPrescriptions.some(
    (rx) => rx.status === "FINALIZED"
  );

  return (
    <section>
      <Link
        href="/doctor/appointments"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#0F888D]"
      >
        <ArrowLeft size={16} /> Back to appointments
      </Link>

      <DataState
        isLoading={isLoading}
        isError={isError}
        error={error}
        isEmpty={!appointment}
        emptyTitle="Appointment not found"
        emptyMessage="This appointment may have been removed or you may not have access to it."
        onRetry={refetch}
      >
        {appointment && (
          <>
            <PageHeader
              eyebrow="Appointment details"
              title={appointment.patientName || "Patient consultation"}
              description={appointment.reason || "Consultation record and clinical history."}
              actions={<AppointmentStatusBadge status={appointment.status} />}
            />

            {isDemo && <DemoNotice className="mb-6" />}

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="space-y-6">
                {/* Appointment meta */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                      <CalendarClock size={18} className="text-[#0F888D]" />
                      Appointment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 sm:grid-cols-2">
                    <Info label="Scheduled time" value={formatDateTime(appointment.scheduledTime)} />
                    <Info label="Status" value={humanizeStatus(appointment.status)} />
                    <Info label="Patient" value={appointment.patientName || appointment.patientId} />
                    <Info label="Patient email" value={appointment.patientEmail || "—"} />
                    <Info
                      label="Consent to share history"
                      value={
                        appointment.consentRecorded ?? appointment.consentGiven
                          ? "Granted"
                          : "Not granted"
                      }
                    />
                    <Info label="Appointment ID" value={appointment.appointmentId} />
                  </CardContent>
                </Card>

                {/* Screening result */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                      <FlaskConical size={18} className="text-[#0F888D]" />
                      Screening result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pre.isLoading && <Spinner label="Loading screening…" />}
                    {!pre.isLoading && attachedScreening && (
                      <ScreeningCard screening={attachedScreening} />
                    )}
                    {!pre.isLoading && !attachedScreening && (
                      <p className="text-sm text-slate-500">
                        {appointment.hasScreeningAttached
                          ? "A screening is attached, but its clinical details require patient consent."
                          : "No screening attached to this booking."}
                      </p>
                    )}
                    {pre.preConsultation?.previousScreenings &&
                      pre.preConsultation.previousScreenings.length > 1 && (
                        <p className="mt-3 text-xs text-slate-400">
                          {pre.preConsultation.previousScreenings.length} previous screening record(s) on file.
                        </p>
                      )}
                  </CardContent>
                </Card>

                {/* Symptoms & medical info */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                      <HeartPulse size={18} className="text-[#0F888D]" />
                      Symptoms &amp; medical information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pre.isLoading && <Spinner label="Loading patient history…" />}

                    {!pre.isLoading && pre.isError && isForbidden(pre.error) && (
                      <p
                        role="alert"
                        className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800"
                      >
                        <ShieldAlert size={15} className="mt-0.5 shrink-0" />
                        Patient consent to share pre-consultation history was not
                        granted for this appointment.
                      </p>
                    )}

                    {!pre.isLoading && pre.isError && !isForbidden(pre.error) && (
                      <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                        {getApiErrorMessage(pre.error, "Could not load patient history.")}
                      </p>
                    )}

                    {!pre.isLoading && !pre.isError && (
                      <>
                        <Info
                          label="Patient details"
                          value={
                            [
                              pre.preConsultation?.patient?.name,
                              pre.preConsultation?.patient?.age !== undefined
                                ? `${pre.preConsultation.patient.age} yrs`
                                : undefined,
                              pre.preConsultation?.patient?.gender,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "—"
                          }
                        />
                        <Info
                          label="Skin type"
                          value={pre.preConsultation?.patient?.skinType || "—"}
                        />
                        <Info
                          label="Known allergies"
                          value={
                            pre.preConsultation?.patient?.knownAllergies &&
                            pre.preConsultation.patient.knownAllergies.length > 0
                              ? pre.preConsultation.patient.knownAllergies.join(", ")
                              : "None recorded"
                          }
                        />
                        <Info
                          label="Existing conditions"
                          value={
                            pre.preConsultation?.existingConditions &&
                            pre.preConsultation.existingConditions.length > 0
                              ? pre.preConsultation.existingConditions.join(", ")
                              : "Not provided by the current API"
                          }
                        />
                        <Info
                          label="Patient notes / symptoms"
                          value={
                            pre.preConsultation?.patientNotes ||
                            pre.preConsultation?.symptoms ||
                            "—"
                          }
                        />
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Current medicines */}
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                      <Pill size={18} className="text-[#0F888D]" />
                      Current medicines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {medsLoading && <Spinner label="Loading medication history…" />}

                    {!medsLoading && medsError && (
                      <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
                        {getApiErrorMessage(medsErr, "Could not load medication history.")}
                      </p>
                    )}

                    {!medsLoading && !medsError && medications.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No active medicines recorded for this patient.
                      </p>
                    )}

                    {!medsLoading && !medsError && medications.length > 0 && (
                      <ul className="space-y-2">
                        {medications.map((med, idx) => (
                          <li
                            key={med.id ?? idx}
                            className="rounded-lg border border-slate-200 bg-white p-3 text-sm"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-[#163A5F]">
                                {med.medicineName || "Medicine"}
                              </span>
                              <span
                                className={
                                  med.status === "history"
                                    ? "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                                    : "rounded-full bg-[#E8F5F4] px-2 py-0.5 text-xs font-medium text-[#0F777E]"
                                }
                              >
                                {med.status === "history" ? "History" : "Current"}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {[med.dosage, med.prescribedBy ? `by ${med.prescribedBy}` : undefined]
                                .filter(Boolean)
                                .join(" · ") || "—"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {medsDemo && (
                      <p className="text-[11px] text-amber-600">Showing demo medication history.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Prescriptions */}
                <Card className="border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                      <Pill size={18} className="text-[#0F888D]" />
                      Prescriptions
                    </CardTitle>
                    {(status === "IN_PROGRESS" || status === "COMPLETED") &&
                      !hasFinalizedPrescription && (
                        <Button
                          size="sm"
                          onClick={() => setPrescriptionOpen(true)}
                          className="bg-[#0F888D] hover:bg-[#0C7479]"
                        >
                          <Pill size={14} /> New prescription
                        </Button>
                      )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {appointmentPrescriptions.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No prescriptions for this consultation yet.
                      </p>
                    )}
                    {appointmentPrescriptions.map((rx) => (
                      <div
                        key={rx.id}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#163A5F]">
                              {rx.diagnosis || "Prescription"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {rx.items?.length ?? rx.itemCount ?? 0} item(s) · v{rx.version ?? 1}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                rx.status === "FINALIZED"
                                  ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                                  : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                              }
                            >
                              {humanizeStatus(rx.status)}
                            </span>
                            {rx.status === "DRAFT" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={finalizeState.isLoading}
                                onClick={() => handleFinalize(rx.id)}
                              >
                                Finalize
                              </Button>
                              )}
                              {rx.status === "FINALIZED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-[#0F888D] hover:bg-[#E8F5F4]"
                                  disabled={sendState.isLoading}
                                  onClick={() => handleSend(rx.id)}
                                >
                                  Send to patient
                                </Button>
                              )}
                          </div>
                        </div>
                        {rx.items && rx.items.length > 0 && (
                          <ul className="mt-2 space-y-1 text-xs text-slate-500">
                            {rx.items.map((item, idx) => (
                              <li key={idx}>
                                <span className="font-medium text-slate-700">
                                  {item.medicineName}
                                </span>{" "}
                                — {item.dosage}, {item.frequency}, {item.durationDays} day(s)
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                    {rxDemo && (
                      <p className="text-[11px] text-amber-600">Showing demo prescriptions.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Actions column */}
              <div className="space-y-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                      <ClipboardList size={18} className="text-[#0F888D]" />
                      Consultation actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {status === "SCHEDULED" && (
                      <Button
                        className="w-full bg-[#0F888D] hover:bg-[#0C7479]"
                        disabled={updateState.isLoading}
                        onClick={() => handleTransition("IN_PROGRESS")}
                      >
                        {updateState.isLoading ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <PlayCircle size={16} />
                        )}
                        Start consultation
                      </Button>
                    )}

                    {status === "IN_PROGRESS" && (
                      <div className="space-y-2">
                        <Textarea
                          value={completionSummary}
                          onChange={(e) => setCompletionSummary(e.target.value)}
                          placeholder="Completion summary (optional)"
                        />
                        <Button
                          className="w-full bg-[#0F888D] hover:bg-[#0C7479]"
                          disabled={updateState.isLoading}
                          onClick={() => handleTransition("COMPLETED")}
                        >
                          {updateState.isLoading ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <StopCircle size={16} />
                          )}
                          Complete consultation
                        </Button>
                      </div>
                    )}

                    {status === "CANCELLATION_REQUESTED" && (
                      <div className="space-y-2">
                        <p className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">
                          The patient requested a cancellation. Approve to release
                          the slot or reject to keep the appointment.
                        </p>
                        <Textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Review notes (required)"
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            disabled={reviewState.isLoading}
                            onClick={() => handleReview("APPROVE")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            disabled={reviewState.isLoading}
                            onClick={() => handleReview("REJECT")}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {(status === "SCHEDULED" ||
                      status === "IN_PROGRESS" ||
                      status === "COMPLETED") && (
                      <>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setVideoRequested(true)}
                          disabled={videoLoading}
                        >
                          <Video size={16} />
                          {videoLoading ? "Getting secure link…" : "Get video link"}
                        </Button>
                        {videoError && (
                          <p role="alert" className="text-xs text-rose-600">
                            {getApiErrorMessage(
                              videoErr,
                              "Video access is only available shortly before the appointment."
                            )}
                          </p>
                        )}
                        {videoUrl && (
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-lg bg-[#E8F5F4] p-3 text-xs font-medium text-[#0F777E] underline"
                          >
                            Join secure video consultation
                          </a>
                        )}
                        {(status === "SCHEDULED" || status === "IN_PROGRESS") && (
                          <Button
                            variant="outline"
                            className="w-full text-rose-600 hover:text-rose-700"
                            onClick={() => setCancelDialogOpen(true)}
                            disabled={cancelState.isLoading}
                          >
                            <XCircle size={16} /> Cancel appointment
                          </Button>
                        )}
                      </>
                    )}

                    {status === "COMPLETED" && (
                      <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                        Consultation completed
                        {appointment.consultationSummary
                          ? `: ${appointment.consultationSummary}`
                          : "."}{" "}
                        {hasFinalizedPrescription
                          ? "The prescription has been submitted. You can chat with the patient for 7 days."
                          : "Issue a prescription if required, and chat with the patient for 7 days."}
                      </p>
                    )}

                    {status === "CANCELLED" && (
                      <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                        This appointment was cancelled.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                      <FileText size={18} className="text-[#0F888D]" />
                      Quick facts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <UserRound size={15} className="text-slate-400" />
                      {appointment.patientName || appointment.patientId}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarClock size={15} className="text-slate-400" />
                      {formatDateTime(appointment.scheduledTime)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <PrescriptionDialog
              appointmentId={appointment.appointmentId}
              open={prescriptionOpen}
              onOpenChange={setPrescriptionOpen}
            />

            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel appointment</DialogTitle>
                  <DialogDescription>
                    This notifies the patient and frees the slot. This action cannot
                    be undone.
                  </DialogDescription>
                </DialogHeader>
                <Input
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                    Keep appointment
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={cancelState.isLoading}
                    onClick={handleCancel}
                  >
                    {cancelState.isLoading ? "Cancelling…" : "Confirm cancellation"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {status === "COMPLETED" && id && (
              <ConsultationChatPopup appointmentId={id} />
            )}
          </>
        )}
      </DataState>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 text-sm text-slate-700">{value}</p>
    </div>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 size={15} className="animate-spin" /> {label}
    </p>
  );
}
