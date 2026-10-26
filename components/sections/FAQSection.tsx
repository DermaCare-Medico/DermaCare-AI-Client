"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageSquareMore } from "lucide-react";
import { Button, ButtonArrow } from "@/components/ui/button";

const faqs = [
  {
    question: "How does the AI skin screening work?",
    answer:
      "You upload a clear photo of your skin concern, and our AI analyzes visual features such as lesions, color variation, and texture patterns to provide preliminary risk indicators and clinical context. This is intended to support discussions with a doctor, not replace professional judgment.",
  },
  {
    question: "Is DermaCare AI a replacement for a doctor?",
    answer:
      "No. DermaCare AI provides educational and preliminary risk indications only. Final diagnosis, treatment plans, and prescriptions must always come from a licensed doctor or dermatologist.",
  },
  {
    question: "How is my personal and medical data protected?",
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

interface FAQSectionProps {
  variant?: "default" | "compact";
}

export default function FAQSection({
  variant = "default",
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isCompact = variant === "compact";
  const visibleFaqs = isCompact ? faqs.slice(0, 5) : faqs;

  return (
    <section
      className={`relative overflow-hidden bg-transparent ${
        isCompact ? "py-14 sm:py-20" : "py-16 sm:py-24"
      }`}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-primary shadow-sm sm:text-sm">
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

        {/* Full-width accordion matching max-w-7xl container */}
        <div className="w-full">
          <div className="space-y-3.5">
            {visibleFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const answerId = `faq-answer-${isCompact ? "home" : "page"}-${index}`;

              return (
                <article
                  key={faq.question}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-primary/30 bg-white shadow-md shadow-primary/[0.04]"
                      : "border-border/70 bg-white/90 hover:border-primary/25 hover:bg-white"
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

                  {isOpen && (
                    <div
                      id={answerId}
                      className="border-t border-border/50 px-4 pb-5 pt-3 sm:px-5"
                    >
                      <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}

            {/* View all FAQs CTA */}
            {isCompact && (
              <div className="pt-8 text-center">
                <Button asChild variant="cta">
                  <Link href="/faq">View All Questions <ButtonArrow /></Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Support CTA card - full width */}
        <div className="mt-14 w-full rounded-3xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageSquareMore className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground sm:text-xl">
                  Still have questions?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our team is here to help guide you through every step.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="cta">
                <Link href="/contact">Contact Support <ButtonArrow /></Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

