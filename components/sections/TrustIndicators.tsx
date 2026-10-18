import {
  ShieldCheck,
  CheckCheck,
  Clock,
  Users,
  ArrowUpRight,
} from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Privacy Comes First",
    description:
      "Your personal information deserves protection. We prioritize privacy throughout your screening experience.",
    label: "Privacy Focused",
  },
  {
    icon: CheckCheck,
    title: "AI-Assisted Screening",
    description:
      "Get preliminary skin screening insights designed to support, not replace, professional medical advice.",
    label: "AI-Powered Insights",
  },
  {
    icon: Clock,
    title: "Insights in Minutes",
    description:
      "Receive preliminary screening insights quickly and discover the next steps for your skin health.",
    label: "Quick Screening",
  },
  {
    icon: Users,
    title: "Professional Care",
    description:
      "Explore access to dermatologists for professional guidance and personalized consultation.",
    label: "Expert Guidance",
  },
];

export default function TrustIndicators() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Your Health, Our Priority
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Why Trust{" "}
            <span className="text-primary">DermaCare AI?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            A more accessible way to explore your skin health, with
            privacy-conscious experiences and a path toward professional care.
          </p>
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 sm:p-7"
              >
                <div className="mb-7 flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
                  </div>

                  <span className="text-sm font-medium text-muted-foreground/60">
                    0{index + 1}
                  </span>
                </div>

                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>

                <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
                  <span className="text-xs font-medium text-primary">
                    {item.label}
                  </span>

                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </article>
            );
          })}
        </div>

        {/* Medical Disclaimer */}
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-muted-foreground">
          DermaCare AI provides preliminary screening support only. It does not
          diagnose medical conditions or replace advice from a qualified
          healthcare professional.
        </p>
      </div>
    </section>
  );
}