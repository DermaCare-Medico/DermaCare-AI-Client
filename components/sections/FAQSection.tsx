"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const faqs = [
  {
    question: "What is DermaCare AI?",
    answer:
      "DermaCare AI is a digital platform designed to make skin health information more accessible through AI-assisted preliminary screening and resources for connecting with dermatology professionals.",
  },
  {
    question: "Can AI diagnose my skin condition?",
    answer:
      "No. AI-generated insights are preliminary and informational only. They cannot confirm a medical condition or replace an examination and advice from a qualified healthcare professional.",
  },
  {
    question: "How does AI-assisted skin screening work?",
    answer:
      "Depending on the features available, you may be able to submit a skin image for preliminary AI-assisted insights. Results can be limited or inaccurate, so consult a qualified professional about any skin concern.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Please review our Privacy Policy for details about information collection, usage, storage, and sharing. We recommend sharing only the information necessary to use the service.",
  },
  {
    question: "Can I consult a dermatologist through DermaCare AI?",
    answer:
      "The platform is designed to help users connect with dermatology professionals. Available doctors, appointment options, and consultation features depend on the services currently offered.",
  },
  {
    question: "Are the dermatologists verified?",
    answer:
      "Check each doctor's displayed credentials and verification status before booking. Verification should only be considered complete where the platform has actually reviewed the relevant professional credentials.",
  },
  {
    question: "What should I do if my skin condition gets worse?",
    answer:
      "Contact a qualified healthcare professional promptly. Do not rely on AI screening for urgent concerns, and seek emergency medical care for severe or rapidly worsening symptoms.",
  },
];

type FAQSectionProps = {
  variant?: "default" | "compact";
};

export default function FAQSection({
  variant = "default",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isCompact = variant === "compact";
  const visibleFaqs = isCompact ? faqs.slice(0, 5) : faqs;

  return (
    <section
      className={`relative overflow-hidden bg-background ${
        isCompact ? "py-14 sm:py-20" : "py-16 sm:py-24"
      }`}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-primary/[0.07] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-2 text-xs font-semibold tracking-wide text-primary sm:text-sm">
            <Sparkles className="h-4 w-4" />
            HELP CENTER
          </div>

          <h2
            className={`font-bold tracking-tight text-foreground ${
              isCompact
                ? "text-3xl sm:text-4xl"
                : "text-3xl sm:text-4xl lg:text-5xl"
            }`}
          >
            Questions? We have{" "}
            <span className="text-primary">answers.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Everything you need to know about DermaCare AI, skin screening,
            privacy, and connecting with dermatology professionals.
          </p>
        </div>

        {/* FAQ layout */}
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          {/* Left information panel */}
          <aside className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.10] via-primary/[0.04] to-card p-6 sm:p-8 lg:min-h-[430px]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-background/80 text-primary shadow-sm">
                <HelpCircle className="h-7 w-7" />
              </div>

              <h3 className="max-w-xs text-2xl font-bold leading-snug text-foreground sm:text-3xl">
                Your skin health questions matter.
              </h3>

              <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:text-base">
                Explore how our platform works and learn what to expect before
                getting started.
              </p>
            </div>

            <div className="relative mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    AI-assisted insights
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Understand the platform s screening features.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Informed decisions
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Learn about privacy and professional care.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right accordion */}
          <div className="space-y-3">
            {visibleFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const answerId = `faq-answer-${isCompact ? "home" : "page"}-${index}`;

              return (
                <article
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-primary/30 bg-card shadow-lg shadow-primary/[0.05]"
                      : "border-border/70 bg-card/70 hover:border-primary/25 hover:bg-card"
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    className="group flex w-full items-center gap-4 p-4 text-left sm:p-5"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
                        isOpen
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/[0.08] text-primary group-hover:bg-primary/[0.13]"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="flex-1 text-sm font-semibold leading-6 text-foreground sm:text-base">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isOpen
                          ? "rotate-180 bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  <div
                    id={answerId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="ml-[3.25rem] border-t border-border/60 px-4 pb-5 pt-4 sm:ml-[3.75rem] sm:px-5">
                        <p className="text-sm leading-7 text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* View all FAQs */}
            {isCompact && (
              <div className="pt-4 text-center sm:text-left">
                <Link
                  href="/faq"
                  className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  View All Questions
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Support card */}
        <div className="mx-auto mt-12 flex max-w-6xl flex-col gap-5 rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-6 w-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              Still have questions?
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Visit our platform or use the available support channels for
              additional assistance.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.05] hover:text-primary"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Medical disclaimer */}
        <p className="mx-auto mt-7 max-w-3xl text-center text-xs leading-6 text-muted-foreground">
          DermaCare AI provides preliminary informational insights only. It
          does not diagnose medical conditions or replace professional medical
          advice, diagnosis, or treatment.
        </p>
      </div>
    </section>
  );
}