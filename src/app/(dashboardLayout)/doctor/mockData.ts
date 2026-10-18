/**
 * Doctor Module DEMO DATA.
 *
 * ⚠️ This file is intentionally isolated from the real API services.
 * The DermaCare AI backend (`DermaCare-AI-Server`) has its doctor/appointment/
 * prescription/chat modules scaffolded but **not implemented** (all module files
 * are empty as of 2026-10-18), so live calls return errors.
 *
 * Demo data is ONLY surfaced when `NEXT_PUBLIC_DOCTOR_DEMO === "true"` AND the
 * real request has failed. Every read that falls back to this data renders a
 * visible "Demo data" notice, and mutations NEVER fake success.
 */
import type {
  AppointmentDetail,
  AppointmentSummary,
  AttachedScreening,
  ChatMessage,
  Conversation,
  DoctorProfile,
  DoctorSlot,
  Medication,
  PreConsultation,
  Prescription,
} from "@/types/doctor";

export const DOCTOR_DEMO_ENABLED =
  process.env.NEXT_PUBLIC_DOCTOR_DEMO === "true";

function isoAt(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const demoDoctorId = "doc_demo_001";
export const demoDoctorName = "Dr. Elena Rodriguez";

export const demoAppointments: AppointmentSummary[] = [
  {
    appointmentId: "apt_demo_1001",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    patientId: "usr_demo_alex",
    patientName: "Alex Walker",
    status: "SCHEDULED",
    scheduledTime: isoAt(0, 9, 30),
  },
  {
    appointmentId: "apt_demo_1002",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    patientId: "usr_demo_priya",
    patientName: "Priya Nair",
    status: "SCHEDULED",
    scheduledTime: isoAt(0, 14, 0),
  },
  {
    appointmentId: "apt_demo_1003",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    patientId: "usr_demo_maria",
    patientName: "Maria Garcia",
    status: "IN_PROGRESS",
    scheduledTime: isoAt(0, 11, 15),
  },
  {
    appointmentId: "apt_demo_1004",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    patientId: "usr_demo_robert",
    patientName: "Robert Johnson",
    status: "COMPLETED",
    scheduledTime: isoAt(-1, 16, 0),
  },
  {
    appointmentId: "apt_demo_1005",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    patientId: "usr_demo_jane",
    patientName: "Jane Smith",
    status: "COMPLETED",
    scheduledTime: isoAt(-2, 10, 0),
  },
  {
    appointmentId: "apt_demo_1006",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    patientId: "usr_demo_sam",
    patientName: "Sam Lee",
    status: "CANCELLATION_REQUESTED",
    scheduledTime: isoAt(1, 15, 30),
  },
];

const demoAlexScreening: AttachedScreening = {
  id: "scr_demo_7712",
  screeningId: "scr_demo_7712",
  bodyPart: "FOREARM",
  detectedCondition: "Atopic Dermatitis",
  confidenceScore: 0.84,
  riskLevel: "LOW",
  redFlagDetected: false,
};

export const demoAppointmentDetails: Record<string, AppointmentDetail> = {
  apt_demo_1001: {
    ...demoAppointments[0],
    patientEmail: "alex.walker@example.com",
    consentRecorded: true,
    hasScreeningAttached: true,
    screeningId: "scr_demo_7712",
    reason: "Recurring dry, itchy patches on the left forearm.",
    patientNotes: "Flare-ups worse after hot showers. No fever.",
  },
  apt_demo_1002: {
    ...demoAppointments[1],
    patientEmail: "priya.nair@example.com",
    consentRecorded: true,
    hasScreeningAttached: true,
    screeningId: "scr_demo_8820",
    reason: "Mole on the shoulder changed colour over 3 weeks.",
  },
  apt_demo_1003: {
    ...demoAppointments[2],
    patientEmail: "maria.garcia@example.com",
    consentRecorded: true,
    hasScreeningAttached: true,
    screeningId: "scr_demo_8831",
    reason: "Persistent facial redness and flushing.",
  },
  apt_demo_1004: {
    ...demoAppointments[3],
    patientEmail: "robert.johnson@example.com",
    consentRecorded: true,
    hasScreeningAttached: true,
    screeningId: "scr_demo_7712",
    reason: "Follow-up for eczema management.",
    consultationSummary: "Responding well to topical therapy. Continue for 2 weeks.",
  },
  apt_demo_1005: {
    ...demoAppointments[4],
    patientEmail: "jane.smith@example.com",
    consentRecorded: true,
    reason: "Annual skin check.",
    consultationSummary: "No suspicious lesions. Routine review in 12 months.",
  },
  apt_demo_1006: {
    ...demoAppointments[5],
    patientEmail: "sam.lee@example.com",
    consentRecorded: true,
    reason: "Itchy rash on the back.",
  },
};

export const demoPreConsultations: Record<string, PreConsultation> = {
  apt_demo_1001: {
    appointmentId: "apt_demo_1001",
    patient: {
      id: "usr_demo_alex",
      name: "Alex Walker",
      age: 34,
      gender: "Female",
      skinType: "Combination",
      knownAllergies: ["Penicillin"],
    },
    attachedScreening: demoAlexScreening,
    patientNotes: "Dryness, mild itching, no bleeding or oozing.",
    previousScreenings: [demoAlexScreening],
  },
  apt_demo_1002: {
    appointmentId: "apt_demo_1002",
    patient: {
      id: "usr_demo_priya",
      name: "Priya Nair",
      age: 41,
      gender: "Female",
      skinType: "Fair",
      knownAllergies: [],
    },
    attachedScreening: {
      id: "scr_demo_8820",
      screeningId: "scr_demo_8820",
      bodyPart: "SHOULDER",
      detectedCondition: "Atypical Nevus (suspected)",
      confidenceScore: 0.71,
      riskLevel: "MODERATE",
      redFlagDetected: true,
    },
    patientNotes: "Colour change, slightly raised, no bleeding.",
  },
  apt_demo_1003: {
    appointmentId: "apt_demo_1003",
    patient: {
      id: "usr_demo_maria",
      name: "Maria Garcia",
      age: 29,
      gender: "Female",
      skinType: "Sensitive",
      knownAllergies: ["Fragrance", "Latex"],
    },
    attachedScreening: {
      id: "scr_demo_8831",
      screeningId: "scr_demo_8831",
      bodyPart: "FACE",
      detectedCondition: "Rosacea",
      confidenceScore: 0.79,
      riskLevel: "LOW",
      redFlagDetected: false,
    },
    patientNotes: "Facial flushing worse after spicy food.",
  },
};

export const demoDoctorProfile: DoctorProfile = {
  id: demoDoctorId,
  name: demoDoctorName,
  email: "elena.rodriguez@dermacare.local",
  phone: "+1 (555) 123-4567",
  specialization: "Dermatology",
  specialties: ["Acne & Scarring", "Inflammatory Skin Disease", "Skin Cancer Screening"],
  qualifications:
    "MD, Dermatology — Johns Hopkins University (2015); Board Certified, American Academy of Dermatology",
  yearsExperience: 8,
  consultationFee: 75,
  currency: "USD",
  bio: "Dermatologist focused on teledermatology, inflammatory skin disease, and skin cancer screening.",
  rating: 4.8,
  reviewCount: 132,
  totalReviews: 132,
  verificationStatus: "APPROVED",
  licenseStatus: "APPROVED",
  licenseNumber: "DERM-2018-4521",
};

export const demoSlots: DoctorSlot[] = [
  { id: "slot_demo_1", doctorId: demoDoctorId, startTime: isoAt(1, 9), endTime: isoAt(1, 9, 30), durationMinutes: 30, fee: 75, status: "AVAILABLE" },
  { id: "slot_demo_2", doctorId: demoDoctorId, startTime: isoAt(1, 10), endTime: isoAt(1, 10, 30), durationMinutes: 30, fee: 75, status: "AVAILABLE" },
  { id: "slot_demo_3", doctorId: demoDoctorId, startTime: isoAt(2, 13), endTime: isoAt(2, 13, 30), durationMinutes: 30, fee: 75, status: "BOOKED" },
  { id: "slot_demo_4", doctorId: demoDoctorId, startTime: isoAt(3, 15), endTime: isoAt(3, 15, 30), durationMinutes: 30, fee: 80, status: "AVAILABLE" },
];

export const demoPrescriptions: Prescription[] = [
  {
    id: "rx_demo_3001",
    appointmentId: "apt_demo_1004",
    patientId: "usr_demo_robert",
    patientName: "Robert Johnson",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    diagnosis: "Atopic dermatitis (mild)",
    doctorNotes: "Apply after bathing; avoid fragrance.",
    status: "FINALIZED",
    version: 1,
    itemCount: 1,
    items: [
      {
        medicineName: "Hydrocortisone 1% Cream",
        dosage: "Thin layer",
        frequency: "Twice daily",
        durationDays: 14,
        instructions: "Apply to affected area after cleansing.",
      },
    ],
    createdAt: isoAt(-1, 16, 30),
    finalizedAt: isoAt(-1, 16, 45),
    digitalSignature: "DEMO-SIGNATURE",
  },
  {
    id: "rx_demo_3002",
    appointmentId: "apt_demo_1001",
    patientId: "usr_demo_alex",
    patientName: "Alex Walker",
    doctorId: demoDoctorId,
    doctorName: demoDoctorName,
    diagnosis: "Atopic dermatitis",
    doctorNotes: "Draft pending final review.",
    status: "DRAFT",
    version: 1,
    itemCount: 0,
    items: [],
    createdAt: isoAt(0, 9, 45),
  },
];

export const demoMedications: Medication[] = [
  { id: "med_1", medicineName: "Hydrocortisone 1% Cream", dosage: "Thin layer", prescribedBy: demoDoctorName, startDate: isoAt(-14, 9), endDate: isoAt(0, 9), status: "current" },
  { id: "med_2", medicineName: "Cetirizine 10mg", dosage: "1 tablet", prescribedBy: demoDoctorName, startDate: isoAt(-30, 9), endDate: isoAt(0, 9), status: "current" },
  { id: "med_3", medicineName: "Amoxicillin 500mg", dosage: "1 capsule", prescribedBy: "Dr. H. Kim", startDate: isoAt(-60, 9), endDate: isoAt(-53, 9), status: "history" },
];

export const demoConversation: Conversation = {
  conversationId: "conv_demo_9001",
  appointmentId: "apt_demo_1004",
  patientId: "usr_demo_robert",
  doctorId: demoDoctorId,
  isActive: true,
  completedAt: isoAt(-1, 16, 45),
  expiresAt: isoAt(6, 16, 0),
  totalMessages: 2,
};

export const demoMessages: ChatMessage[] = [
  {
    id: "msg_1",
    conversationId: "conv_demo_9001",
    senderId: "usr_demo_robert",
    senderRole: "PATIENT",
    senderName: "Robert Johnson",
    content: "Doctor, the redness improved after two days. Should I continue?",
    sentAt: isoAt(-1, 17, 0),
  },
  {
    id: "msg_2",
    conversationId: "conv_demo_9001",
    senderId: demoDoctorId,
    senderRole: "DOCTOR",
    senderName: demoDoctorName,
    content: "Yes, continue for the full 14 days and keep the area moisturised.",
    sentAt: isoAt(-1, 17, 5),
  },
];
