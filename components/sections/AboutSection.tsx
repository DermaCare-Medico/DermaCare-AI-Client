import {
  Sparkles,
  Heart,
  Bot,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

const highlights = [
  {
    icon: Bot,
    title: "AI-Assisted Screening",
    description:
      "Explore preliminary skin health insights with AI-assisted screening.",
  },
  {
    icon: Heart,
    title: "Care That Puts You First",
    description:
      "Make informed decisions about your skin health with guidance toward professional care.",
  },
  {
    icon: ShieldCheck,
    title: "A More Accessible Experience",
    description:
      "Discover a convenient way to explore skin health resources and specialist consultations.",
  },
];

export default function AboutSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* About Content */}
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              About DermaCare AI
            </span>

            <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Making Skin Health{" "}
              <span className="text-primary">More Accessible</span>
            </h2>

            <p className="mt-6 text-base leading-8 text-muted-foreground">
              DermaCare AI helps people explore their skin health through
              AI-assisted preliminary screening and access to professional
              dermatological guidance. Our goal is to make the journey from
              skin concerns to informed next steps more convenient.
            </p>

            <p className="mt-4 text-base leading-8 text-muted-foreground">
              We believe everyone should have a convenient way to learn about
              their skin health. By bringing screening tools and specialist
              connections together, we aim to help users take informed steps
              toward appropriate care.
            </p>

            <div className="mt-8 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Heart className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-foreground">
                  Your Skin Health Matters
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Technology supports your journey, while qualified
                  professionals provide medical guidance.
                </p>
              </div>
            </div>
          </div>

          {/* Visual Panel */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-4 rounded-[2rem] bg-primary/5 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 shadow-xl shadow-primary/5 sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />

              <div className="relative flex flex-col items-center border-b border-border/70 pb-8 pt-4 text-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-primary/10 text-primary ring-1 ring-primary/15">
                  <Bot className="h-14 w-14" strokeWidth={1.5} />

                  <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-primary shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </span>

                  <span className="absolute -bottom-2 -left-2 flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-primary shadow-sm">
                    <Heart className="h-5 w-5" />
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-bold text-foreground">
                  Technology Meets Care
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                  Supporting your skin health journey with accessible digital
                  tools and professional guidance.
                </p>
              </div>

              <div className="relative space-y-5 pt-7">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-foreground">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      <ArrowUpRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground/60" />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="absolute -bottom-5 -right-3 hidden items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-lg sm:flex sm:-right-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  Care-Focused Design
                </p>
                <p className="text-xs text-muted-foreground">
                  Built around informed decisions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}