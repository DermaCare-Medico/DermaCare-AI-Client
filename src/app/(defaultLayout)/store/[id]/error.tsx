"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[70vh] place-items-center bg-[#F7F9FC] px-6"><div className="max-w-lg rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm"><AlertCircle className="mx-auto size-9 text-rose-600"/><h1 className="mt-4 text-xl font-bold text-[#0F2942]">Medicine details could not be displayed</h1><p className="mt-2 text-sm text-slate-600">Try loading this preview again or return to the store.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={reset} className="rounded-xl bg-[#0F888D] px-4 py-2.5 text-sm font-semibold text-white">Try again</button><Link href="/store" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#163A5F]">Back to store</Link></div></div></main>;
}
