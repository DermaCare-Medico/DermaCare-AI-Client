import { PageState, patientUiStyles as s } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";

export default function NotificationsLoading() {
  return <div className={s.page}><PageState state="loading" title="Loading notifications" message="Collecting your latest patient updates." /></div>;
}
