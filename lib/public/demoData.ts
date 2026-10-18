/**
 * Public Pages DEMO DATA.
 *
 * ⚠️ Intentionally isolated from the real API services. The DermaCare AI
 * backend has the doctor-discovery and store modules scaffolded but **not
 * implemented**, so live calls return errors.
 *
 * Demo data is ONLY surfaced when `NEXT_PUBLIC_PUBLIC_DEMO === "true"` AND the
 * real request has failed. Every view that falls back to this data renders a
 * visible "Demo data" notice.
 */
import type { DoctorListItem, DoctorProfile, DoctorSlot, Medicine } from "@/types/doctor";

export const PUBLIC_DEMO_ENABLED =
  process.env.NEXT_PUBLIC_PUBLIC_DEMO === "true";

function isoAt(dayOffset: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const demoDoctors: DoctorListItem[] = [
  {
    id: "doc_demo_001",
    name: "Dr. Elena Rodriguez",
    avatarUrl:
      "https://images.unsplash.com/photo-1594824813566-888553a19b88?auto=format&fit=crop&w=600&q=80",
    specialties: ["Acne & Scarring", "Inflammatory Skin Disease", "Skin Cancer Screening"],
    consultationFee: 75,
    currency: "USD",
    rating: 4.8,
    totalReviews: 132,
    isFeatured: true,
    nextAvailableSlot: isoAt(1, 9),
  },
  {
    id: "doc_demo_002",
    name: "Dr. Marcus Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
    specialties: ["Eczema & Psoriasis", "Paediatric Dermatology"],
    consultationFee: 90,
    currency: "USD",
    rating: 4.7,
    totalReviews: 88,
    isFeatured: false,
    nextAvailableSlot: isoAt(0, 15, 30),
  },
  {
    id: "doc_demo_003",
    name: "Dr. Aisha Rahman",
    avatarUrl:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    specialties: ["Pigmentation & Melasma", "Laser Therapy"],
    consultationFee: 65,
    currency: "USD",
    rating: 4.9,
    totalReviews: 204,
    isFeatured: true,
    matchedCondition: "Rosacea",
    nextAvailableSlot: isoAt(2, 11),
  },
];

export const demoDoctorProfiles: Record<string, DoctorProfile> = {
  doc_demo_001: {
    id: "doc_demo_001",
    name: "Dr. Elena Rodriguez",
    specialties: ["Acne & Scarring", "Inflammatory Skin Disease", "Skin Cancer Screening"],
    qualifications:
      "MD, Dermatology — Johns Hopkins University (2015); Board Certified, American Academy of Dermatology",
    bio: "Dermatologist focused on teledermatology, inflammatory skin disease, and skin cancer screening.",
    consultationFee: 75,
    currency: "USD",
    rating: 4.8,
    reviewCount: 132,
    yearsExperience: 8,
    verificationStatus: "APPROVED",
  },
  doc_demo_002: {
    id: "doc_demo_002",
    name: "Dr. Marcus Chen",
    specialties: ["Eczema & Psoriasis", "Paediatric Dermatology"],
    qualifications: "MBBS, MRCP (Dermatology) — University of Melbourne (2016)",
    bio: "Specialises in chronic inflammatory skin disease and paediatric dermatology.",
    consultationFee: 90,
    currency: "USD",
    rating: 4.7,
    reviewCount: 88,
    yearsExperience: 7,
    verificationStatus: "APPROVED",
  },
  doc_demo_003: {
    id: "doc_demo_003",
    name: "Dr. Aisha Rahman",
    specialties: ["Pigmentation & Melasma", "Laser Therapy"],
    qualifications: "MD, Dermatology — AIIMS (2013); Fellowship in Lasers & Aesthetics",
    bio: "Focused on pigmentation disorders, melasma and laser-assisted dermatology.",
    consultationFee: 65,
    currency: "USD",
    rating: 4.9,
    reviewCount: 204,
    yearsExperience: 11,
    verificationStatus: "APPROVED",
  },
};

export const demoPublicSlots: DoctorSlot[] = [
  { id: "slot_demo_1", startTime: isoAt(1, 9), endTime: isoAt(1, 9, 30), durationMinutes: 30, fee: 75, status: "AVAILABLE" },
  { id: "slot_demo_2", startTime: isoAt(1, 10), endTime: isoAt(1, 10, 30), durationMinutes: 30, fee: 75, status: "AVAILABLE" },
  { id: "slot_demo_3", startTime: isoAt(2, 13), endTime: isoAt(2, 13, 30), durationMinutes: 30, fee: 80, status: "BOOKED" },
];

export const demoMedicines: Medicine[] = [
  {
    id: "med_demo_001",
    name: "Hydrocortisone 1% Cream",
    genericName: "Hydrocortisone",
    strength: "1%",
    dosageForm: "Topical cream",
    packSize: "30 g tube",
    category: "Corticosteroids",
    price: 6.5,
    currency: "USD",
    requiresPrescription: true,
    inStock: true,
    stockQuantity: 40,
    storageInstructions: "Store below 25°C. Do not freeze.",
    manufacturer: "DermaCare Labs (fictional)",
  },
  {
    id: "med_demo_002",
    name: "Cetirizine 10mg Tablets",
    genericName: "Cetirizine hydrochloride",
    strength: "10 mg",
    dosageForm: "Oral tablet",
    packSize: "10 tablets",
    category: "Antihistamines",
    price: 3.2,
    currency: "USD",
    requiresPrescription: false,
    inStock: true,
    stockQuantity: 120,
    storageInstructions: "Store in a dry place below 30°C.",
    manufacturer: "DermaCare Labs (fictional)",
  },
  {
    id: "med_demo_003",
    name: "Clindamycin 1% Gel",
    genericName: "Clindamycin phosphate",
    strength: "1%",
    dosageForm: "Topical gel",
    packSize: "20 g tube",
    category: "Antibiotics",
    price: 9.9,
    currency: "USD",
    requiresPrescription: true,
    inStock: false,
    stockQuantity: 0,
    storageInstructions: "Store below 25°C.",
    manufacturer: "DermaCare Labs (fictional)",
  },
  {
    id: "med_demo_004",
    name: "Ceramide Barrier Moisturiser",
    genericName: "Ceramide blend",
    strength: "—",
    dosageForm: "Topical lotion",
    packSize: "200 ml bottle",
    category: "Emollients",
    price: 12.0,
    currency: "USD",
    requiresPrescription: false,
    inStock: true,
    stockQuantity: 60,
    storageInstructions: "Store at room temperature.",
    manufacturer: "DermaCare Labs (fictional)",
  },
];

export const demoStoreCategories = [
  "Corticosteroids",
  "Antihistamines",
  "Antibiotics",
  "Emollients",
];
