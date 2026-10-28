"use client";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <section role="alert" className="mx-auto max-w-xl rounded-xl border border-rose-200 bg-rose-50 p-8 text-center"><AlertTriangle className="mx-auto mb-3 text-rose-500" size={26} /><h1 className="text-lg font-bold text-rose-900">Could not load the doctor application</h1><p className="mt-2 text-sm leading-6 text-rose-700">Your saved application details were not removed. Try loading the application again.</p><Button variant="outline" className="mt-5" onClick={reset}>Try again</Button></section>;
}

