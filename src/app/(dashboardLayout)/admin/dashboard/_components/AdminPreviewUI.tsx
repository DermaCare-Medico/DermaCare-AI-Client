import { AlertCircle, FlaskConical, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0F888D]">{eyebrow}</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-[#163A5F] sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p></div>{action}</header>;
}

export function PreviewNotice({ children }: { children: ReactNode }) {
  return <div className="flex gap-3 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900"><FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden="true"/><p>{children}</p></div>;
}

export function StatusBadge({ value }: { value: string }) {
  const good = ["APPROVED", "CONFIRMED", "COMPLETED", "DELIVERED", "PAID", "ACTIVE", "SETTLED", "SUCCESS"];
  const bad = ["REJECTED", "CANCELLED", "REFUNDED", "INACTIVE", "OUT_OF_STOCK", "DENIED", "FAILED", "ON_HOLD"];
  const color = good.includes(value) ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : bad.includes(value) ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-amber-50 text-amber-800 ring-amber-200";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1 ring-inset ${color}`}>{value.replaceAll("_", " ")}</span>;
}

export function AdminEmptyState({ title = "No preview records found", description = "Try adjusting the current search or filter." }: { title?: string; description?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><p className="font-semibold text-[#163A5F]">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>;
}

export function AdminLoadingState() {
  return <main className="min-h-[60vh] p-4 sm:p-6 lg:p-8"><div className="grid min-h-[40vh] place-items-center rounded-2xl border border-slate-200 bg-white"><div className="text-center"><LoaderCircle className="mx-auto size-7 animate-spin text-[#0F888D]"/><p className="mt-3 text-sm text-slate-600">Loading admin preview…</p></div></div></main>;
}

export function AdminErrorState({ reset }: { reset: () => void }) {
  return <main className="min-h-[60vh] p-4 sm:p-6 lg:p-8"><div className="grid min-h-[40vh] place-items-center rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><div><AlertCircle className="mx-auto size-8 text-rose-600"/><h2 className="mt-3 font-bold text-rose-900">This preview could not be displayed</h2><p className="mt-1 text-sm text-rose-700">Reload the page or try again.</p><button type="button" onClick={reset} className="mt-5 rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white">Try again</button></div></div></main>;
}
