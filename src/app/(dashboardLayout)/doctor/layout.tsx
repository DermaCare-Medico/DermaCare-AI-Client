import { DoctorApprovalGate } from "@/components/doctor/ApprovalGate";

/**
 * Protected layout for every `/doctor/*` route.
 * Enforces doctor role + license approval before rendering the module.
 */
export default function DoctorModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorApprovalGate>{children}</DoctorApprovalGate>;
}
