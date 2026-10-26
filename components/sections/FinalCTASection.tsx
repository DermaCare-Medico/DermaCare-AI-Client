import Link from "next/link";
import { Sparkles, ShieldCheck, HeartPulse } from "lucide-react";
import { Button, ButtonArrow } from "@/components/ui/button";

export default function FinalCTASection() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 sm:py-24">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            Your Skin Health Journey Starts Here
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            A Better Approach to{" "}
            <span className="text-white/75">Understanding Your Skin</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
            Explore AI-assisted skin health insights and discover opportunities
            to connect with dermatology professionals—all in one convenient
            place.
          </p>

          {/* CTA */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="cta" size="lg" className="w-full border-white/35 focus-visible:ring-white/40 sm:w-auto">
              <Link href="/register">Get Started Today <ButtonArrow /></Link>
            </Button>

            <Button asChild variant="ctaOutline" size="lg" className="w-full border-white/35 focus-visible:ring-white/40 sm:w-auto">
              <Link href="/">Explore DermaCare AI <ButtonArrow /></Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Privacy-conscious experience</span>
            </div>

            <div className="hidden h-4 w-px bg-white/25 sm:block" />

            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4" />
              <span>Designed around your skin health</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="mx-auto mt-8 max-w-2xl text-xs leading-6 text-white/60">
            AI-generated insights are informational only and are not a
            substitute for professional medical advice, diagnosis, or treatment.
            Please consult a qualified healthcare professional for medical
            concerns.
          </p>
        </div>
      </div>
    </section>
  );
}
