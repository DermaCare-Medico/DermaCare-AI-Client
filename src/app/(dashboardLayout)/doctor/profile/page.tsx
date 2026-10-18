"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  GraduationCap,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  Send,
  ShieldAlert,
  Stethoscope,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { DataState } from "@/components/shared/DataState";
import { DemoNotice } from "@/components/shared/DemoNotice";
import { PageHeader } from "@/components/doctor/PageHeader";
import { VerificationStatusBadge } from "@/components/doctor/StatusBadge";

import { useGetMeQuery, useUpdateUserMutation } from "@/redux/api/authApi";
import { useSubmitDoctorLicenseMutation } from "@/redux/api/doctorApi";
import { useDoctorProfile } from "@/src/hooks/useDoctorModule";
import { useAppSelector } from "@/redux/hooks";
import { useDecodedToken } from "@/src/hooks/useDecodedToken";
import { formatCurrency, formatDate, getApiErrorMessage, qualificationList } from "@/lib/doctor/utils";
import { readIdentity } from "@/lib/doctor/identity";
import type {
  DoctorLicenseSubmission,
  DoctorProfile,
  VerificationStatus,
} from "@/types/doctor";

export default function DoctorProfilePage() {
  const token = useAppSelector((state) => state.auth.token);
  const decoded = useDecodedToken(token);
  const doctorId = typeof decoded?.id === "string" ? decoded.id : undefined;

  const me = useGetMeQuery(undefined, { skip: !token });
  const identity = useMemo(() => readIdentity(me.data), [me.data]);

  const {
    profile,
    isDemo,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErr,
    refetch: refetchProfile,
  } = useDoctorProfile(doctorId);

  const merged: DoctorProfile | undefined = useMemo(() => {
    if (!profile) return undefined;
    return {
      ...profile,
      name: identity.name || profile.name,
      email: identity.email || profile.email,
      licenseNumber: identity.licenseNumber || profile.licenseNumber,
      licenseStatus: identity.status || profile.licenseStatus,
      verificationStatus: identity.status || profile.verificationStatus,
    };
  }, [profile, identity]);

  const qualifications = qualificationList(merged?.qualifications);

  const [submitLicense, submitState] = useSubmitDoctorLicenseMutation();
  const [updateProfile, updateState] = useUpdateUserMutation();
  const [form, setForm] = useState<DoctorLicenseSubmission>({
    licenseNumber: "",
    issuingState: "",
    documentUrl: "",
    expiryDate: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phoneNumber: "",
    bio: "",
    consultationFee: "",
    specialties: "",
  });

  const licenseStatus: VerificationStatus =
    identity.status ?? merged?.licenseStatus ?? "NOT_SUBMITTED";

  const canSubmitLicense = licenseStatus !== "APPROVED";

  function openEdit() {
    setProfileForm({
      name: merged?.name || identity.name || "",
      phoneNumber: merged?.phone || "",
      bio: merged?.bio || "",
      consultationFee:
        merged?.consultationFee !== undefined
          ? String(merged.consultationFee)
          : "",
      specialties: (merged?.specialties ?? []).join(", "),
    });
    setEditOpen(true);
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Please enter your display name.");
      return;
    }

    // Payload follows `PATCH /users/me/profile` role-specific doctor schema.
    const specialties = profileForm.specialties
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateProfile({
        name: profileForm.name.trim(),
        phoneNumber: profileForm.phoneNumber.trim() || undefined,
        doctorProfile: {
          bio: profileForm.bio.trim() || undefined,
          consultationFee: profileForm.consultationFee
            ? Number(profileForm.consultationFee)
            : undefined,
          specialties,
        },
      }).unwrap();
      // Real success only — the request above must resolve without error.
      toast.success("Profile updated.");
      setEditOpen(false);
      void refetchProfile();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not update your profile."));
    }
  }

  async function handleSubmitLicense(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.licenseNumber.trim() ||
      !form.issuingState.trim() ||
      !form.documentUrl.trim() ||
      !form.expiryDate
    ) {
      toast.error("Please complete every license field before submitting.");
      return;
    }

    try {
      await submitLicense({
        licenseNumber: form.licenseNumber.trim(),
        issuingState: form.issuingState.trim(),
        documentUrl: form.documentUrl.trim(),
        expiryDate: form.expiryDate,
      }).unwrap();
      // Real success only — the request above must resolve without error.
      toast.success("License submitted for review.");
      setForm({ licenseNumber: "", issuingState: "", documentUrl: "", expiryDate: "" });
      void refetchProfile();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not submit the license document.")
      );
    }
  }

  return (
    <section>
      <PageHeader
        eyebrow="Doctor profile"
        title="Profile & license"
        description="Your public professional details and medical license verification status."
        actions={
          <div className="flex items-center gap-2">
            <VerificationStatusBadge status={licenseStatus} />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openEdit}
            >
              <Pencil size={14} /> Edit profile
            </Button>
          </div>
        }
      />

      {isDemo && <DemoNotice className="mb-6" />}

      <DataState
        isLoading={me.isLoading || (Boolean(doctorId) && profileLoading)}
        isError={profileError}
        error={profileErr}
        onRetry={refetchProfile}
        skeleton={
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            {/* Identity */}
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <span className="grid size-12 place-items-center rounded-xl bg-[#E8F5F4] text-[#0F888D]">
                  <Stethoscope size={22} />
                </span>
                <div className="min-w-0">
                  <CardTitle className="text-lg text-[#163A5F]">
                    {merged?.name || identity.name || "Doctor"}
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    {merged?.specialization ||
                      merged?.specialties?.[0] ||
                      "Specialization not set"}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <InfoRow
                  icon={<Mail size={15} />}
                  label="Email"
                  value={merged?.email || identity.email || "—"}
                />
                <InfoRow
                  icon={<Phone size={15} />}
                  label="Phone"
                  value={merged?.phone || "—"}
                />
                <InfoRow
                  icon={<BadgeCheck size={15} />}
                  label="License number"
                  value={merged?.licenseNumber || identity.licenseNumber || "—"}
                />
                <InfoRow
                  icon={<Wallet size={15} />}
                  label="Consultation fee"
                  value={
                    merged?.consultationFee !== undefined
                      ? formatCurrency(merged.consultationFee)
                      : "—"
                  }
                />
                <InfoRow
                  icon={<GraduationCap size={15} />}
                  label="Experience"
                  value={
                    (merged?.yearsExperience ?? merged?.experienceYears) !==
                    undefined
                      ? `${merged?.yearsExperience ?? merged?.experienceYears} years`
                      : "—"
                  }
                />
                <InfoRow
                  icon={<BadgeCheck size={15} />}
                  label="Verification"
                  value={licenseStatus.replace(/_/g, " ")}
                />
              </CardContent>
            </Card>

            {/* Qualifications */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                  <GraduationCap size={18} className="text-[#0F888D]" />
                  Qualifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {qualifications.length > 0 ? (
                  <ul className="space-y-2">
                    {qualifications.map((q, i) => (
                      <li
                        key={i}
                        className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-700"
                      >
                        {q}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    No qualifications on record yet.
                  </p>
                )}
                {merged?.specialties && merged.specialties.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Specialties
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {merged.specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-[#E8F5F4] px-3 py-1 text-xs font-medium text-[#0F777E]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {merged?.bio && (
                  <>
                    <Separator className="my-4" />
                    <p className="text-sm leading-6 text-slate-600">{merged.bio}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column: editable details + license */}
          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                  <Pencil size={18} className="text-[#0F888D]" />
                  Edit professional details
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={editOpen ? () => setEditOpen(false) : openEdit}
                >
                  {editOpen ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent>
                {!editOpen ? (
                  <p className="text-sm leading-6 text-slate-500">
                    Update your display name, contact number, consultation fee,
                    specialties and bio. Saved through the backend profile
                    endpoint.
                  </p>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="profile-name">Display name</Label>
                      <Input
                        id="profile-name"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((f) => ({ ...f, name: e.target.value }))
                        }
                        placeholder="Dr. Jane Doe"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="profile-phone">Phone number</Label>
                      <Input
                        id="profile-phone"
                        value={profileForm.phoneNumber}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            phoneNumber: e.target.value,
                          }))
                        }
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="profile-fee">Consultation fee (USD)</Label>
                      <Input
                        id="profile-fee"
                        type="number"
                        min={0}
                        value={profileForm.consultationFee}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            consultationFee: e.target.value,
                          }))
                        }
                        placeholder="75"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="profile-specialties">
                        Specialties (comma separated)
                      </Label>
                      <Input
                        id="profile-specialties"
                        value={profileForm.specialties}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            specialties: e.target.value,
                          }))
                        }
                        placeholder="Acne & Scarring, Skin Cancer Screening"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="profile-bio">Professional bio</Label>
                      <Textarea
                        id="profile-bio"
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm((f) => ({ ...f, bio: e.target.value }))
                        }
                        placeholder="Short professional summary shown to patients."
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={updateState.isLoading}
                      className="w-full bg-[#0F888D] hover:bg-[#0C7479]"
                    >
                      {updateState.isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      Save changes
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* License */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-[#163A5F]">
                  <ShieldAlert size={18} className="text-[#0F888D]" />
                  Medical license
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Current status</span>
                  <VerificationStatusBadge status={licenseStatus} />
                </div>
                {identity.licenseSubmittedAt && (
                  <p className="text-xs text-slate-400">
                    Submitted {formatDate(identity.licenseSubmittedAt)}
                  </p>
                )}
                <p className="text-xs leading-5 text-slate-500">
                  {licenseStatus === "PENDING_REVIEW"
                    ? "Your license is under review by the medical board. You will be notified by email once verified."
                    : licenseStatus === "APPROVED"
                      ? "Your license is verified. Your profile is live to patients."
                      : licenseStatus === "REJECTED"
                        ? "Your previous submission was rejected. Please re-submit a valid document."
                        : "Submit your medical license to unlock the full doctor dashboard."}
                </p>

                {canSubmitLicense && (
                  <form
                    onSubmit={handleSubmitLicense}
                    className="space-y-3 border-t border-slate-100 pt-4"
                  >
                    <div className="space-y-1">
                      <Label htmlFor="licenseNumber">License number</Label>
                      <Input
                        id="licenseNumber"
                        value={form.licenseNumber}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, licenseNumber: e.target.value }))
                        }
                        placeholder="e.g. DERM-2018-4521"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="issuingState">Issuing state / board</Label>
                      <Input
                        id="issuingState"
                        value={form.issuingState}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, issuingState: e.target.value }))
                        }
                        placeholder="e.g. California Medical Board"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="documentUrl">Document URL</Label>
                      <Input
                        id="documentUrl"
                        value={form.documentUrl}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, documentUrl: e.target.value }))
                        }
                        placeholder="https://… secure license document"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="expiryDate">Expiry date</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={form.expiryDate}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, expiryDate: e.target.value }))
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={submitState.isLoading}
                      className="w-full bg-[#0F888D] hover:bg-[#0C7479]"
                    >
                      {submitState.isLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                      Submit for review
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DataState>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm text-slate-700">{value}</p>
      </div>
    </div>
  );
}
