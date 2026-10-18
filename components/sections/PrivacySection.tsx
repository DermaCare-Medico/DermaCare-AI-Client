import {
  ShieldCheck,
  Lock,
  User,
  Bot,
  Eye,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const privacyFeatures = [
  {
    icon: ShieldCheck,
    title: "Data Protection",
    description:
      "We aim to handle your personal information responsibly and protect it through appropriate security practices.",
    label: "Security Focused",
  },
  {
    icon: Lock,
    title: "Account Security",
    description:
      "Account access and authentication help protect your information from unauthorized access.",
    label: "Account Safety",
  },
  {
    icon: User,
    title: "Privacy & Control",
    description:
      "Understand what information you share and review the applicable privacy policy to learn how your data is handled.",
    label: "User Awareness",
  },
  {
    icon: Bot,
    title: "Responsible AI",
    description:
      "AI-assisted screening is designed to provide preliminary insights, not to identify you or make a medical diagnosis.",
    label: "Responsible Technology",
  },
];

export default function PrivacySection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Your Privacy Matters
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Privacy &{" "}
            <span className="text-primary">Security</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
            Your skin health journey deserves thoughtful care, including
            transparency about how your information is collected, used, and
            protected.
          </p>
        </div>

        {/* Privacy Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {privacyFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-7"
              >
                <div className="mb-7 flex items-center justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
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

        {/* Privacy Notice */}
        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-border/70 bg-card/70 p-4 sm:p-5">
          <Eye className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
            <span className="font-semibold text-foreground">
              Transparency Matters:{" "}
            </span>
            Please review the platform s Privacy Policy for details about data
            collection, storage, sharing, and retention. Specific security
            measures should be confirmed against the platform s actual
            implementation.
          </p>
        </div>

        {/* Bottom Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <p>Your information deserves responsible and transparent handling.</p>
        </div>
      </div>
    </section>
  );
}