export type ScreeningStatus = "Completed" | "Needs Review" | "Incomplete";
export type AppointmentStatus = "Confirmed" | "Pending" | "Needs Review";

export interface ScreeningRecord {
  id: string;
  date: string;
  title: string;
  status: ScreeningStatus;
  excerpt: string;
  thumbnailLabel: string;
}

export interface AppointmentRecord {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  location: string;
}

export interface PatientProfileData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  allergies: string;
  conditions: string;
  medications: string;
  skinType: string;
  skinConcerns: string;
  profileImage: string;
}

export const summaryCards = [
  { label: "Total screenings", value: "12", detail: "+3 this quarter" },
  { label: "Upcoming appointments", value: "2", detail: "Next review: Jun 20" },
  { label: "Saved prescriptions", value: "4", detail: "2 active" },
  { label: "Recent activity", value: "7", detail: "Updated since last visit" },
];

export const mockScreenings: ScreeningRecord[] = [
  {
    id: "scr-1024",
    date: "May 28, 2026",
    title: "Forearm irritation review",
    status: "Completed",
    excerpt: "Mild irritation reported with dryness and slight tenderness. Follow-up recommended only if it changes.",
    thumbnailLabel: "Skin check",
  },
  {
    id: "scr-1018",
    date: "May 12, 2026",
    title: "Face and chin screening",
    status: "Needs Review",
    excerpt: "Persistent redness and occasional itch across the chin area. A clinician review is recommended.",
    thumbnailLabel: "Face view",
  },
  {
    id: "scr-1004",
    date: "Apr 29, 2026",
    title: "Back rash check-in",
    status: "Incomplete",
    excerpt: "Image uploaded but symptom history was incomplete. This record is still pending a more detailed review.",
    thumbnailLabel: "Back photo",
  },
];

export const upcomingAppointment: AppointmentRecord = {
  doctor: "Dr. Maya Thompson",
  specialty: "Dermatology",
  date: "June 20, 2026",
  time: "10:30 AM",
  status: "Confirmed",
  location: "Virtual consultation",
};

export const educationalResources = [
  {
    title: "Keep skin care simple and consistent",
    description:
      "A gentle cleanser, sunscreen, and fragrance-free moisturiser can help reduce irritation and protect the skin barrier.",
  },
  {
    title: "Track new changes over time",
    description:
      "Photos and notes about size, color, itch, or spreading can help a clinician assess changes more accurately.",
  },
  {
    title: "Seek prompt care for urgent warnings",
    description:
      "Rapid swelling, shortness of breath, or rapidly spreading redness with fever should be evaluated urgently.",
  },
];

export const initialPatientProfile: PatientProfileData = {
  fullName: "Alex Walker",
  email: "alex.walker@example.com",
  phone: "+1 (415) 860-4158",
  dateOfBirth: "1990-04-18",
  gender: "Female",
  city: "San Francisco, CA",
  allergies: "Penicillin",
  conditions: "Mild eczema, seasonal rosacea",
  medications: "Cetirizine, moisturizer (fragrance-free)",
  skinType: "Combination",
  skinConcerns: "Dry patches around cheeks, occasional irritation on neck",
  profileImage: "",
};
