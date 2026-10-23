export type ScreeningStatus = "Completed" | "Needs review" | "Processing";

export interface PatientScreeningPreview {
  id: string;
  date: string;
  bodyArea: string;
  topPrediction: string;
  confidence: number;
  status: ScreeningStatus;
  risk: "Low" | "Moderate" | "High";
  redFlags: string[];
  summary: string;
  predictions: Array<{ condition: string; confidence: number }>;
}

export type AppointmentStatus =
  | "Pending"
  | "Approved"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface PatientAppointmentPreview {
  id: string;
  doctor: string;
  initials: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  paymentStatus: "Not available" | "Payment due" | "Paid" | "Not required";
  consultationStatus: "Awaiting approval" | "Not started" | "Ready" | "Completed" | "Unavailable";
  fee: string;
  meetingType: string;
  cancellationNote?: string;
}

export interface PatientPrescriptionPreview {
  id: string;
  doctor: string;
  specialty: string;
  issuedOn: string;
  diagnosis: string;
  medicineCount: number;
  appointmentId: string;
  patientName: string;
  status: "Finalized";
  advice: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
}

export type OrderStatus = "Pending" | "Processing" | "Packed" | "Out for delivery" | "Delivered" | "Cancelled";

export interface PatientOrderPreview {
  id: string;
  placedOn: string;
  status: OrderStatus;
  paymentStatus: "Paid" | "Payment pending" | "Refunded";
  deliveryAddress: string;
  estimatedDelivery: string;
  subtotal: string;
  deliveryFee: string;
  total: string;
  prescriptionId?: string;
  items: Array<{ name: string; strength: string; quantity: number; unitPrice: string; lineTotal: string }>;
}

export type NotificationType = "Appointment" | "Prescription" | "Order" | "Screening";

export interface PatientNotificationPreview {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  href: string;
}

export const screeningPreviews: PatientScreeningPreview[] = [
  {
    id: "scr-1024",
    date: "October 21, 2026",
    bodyArea: "Left forearm",
    topPrediction: "Eczema",
    confidence: 86,
    status: "Completed",
    risk: "Low",
    redFlags: [],
    summary: "The image pattern may be consistent with an inflammatory skin condition. A clinician should confirm the result.",
    predictions: [
      { condition: "Eczema", confidence: 86 },
      { condition: "Psoriasis", confidence: 9 },
      { condition: "Contact dermatitis", confidence: 5 },
    ],
  },
  {
    id: "scr-1018",
    date: "October 12, 2026",
    bodyArea: "Upper back",
    topPrediction: "Needs clinical review",
    confidence: 61,
    status: "Needs review",
    risk: "Moderate",
    redFlags: ["Recent change in appearance", "Reported tenderness"],
    summary: "The screening is uncertain and includes symptoms that should be reviewed by a dermatologist.",
    predictions: [
      { condition: "Benign tumor", confidence: 61 },
      { condition: "Mole", confidence: 24 },
      { condition: "Other / uncertain", confidence: 15 },
    ],
  },
  {
    id: "scr-1004",
    date: "September 28, 2026",
    bodyArea: "Face",
    topPrediction: "Acne",
    confidence: 92,
    status: "Completed",
    risk: "Low",
    redFlags: [],
    summary: "The visible pattern may be consistent with acne. Treatment recommendations require professional review.",
    predictions: [
      { condition: "Acne", confidence: 92 },
      { condition: "Rosacea", confidence: 6 },
      { condition: "Other / uncertain", confidence: 2 },
    ],
  },
  {
    id: "scr-0996",
    date: "September 20, 2026",
    bodyArea: "Right hand",
    topPrediction: "Analysis pending",
    confidence: 0,
    status: "Processing",
    risk: "Low",
    redFlags: [],
    summary: "The preview record is waiting for analysis. No result is available yet.",
    predictions: [],
  },
];

export const appointmentPreviews: PatientAppointmentPreview[] = [
  {
    id: "APT-2084",
    doctor: "Dr. Maya Rahman",
    initials: "MR",
    specialty: "Consultant Dermatologist",
    date: "October 28, 2026",
    time: "10:30 AM–11:00 AM",
    status: "Confirmed",
    paymentStatus: "Paid",
    consultationStatus: "Ready",
    fee: "BDT 1,200",
    meetingType: "Secure video consultation",
  },
  {
    id: "APT-2071",
    doctor: "Dr. Nabil Hasan",
    initials: "NH",
    specialty: "Dermatology & Dermatosurgery",
    date: "October 30, 2026",
    time: "4:00 PM–4:30 PM",
    status: "Approved",
    paymentStatus: "Payment due",
    consultationStatus: "Not started",
    fee: "BDT 1,500",
    meetingType: "Secure video consultation",
  },
  {
    id: "APT-2056",
    doctor: "Dr. Samira Chowdhury",
    initials: "SC",
    specialty: "Clinical Dermatologist",
    date: "November 2, 2026",
    time: "12:00 PM–12:30 PM",
    status: "Pending",
    paymentStatus: "Not available",
    consultationStatus: "Awaiting approval",
    fee: "BDT 1,000",
    meetingType: "Secure video consultation",
  },
  {
    id: "APT-1994",
    doctor: "Dr. Maya Rahman",
    initials: "MR",
    specialty: "Consultant Dermatologist",
    date: "September 19, 2026",
    time: "9:30 AM–10:00 AM",
    status: "Completed",
    paymentStatus: "Paid",
    consultationStatus: "Completed",
    fee: "BDT 1,200",
    meetingType: "Secure video consultation",
  },
  {
    id: "APT-1978",
    doctor: "Dr. Fahim Ahmed",
    initials: "FA",
    specialty: "Dermatologist",
    date: "September 11, 2026",
    time: "3:00 PM–3:30 PM",
    status: "Cancelled",
    paymentStatus: "Not required",
    consultationStatus: "Unavailable",
    fee: "BDT 900",
    meetingType: "Secure video consultation",
    cancellationNote: "This appointment was cancelled before payment. No charge was made.",
  },
];

export const prescriptionPreviews: PatientPrescriptionPreview[] = [
  {
    id: "RX-1182",
    doctor: "Dr. Maya Rahman",
    specialty: "Consultant Dermatologist",
    issuedOn: "September 19, 2026",
    diagnosis: "Atopic dermatitis",
    medicineCount: 3,
    appointmentId: "APT-1994",
    patientName: "Alex Morgan",
    status: "Finalized",
    advice: "Moisturize immediately after bathing, avoid fragranced products, and arrange a follow-up if symptoms persist or worsen.",
    medicines: [
      { name: "Hydrocortisone 1% cream", dosage: "Thin layer", frequency: "Twice daily", duration: "7 days" },
      { name: "Cetirizine 10 mg", dosage: "1 tablet", frequency: "Once nightly", duration: "10 days" },
      { name: "Fragrance-free emollient", dosage: "As needed", frequency: "3–4 times daily", duration: "4 weeks" },
    ],
  },
  {
    id: "RX-1147",
    doctor: "Dr. Nabil Hasan",
    specialty: "Dermatology & Dermatosurgery",
    issuedOn: "August 7, 2026",
    diagnosis: "Acne vulgaris",
    medicineCount: 2,
    appointmentId: "APT-1887",
    patientName: "Alex Morgan",
    status: "Finalized",
    advice: "Use a gentle cleanser and non-comedogenic sunscreen. Stop treatment and seek advice if severe irritation develops.",
    medicines: [
      { name: "Adapalene 0.1% gel", dosage: "Pea-sized amount", frequency: "Once nightly", duration: "8 weeks" },
      { name: "Benzoyl peroxide 2.5%", dosage: "Thin layer", frequency: "Once each morning", duration: "8 weeks" },
    ],
  },
  {
    id: "RX-1098",
    doctor: "Dr. Samira Chowdhury",
    specialty: "Clinical Dermatologist",
    issuedOn: "June 22, 2026",
    diagnosis: "Contact dermatitis",
    medicineCount: 2,
    appointmentId: "APT-1721",
    patientName: "Alex Morgan",
    status: "Finalized",
    advice: "Avoid the suspected irritant and use protective gloves for household cleaning. Return if blistering or spreading occurs.",
    medicines: [
      { name: "Mometasone 0.1% cream", dosage: "Thin layer", frequency: "Once daily", duration: "5 days" },
      { name: "Barrier repair cream", dosage: "Generous layer", frequency: "After handwashing", duration: "2 weeks" },
    ],
  },
];

export const orderPreviews: PatientOrderPreview[] = [
  {
    id: "ORD-3048", placedOn: "October 22, 2026", status: "Out for delivery", paymentStatus: "Paid",
    deliveryAddress: "House 12, Road 5, Banani, Dhaka", estimatedDelivery: "October 24, 2026",
    subtotal: "BDT 1,020", deliveryFee: "BDT 80", total: "BDT 1,100", prescriptionId: "RX-1182",
    items: [
      { name: "Hydrocortisone cream", strength: "1% · 15 g", quantity: 2, unitPrice: "BDT 260", lineTotal: "BDT 520" },
      { name: "Cetirizine", strength: "10 mg · 10 tablets", quantity: 1, unitPrice: "BDT 180", lineTotal: "BDT 180" },
      { name: "Barrier emollient", strength: "100 ml", quantity: 1, unitPrice: "BDT 320", lineTotal: "BDT 320" },
    ],
  },
  {
    id: "ORD-3019", placedOn: "October 8, 2026", status: "Processing", paymentStatus: "Paid",
    deliveryAddress: "House 12, Road 5, Banani, Dhaka", estimatedDelivery: "October 27, 2026",
    subtotal: "BDT 640", deliveryFee: "BDT 80", total: "BDT 720",
    items: [{ name: "Mineral sunscreen", strength: "SPF 50 · 50 ml", quantity: 1, unitPrice: "BDT 640", lineTotal: "BDT 640" }],
  },
  {
    id: "ORD-2941", placedOn: "September 20, 2026", status: "Delivered", paymentStatus: "Paid",
    deliveryAddress: "House 12, Road 5, Banani, Dhaka", estimatedDelivery: "Delivered September 23, 2026",
    subtotal: "BDT 850", deliveryFee: "BDT 80", total: "BDT 930", prescriptionId: "RX-1147",
    items: [
      { name: "Adapalene gel", strength: "0.1% · 15 g", quantity: 1, unitPrice: "BDT 450", lineTotal: "BDT 450" },
      { name: "Gentle cleanser", strength: "150 ml", quantity: 1, unitPrice: "BDT 400", lineTotal: "BDT 400" },
    ],
  },
  {
    id: "ORD-2895", placedOn: "September 5, 2026", status: "Cancelled", paymentStatus: "Refunded",
    deliveryAddress: "House 12, Road 5, Banani, Dhaka", estimatedDelivery: "Order cancelled",
    subtotal: "BDT 380", deliveryFee: "BDT 80", total: "BDT 460",
    items: [{ name: "Calamine lotion", strength: "100 ml", quantity: 1, unitPrice: "BDT 380", lineTotal: "BDT 380" }],
  },
];

export const notificationPreviews: PatientNotificationPreview[] = [
  { id: "NTF-901", type: "Appointment", title: "Appointment confirmed", message: "Your consultation with Dr. Maya Rahman is confirmed for October 28 at 10:30 AM.", timestamp: "12 minutes ago", unread: true, href: "/patient/appointments/APT-2084" },
  { id: "NTF-897", type: "Order", title: "Order is out for delivery", message: "Order ORD-3048 has left the fulfillment center and is on its way.", timestamp: "2 hours ago", unread: true, href: "/patient/orders/ORD-3048" },
  { id: "NTF-889", type: "Prescription", title: "Prescription available", message: "A finalized prescription from Dr. Maya Rahman is ready to review.", timestamp: "Yesterday", unread: false, href: "/patient/prescriptions/RX-1182" },
  { id: "NTF-874", type: "Screening", title: "Screening needs review", message: "Screening scr-1018 includes symptoms that may benefit from clinical review.", timestamp: "October 12, 2026", unread: false, href: "/patient/screening/scr-1018" },
  { id: "NTF-861", type: "Appointment", title: "Booking request received", message: "Your appointment request was sent to Dr. Samira Chowdhury.", timestamp: "October 3, 2026", unread: false, href: "/patient/appointments/APT-2056" },
];

