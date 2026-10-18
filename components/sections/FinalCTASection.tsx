import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, HeartPulse } from "lucide-react";

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
            <Link
              href="/register"
              className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:w-auto"
            >
              Get Started Today
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/25 bg-white/5 px-7 py-3.5 text-base font-medium text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:w-auto"
            >
              Explore DermaCare AI
            </Link>
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