export type DoctorOnboardingData = {
  email: string;
  password: string;
  licenseNumber: string;
  qualifications: string;
  experienceYears: string;
  consultationFee: string;
  specializationIds: string[];
  bio: string;
  documents: File[];
  documentReferences: string[];
};

let pendingDoctorOnboarding: DoctorOnboardingData | null = null;
const STORAGE_KEY = "dermacare.doctor-onboarding";

type StoredDoctorOnboarding = Omit<DoctorOnboardingData, "password" | "documents">;

export function setDoctorOnboarding(data: DoctorOnboardingData) {
  pendingDoctorOnboarding = data;
  if (typeof window !== "undefined") {
    const safeDraft: StoredDoctorOnboarding = {
      email: data.email,
      licenseNumber: data.licenseNumber,
      qualifications: data.qualifications,
      experienceYears: data.experienceYears,
      consultationFee: data.consultationFee,
      specializationIds: data.specializationIds,
      bio: data.bio,
      documentReferences: data.documentReferences,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeDraft));
  }
}

export function getDoctorOnboarding() {
  if (pendingDoctorOnboarding) return pendingDoctorOnboarding;
  if (typeof window === "undefined") return null;

  const stored = window.sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const draft = JSON.parse(stored) as Omit<StoredDoctorOnboarding, "specializationIds"> & {
      specializationIds: string | string[];
      documentReferences?: string[];
    };
    return {
      ...draft,
      specializationIds: Array.isArray(draft.specializationIds)
        ? draft.specializationIds
        : draft.specializationIds.split(/[\n,]/).map((value) => value.trim()).filter(Boolean),
      password: "",
      documents: [],
      documentReferences: Array.isArray(draft.documentReferences) ? draft.documentReferences : [],
    };
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function hasDoctorOnboardingIntent() {
  return Boolean(getDoctorOnboarding());
}

export function clearDoctorOnboarding() {
  pendingDoctorOnboarding = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
}
