import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return <main className="grid min-h-[70vh] place-items-center bg-[#F7F9FC] px-6"><div className="text-center"><LoaderCircle className="mx-auto size-8 animate-spin text-[#0F888D]"/><p className="mt-3 text-sm text-slate-600">Loading medicine details...</p></div></main>;
}
