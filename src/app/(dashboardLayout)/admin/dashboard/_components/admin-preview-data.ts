export const ADMIN_PREVIEW_NOTICE =
  "Preview data only. Changes on this page are not saved or sent to the backend.";

export type VerificationStatus = "APPROVED" | "PENDING_REVIEW" | "REJECTED";
export type AppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "CONFIRMED"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";
export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentStatus = "PAID" | "PENDING" | "REFUNDED";

export interface AdminDoctorPreview {
  id: string;
  name: string;
  email: string;
  specialization: string;
  verificationStatus: VerificationStatus;
  fee: number;
  experienceYears: number;
  licenseNumber: string;
  qualifications: string[];
  submittedAt: string;
}

export interface AdminAppointmentPreview {
  id: string;
  doctor: string;
  patient: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  fee: number;
  concern: string;
  cancellation?: { requestedBy: string; reason: string };
}

export interface AdminOrderPreview {
  id: string;
  patient: string;
  placedAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  address: string;
  items: { name: string; quantity: number; price: number }[];
  timeline: { label: string; at?: string; complete: boolean }[];
}

export interface AdminMedicinePreview {
  id: string;
  name: string;
  genericName: string;
  strength: string;
  category: string;
  manufacturer: string;
  price: number;
  stock: number;
  prescriptionRequired: boolean;
  active: boolean;
}

export type PayoutStatus = "PENDING" | "PROCESSING" | "SETTLED" | "ON_HOLD";
export type AuditResult = "SUCCESS" | "DENIED" | "FAILED";

export interface AdminDoctorPaymentPreview {
  id: string;
  doctor: string;
  month: string;
  appointmentCount: number;
  gross: number;
  commission: number;
  net: number;
  status: PayoutStatus;
  preparedAt: string;
  settledAt?: string;
}

export interface AdminAuditLogPreview {
  id: string;
  user: string;
  role: "ADMIN" | "DOCTOR" | "PATIENT" | "SYSTEM";
  action: string;
  resource: string;
  timestamp: string;
  result: AuditResult;
  summary: string;
  reference: string;
}

export const adminDoctors: AdminDoctorPreview[] = [
  { id: "doc-101", name: "Dr. Maya Rahman", email: "maya@example.com", specialization: "Dermatology", verificationStatus: "APPROVED", fee: 1500, experienceYears: 11, licenseNumber: "BMDC-A-38492", qualifications: ["MBBS", "FCPS (Dermatology)"], submittedAt: "18 Oct 2026" },
  { id: "doc-102", name: "Dr. Arif Hossain", email: "arif@example.com", specialization: "Pediatric Dermatology", verificationStatus: "PENDING_REVIEW", fee: 1200, experienceYears: 7, licenseNumber: "BMDC-A-41873", qualifications: ["MBBS", "DDV"], submittedAt: "22 Oct 2026" },
  { id: "doc-103", name: "Dr. Nabila Karim", email: "nabila@example.com", specialization: "Cosmetic Dermatology", verificationStatus: "REJECTED", fee: 1800, experienceYears: 9, licenseNumber: "BMDC-A-36710", qualifications: ["MBBS", "MD (Dermatology)"], submittedAt: "11 Oct 2026" },
];

export const adminAppointments: AdminAppointmentPreview[] = [
  { id: "APT-2401", doctor: "Dr. Maya Rahman", patient: "Sadia Islam", date: "26 Oct 2026", time: "10:30 AM", status: "CONFIRMED", paymentStatus: "PAID", fee: 1500, concern: "Persistent facial rash" },
  { id: "APT-2402", doctor: "Dr. Arif Hossain", patient: "Nafis Ahmed", date: "27 Oct 2026", time: "02:00 PM", status: "PENDING", paymentStatus: "PENDING", fee: 1200, concern: "Scalp irritation" },
  { id: "APT-2396", doctor: "Dr. Maya Rahman", patient: "Rumana Kabir", date: "23 Oct 2026", time: "04:15 PM", status: "APPROVED", paymentStatus: "PAID", fee: 1500, concern: "Acne follow-up", cancellation: { requestedBy: "Patient", reason: "Unable to attend due to a schedule conflict." } },
  { id: "APT-2381", doctor: "Dr. Nabila Karim", patient: "Hasan Ali", date: "20 Oct 2026", time: "11:00 AM", status: "COMPLETED", paymentStatus: "PAID", fee: 1800, concern: "Pigmentation consultation" },
];

export const adminOrders: AdminOrderPreview[] = [
  { id: "ORD-6108", patient: "Sadia Islam", placedAt: "23 Oct 2026, 09:42 AM", status: "OUT_FOR_DELIVERY", paymentStatus: "PAID", address: "Dhanmondi, Dhaka", items: [{ name: "Hydrocortisone 1% Cream", quantity: 1, price: 280 }, { name: "Gentle Skin Cleanser", quantity: 2, price: 450 }], timeline: [{ label: "Order confirmed", at: "23 Oct, 10:05 AM", complete: true }, { label: "Processing", at: "23 Oct, 02:20 PM", complete: true }, { label: "Packed", at: "24 Oct, 09:15 AM", complete: true }, { label: "Out for delivery", at: "24 Oct, 11:30 AM", complete: true }, { label: "Delivered", complete: false }] },
  { id: "ORD-6103", patient: "Nafis Ahmed", placedAt: "22 Oct 2026, 04:10 PM", status: "PROCESSING", paymentStatus: "PAID", address: "Uttara, Dhaka", items: [{ name: "Ketoconazole Shampoo", quantity: 1, price: 620 }], timeline: [{ label: "Order confirmed", at: "22 Oct, 04:22 PM", complete: true }, { label: "Processing", at: "23 Oct, 09:00 AM", complete: true }, { label: "Packed", complete: false }, { label: "Out for delivery", complete: false }, { label: "Delivered", complete: false }] },
  { id: "ORD-6094", patient: "Rumana Kabir", placedAt: "19 Oct 2026, 01:25 PM", status: "DELIVERED", paymentStatus: "PAID", address: "Banani, Dhaka", items: [{ name: "Adapalene Gel", quantity: 1, price: 390 }], timeline: [{ label: "Order confirmed", complete: true }, { label: "Processing", complete: true }, { label: "Packed", complete: true }, { label: "Out for delivery", complete: true }, { label: "Delivered", at: "21 Oct, 03:40 PM", complete: true }] },
];

export const adminMedicines: AdminMedicinePreview[] = [
  { id: "MED-101", name: "Hydrocortisone Cream", genericName: "Hydrocortisone", strength: "1%", category: "Topical steroid", manufacturer: "Derma Labs", price: 280, stock: 38, prescriptionRequired: true, active: true },
  { id: "MED-102", name: "Gentle Skin Cleanser", genericName: "Soap-free cleanser", strength: "200 ml", category: "Skin care", manufacturer: "CareDerm", price: 450, stock: 8, prescriptionRequired: false, active: true },
  { id: "MED-103", name: "Adapalene Gel", genericName: "Adapalene", strength: "0.1%", category: "Acne care", manufacturer: "Nova Pharma", price: 390, stock: 0, prescriptionRequired: true, active: true },
  { id: "MED-104", name: "Calamine Lotion", genericName: "Calamine", strength: "100 ml", category: "Itch relief", manufacturer: "HealthFirst", price: 210, stock: 24, prescriptionRequired: false, active: false },
];

export const adminDoctorPayments: AdminDoctorPaymentPreview[] = [
  { id: "PAY-2609-01", doctor: "Dr. Maya Rahman", month: "October 2026", appointmentCount: 18, gross: 27000, commission: 4050, net: 22950, status: "PENDING", preparedAt: "24 Oct 2026" },
  { id: "PAY-2609-02", doctor: "Dr. Arif Hossain", month: "October 2026", appointmentCount: 12, gross: 14400, commission: 2160, net: 12240, status: "PROCESSING", preparedAt: "24 Oct 2026" },
  { id: "PAY-2608-01", doctor: "Dr. Maya Rahman", month: "September 2026", appointmentCount: 21, gross: 31500, commission: 4725, net: 26775, status: "SETTLED", preparedAt: "30 Sep 2026", settledAt: "03 Oct 2026" },
  { id: "PAY-2608-03", doctor: "Dr. Nabila Karim", month: "September 2026", appointmentCount: 9, gross: 16200, commission: 2430, net: 13770, status: "ON_HOLD", preparedAt: "30 Sep 2026" },
];

export const adminAuditLogs: AdminAuditLogPreview[] = [
  { id: "LOG-8041", user: "Admin User", role: "ADMIN", action: "REVIEWED_APPLICATION", resource: "Doctor application", timestamp: "24 Oct 2026, 10:42 AM", result: "SUCCESS", summary: "Reviewed a pending professional application. No preview document contents are retained here.", reference: "Application APP-204" },
  { id: "LOG-8040", user: "Dr. Maya Rahman", role: "DOCTOR", action: "COMPLETED_APPOINTMENT", resource: "Appointment", timestamp: "24 Oct 2026, 10:15 AM", result: "SUCCESS", summary: "Marked a scheduled consultation as completed.", reference: "Appointment APT-2381" },
  { id: "LOG-8039", user: "System", role: "SYSTEM", action: "PAYMENT_RECONCILIATION", resource: "Doctor payment", timestamp: "24 Oct 2026, 09:30 AM", result: "FAILED", summary: "Preview reconciliation could not match a settlement record. No financial credentials are displayed.", reference: "Payment PAY-2609-02" },
  { id: "LOG-8038", user: "Patient User", role: "PATIENT", action: "PROFILE_ACCESS", resource: "Patient profile", timestamp: "23 Oct 2026, 05:08 PM", result: "DENIED", summary: "A role-protected profile request was denied.", reference: "Access event EVT-773" },
];
