import {
  Stethoscope,
  UserCheck,
  Calendar,
  MessageSquare,
  Video,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const doctorFeatures = [
  {
    icon: Stethoscope,
    title: "Verified Dermatologists",
    description:
      "Connect with dermatologists whose professional credentials have been reviewed through the platform's verification process.",
    label: "Professional Expertise",
  },
  {
    icon: Video,
    title: "Remote Consultations",
    description:
      "Explore convenient remote consultation options to discuss your skin concerns with a healthcare professional.",
    label: "Care From Anywhere",
  },
  {
    icon: Calendar,
    title: "Convenient Scheduling",
    description:
      "Find available consultation slots and choose a time that works for your schedule.",
    label: "Flexible Appointments",
  },
  {
    icon: MessageSquare,
    title: "Ongoing Communication",
    description:
      "Stay connected with your healthcare professional for follow-up discussions when these services are available.",
    label: "Continued Support",
  },
];

export default function DoctorFeaturesSection() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4" />
            Professional Medical Guidance
          </span>

          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Expert Care,{" "}
            <span className="text-primary">Closer to You</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base">
            Go beyond preliminary screening with access to professional
            dermatological guidance and a more convenient consultation
            experience.
          </p>
        </div>

        {/* Doctor Feature Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {doctorFeatures.map((feature, index) => {
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

        {/* Consultation Notice */}
        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-xl border border-border/70 bg-card/70 p-4 sm:p-5">
          <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

          <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
            <span className="font-semibold text-foreground">
              Your Health Matters:{" "}
            </span>
            AI screening is not a diagnosis. A qualified healthcare
            professional can evaluate your concerns and recommend appropriate
            care based on your individual needs.
          </p>
        </div>
      </div>
    </section>
  );
}