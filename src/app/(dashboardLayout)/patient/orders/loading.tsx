import { PageState, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";

export default function OrdersLoading() {
  return <div className={s.page}><PageState state="loading" title="Loading orders" message="Preparing payment and delivery information." /></div>;
}

