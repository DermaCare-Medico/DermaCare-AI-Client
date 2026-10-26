import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";

export default function NotFound() {
  return <main className="grid min-h-[70vh] place-items-center bg-[#F7F9FC] px-6"><div className="max-w-lg text-center"><PackageX className="mx-auto size-10 text-slate-400"/><h1 className="mt-4 text-2xl font-bold text-[#102d31]">Medicine not found</h1><p className="mt-2 text-sm text-slate-600">The requested medicine preview is unavailable or may have been removed.</p><Link href="/store" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0F888D] px-4 py-2.5 text-sm font-semibold text-white"><ArrowLeft className="size-4"/>Back to store</Link></div></main>;
}
