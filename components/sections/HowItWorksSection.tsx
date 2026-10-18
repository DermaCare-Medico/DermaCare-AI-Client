import {
  Upload,
  ArrowRight,
  Stethoscope,
  MessageSquare,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Image",
    description:
      "Upload a clear photo of your skin concern to begin your screening journey.",
    label: "Simple & Convenient",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI-Assisted Screening",
    description:
      "Explore preliminary skin health insights that can help you understand possible next steps.",
    label: "Preliminary Insights",
  },
  {
    number: "03",
    icon: Stethoscope,
    title: "Connect with a Specialist",
    description:
      "Seek professional guidance from a dermatologist for a more informed assessment.",
    label: "Professional Guidance",
  },
  {
    number: "04",
    icon: MessageSquare,
    title: "Continue Your Care",
    description:
      "Keep track of your care journey and communicate with healthcare professionals when available.",
    label: "Ongoing Support",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-20 sm:py-24">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Simple Steps, Better Access
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            How It <span className="text-primary">Works</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
            From your first skin concern to professional guidance, DermaCare AI
            helps you explore your next steps with a simple, accessible process.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-7"
              >
                {/* Step Number & Icon */}
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
                  </div>

                  <span className="text-3xl font-bold tracking-tight text-primary/15">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {step.description}
                </p>

                <div className="mt-6 flex items-center gap-2 border-t border-border/70 pt-5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-10 z-10 hidden h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm lg:flex">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Medical Disclaimer */}
        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-border/70 bg-card/70 p-4 sm:p-5">
          <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
            <span className="font-semibold text-foreground">
              Medical Disclaimer:{" "}
            </span>
            AI-assisted screening provides preliminary information only and
            cannot diagnose skin conditions or replace evaluation by a
            qualified healthcare professional.
          </p>
        </div>
      </div>
    </section>
  );
}