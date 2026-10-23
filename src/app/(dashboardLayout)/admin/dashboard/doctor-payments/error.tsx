"use client";

import { AdminErrorState } from "../_components/AdminPreviewUI";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <AdminErrorState reset={reset} />;
}
