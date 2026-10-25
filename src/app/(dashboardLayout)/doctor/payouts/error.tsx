"use client";
import { DoctorPreviewError } from "@/src/app/(dashboardLayout)/doctor/_components/DoctorPreviewStates";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <DoctorPreviewError reset={reset} />; }
