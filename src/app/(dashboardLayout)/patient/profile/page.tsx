"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, PencilLine, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetPatientProfileQuery, useUpdatePatientProfileMutation, type UpdatePatientProfile } from "@/redux/api/patientApi";
import { useAppSelector } from "@/redux/hooks";
import { PageState } from "@/src/app/(dashboardLayout)/patient/_components/PatientUi";
import styles from "./page.module.css";

const empty: UpdatePatientProfile = { dateOfBirth: "", gender: "", address: "", allergies: [], existingConditions: [] };
const profileValues = (profile?: { dateOfBirth?: string; gender?: string; address?: string; allergies?: string[]; existingConditions?: string[] }): UpdatePatientProfile => ({ dateOfBirth: profile?.dateOfBirth ?? "", gender: profile?.gender ?? "", address: profile?.address ?? "", allergies: profile?.allergies ?? [], existingConditions: profile?.existingConditions ?? [] });
const list = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
const message = (error: unknown) => typeof error === "object" && error && "data" in error && typeof error.data === "object" && error.data && "message" in error.data && typeof error.data.message === "string" ? error.data.message : "We could not update your profile.";

export default function PatientProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const query = useGetPatientProfileQuery();
  const [updateProfile, updateState] = useUpdatePatientProfileMutation();
  const [form, setForm] = useState(empty);
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const displayed = isEditing ? form : profileValues(query.data?.data);
  const initials = useMemo(() => (user?.name ?? "Patient").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), [user?.name]);
  const update = (field: keyof UpdatePatientProfile, value: string | string[]) => { setForm((current) => ({ ...current, [field]: value })); setNotice(""); };
  const save = async () => { if (!form.dateOfBirth) { setNotice("Date of birth is required."); return; } try { await updateProfile(form).unwrap(); setIsEditing(false); setNotice("Your patient profile has been updated."); } catch (error) { setNotice(message(error)); } };

  if (query.isLoading) return <PageState state="loading" />;
  if (query.isError) return <PageState state="error" onRetry={query.refetch} />;
  return <div className={styles.page}>
    <header className={styles.headerRow}><div><p className={styles.eyebrow}>Patient profile</p><h1>Profile overview</h1></div>{!isEditing && <Button className={styles.primaryButton} onClick={() => { setForm(profileValues(query.data?.data)); setIsEditing(true); }}><PencilLine size={16} />Edit profile</Button>}</header>
    <section className={styles.heroCard}><div className={styles.avatarWrap}><div className={styles.avatar}>{initials}</div></div><div className={styles.identityBlock}><h2>{user?.name ?? "Patient"}</h2><p>{user?.email ?? ""}</p><div className={styles.metaChips}><span>{displayed.address || "Address not provided"}</span><span>{displayed.gender || "Gender not provided"}</span></div></div></section>
    <form className={styles.formGrid} onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.sectionLabel}>Personal information</p><h3>Patient details</h3></div><UserRound size={18} className={styles.sectionIcon} /></div><div className={styles.fieldGrid}>
        <label className={styles.field}><span>Date of birth</span><input type="date" value={displayed.dateOfBirth ?? ""} onChange={(e) => update("dateOfBirth", e.target.value)} disabled={!isEditing} required /></label>
        <label className={styles.field}><span>Gender</span><select value={displayed.gender ?? ""} onChange={(e) => update("gender", e.target.value)} disabled={!isEditing}><option value="">Select</option><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="OTHER">Other</option><option value="PREFER_NOT_TO_SAY">Prefer not to say</option></select></label>
        <label className={styles.fieldFull}><span>Address</span><input value={displayed.address ?? ""} onChange={(e) => update("address", e.target.value)} disabled={!isEditing} /></label>
      </div></section>
      <section className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.sectionLabel}>Medical context</p><h3>Health details</h3></div><ShieldCheck size={18} className={styles.sectionIcon} /></div><div className={styles.fieldGrid}>
        <label className={styles.fieldFull}><span>Known allergies (comma-separated)</span><input value={(displayed.allergies ?? []).join(", ")} onChange={(e) => update("allergies", list(e.target.value))} disabled={!isEditing} /></label>
        <label className={styles.fieldFull}><span>Existing conditions (comma-separated)</span><input value={(displayed.existingConditions ?? []).join(", ")} onChange={(e) => update("existingConditions", list(e.target.value))} disabled={!isEditing} /></label>
      </div></section>
      {notice && <div className={styles.successBanner} role="status"><CheckCircle2 size={16} /><span>{notice}</span></div>}
      {isEditing && <div className={styles.actionBar}><Button className={styles.primaryButton} disabled={updateState.isLoading} type="submit">{updateState.isLoading ? "Saving..." : "Save Changes"}</Button><Button variant="outline" className={styles.secondaryButton} onClick={() => { setIsEditing(false); void query.refetch(); setNotice(""); }} type="button">Cancel</Button></div>}
    </form>
  </div>;
}
