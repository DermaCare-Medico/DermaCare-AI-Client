export type ApplicationPreviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface DoctorApplicationPreview {
  specialization: string;
  licenseNumber: string;
  qualifications: string;
  experienceYears: string;
  consultationFee: string;
  documentName: string;
}

export interface DoctorEarningPreview {
  id: string;
  month: string;
  year: number;
  appointmentId: string;
  patientLabel: string;
  consultationDate: string;
  gross: number;
  commission: number;
  net: number;
  status: "Included" | "Pending review";
}

export type PayoutPreviewStatus = "Pending" | "Scheduled" | "Settled" | "On hold";

export interface DoctorPayoutPreview {
  id: string;
  period: string;
  gross: number;
  commission: number;
  net: number;
  appointments: number;
  status: PayoutPreviewStatus;
  settlementReference?: string;
  settlementDate?: string;
  note: string;
}

export const applicationStatusGuidance: Array<{ status: ApplicationPreviewStatus; title: string; description: string }> = [
  { status: "PENDING", title: "Pending review", description: "Documents have been received and are waiting for an administrator review." },
  { status: "APPROVED", title: "Approved", description: "Professional details were accepted and doctor workspace access can be enabled by the backend." },
  { status: "REJECTED", title: "Changes required", description: "The review response should explain which information or document needs attention." },
];

export const earningPreviews: DoctorEarningPreview[] = [
  { id: "ERN-4108", month: "October", year: 2026, appointmentId: "APT-2084", patientLabel: "Patient A.M.", consultationDate: "October 21, 2026", gross: 1200, commission: 180, net: 1020, status: "Included" },
  { id: "ERN-4096", month: "October", year: 2026, appointmentId: "APT-2061", patientLabel: "Patient R.K.", consultationDate: "October 18, 2026", gross: 1500, commission: 225, net: 1275, status: "Included" },
  { id: "ERN-4072", month: "October", year: 2026, appointmentId: "APT-2039", patientLabel: "Patient S.H.", consultationDate: "October 12, 2026", gross: 1200, commission: 180, net: 1020, status: "Pending review" },
  { id: "ERN-3994", month: "September", year: 2026, appointmentId: "APT-1994", patientLabel: "Patient A.M.", consultationDate: "September 19, 2026", gross: 1200, commission: 180, net: 1020, status: "Included" },
  { id: "ERN-3958", month: "September", year: 2026, appointmentId: "APT-1960", patientLabel: "Patient T.N.", consultationDate: "September 8, 2026", gross: 1000, commission: 150, net: 850, status: "Included" },
  { id: "ERN-3871", month: "August", year: 2026, appointmentId: "APT-1887", patientLabel: "Patient N.A.", consultationDate: "August 7, 2026", gross: 1500, commission: 225, net: 1275, status: "Included" },
];

export const payoutPreviews: DoctorPayoutPreview[] = [
  { id: "PAY-2026-10", period: "October 2026", gross: 3900, commission: 585, net: 3315, appointments: 3, status: "Pending", note: "Preview payout is awaiting the monthly review window." },
  { id: "PAY-2026-09", period: "September 2026", gross: 2200, commission: 330, net: 1870, appointments: 2, status: "Scheduled", settlementDate: "October 28, 2026", note: "The displayed settlement date is illustrative and is not a bank-transfer confirmation." },
  { id: "PAY-2026-08", period: "August 2026", gross: 1500, commission: 225, net: 1275, appointments: 1, status: "Settled", settlementReference: "DEMO-SETTLEMENT-0842", settlementDate: "September 5, 2026", note: "This is a demo settlement record only. No funds were transferred." },
  { id: "PAY-2026-07", period: "July 2026", gross: 2600, commission: 390, net: 2210, appointments: 2, status: "On hold", note: "Preview hold: one consultation requires administrative review." },
];

export const formatPreviewMoney = (value: number) => `BDT ${value.toLocaleString("en-US")}`;

