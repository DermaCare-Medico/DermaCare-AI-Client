import {
  Sparkles,
  Microscope,
  Brain,
  Shield,
  Languages,
  Stethoscope,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Assisted Image Analysis",
    description:
      "Explore preliminary insights from skin images with AI-assisted analysis designed to support your skin health journey.",
    label: "Smart Screening",
  },
  {
    icon: Microscope,
    title: "Skin Health Insights",
    description:
      "Learn about possible skin concerns and discover appropriate next steps to discuss with a healthcare professional.",
    label: "Informative Guidance",
  },
  {
    icon: Brain,
    title: "Technology-Driven Support",
    description:
      "Leverage AI technology to help organize preliminary information and make your next steps easier to understand.",
    label: "AI-Powered",
  },
  {
    icon: Shield,
    title: "Privacy-Conscious Experience",
    description:
      "Access skin screening features through a platform designed with privacy and responsible handling of information in mind.",
    label: "Privacy Focused",
  },
  {
    icon: Languages,
    title: "Accessible Experience",
    description:
      "Explore an approachable screening experience designed to make skin health information easier to understand.",
    label: "User Friendly",
  },
  {
    icon: Stethoscope,
    title: "Professional Care Connection",
    description:
      "Take the next step toward professional dermatological guidance when your skin concern needs further evaluation.",
    label: "Expert Guidance",
  },
];

export default function AIFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Intelligent Healthcare Technology
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            AI-Assisted{" "}
            <span className="text-primary">Skin Screening</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
            Discover digital tools designed to help you explore skin health
            concerns, understand preliminary insights, and find a path toward
            professional care.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-7"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </div>

                  <span className="text-2xl font-bold text-primary/15">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    {feature.label}
                  </span>

                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </article>
            );
          })}
        </div>

        {/* Medical Disclaimer */}
        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-border/70 bg-card/70 p-4 sm:p-5">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
            <span className="font-semibold text-foreground">
              Important Notice:{" "}
            </span>
            AI-assisted screening provides preliminary information only. It
            cannot confirm a diagnosis, replace a medical examination, or
            substitute for advice from a qualified healthcare professional.
          </p>
        </div>
      </div>
    </section>
  );
}