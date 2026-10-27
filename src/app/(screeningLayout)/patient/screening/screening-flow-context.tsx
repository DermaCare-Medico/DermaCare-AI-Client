"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ScreeningFormData = {
  mainSymptom: string;
  bodyArea: string;
  duration: string;
  itching: string;
  pain: string;
  redness: string;
  worsening: string;
  feverOrOtherSymptoms: string;
  knownAllergies: string;
  medicalContext: string;
  notes: string;
};

export type PendingScreening = {
  formData: ScreeningFormData;
  image: File;
};

type ScreeningFlowValue = {
  pendingScreening: PendingScreening | null;
  setPendingScreening: (screening: PendingScreening | null) => void;
};

const ScreeningFlowContext = createContext<ScreeningFlowValue | null>(null);

export function ScreeningFlowProvider({ children }: { children: ReactNode }) {
  const [pendingScreening, setPendingScreening] = useState<PendingScreening | null>(null);
  const value = useMemo(
    () => ({ pendingScreening, setPendingScreening }),
    [pendingScreening],
  );

  return <ScreeningFlowContext.Provider value={value}>{children}</ScreeningFlowContext.Provider>;
}

export function useScreeningFlow() {
  const context = useContext(ScreeningFlowContext);
  if (!context) throw new Error("useScreeningFlow must be used within ScreeningFlowProvider");
  return context;
}
