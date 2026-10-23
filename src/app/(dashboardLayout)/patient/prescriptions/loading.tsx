import { PageState, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";

export default function PrescriptionsLoading() {
  return <div className={s.page}><PageState state="loading" title="Loading prescriptions" message="Preparing your clinical records." /></div>;
}

