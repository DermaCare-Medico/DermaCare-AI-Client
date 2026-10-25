"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DoctorPreviewLoading({ title = "Loading preview" }: { title?: string }) {
  return <section className="mx-auto max-w-7xl" aria-busy="true"><Skeleton className="mb-2 h-3 w-28" /><Skeleton className="mb-6 h-8 w-64" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5"><Skeleton className="mb-4 h-5 w-1/2" /><Skeleton className="mb-2 h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>)}</div><p className="sr-only">{title}</p></section>;
}

export function DoctorPreviewError({ reset, message = "This doctor preview could not be displayed. No data was submitted or changed." }: { reset: () => void; message?: string }) {
  return <section role="alert" className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"><AlertTriangle className="mx-auto mb-3 text-rose-500" size={26} /><h1 className="text-lg font-bold text-rose-900">Could not load this page</h1><p className="mt-2 text-sm leading-6 text-rose-700">{message}</p><Button variant="outline" className="mt-5" onClick={reset}>Try again</Button></section>;
}

