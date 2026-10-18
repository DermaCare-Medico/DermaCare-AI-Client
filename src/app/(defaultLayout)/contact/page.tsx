import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, ShieldCheck } from "lucide-react";

const CHANNELS = [
  {
    icon: MessageCircle,
    title: "Product & booking support",
    body: "Questions about screening, booking a consultation, or a prescription.",
    action: "support@dermacare.ai",
  },
  {
    icon: Mail,
    title: "Doctor verification",
    body: "Licensed clinicians with questions about joining the platform and verification.",
    action: "doctors@dermacare.ai",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & data requests",
    body: "Access, correction or deletion requests relating to your personal data.",
    action: "privacy@dermacare.ai",
  },
];

export default function ContactPage() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-4 py-2 text-xs font-semibold tracking-wide text-primary sm:text-sm">
            <MessageCircle className="h-4 w-4" />
            CONTACT
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            We are here to help
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            DermaCare AI is an educational prototype. For medical emergencies,
            always contact your local emergency services or a qualified
            healthcare professional immediately.
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <article
                key={channel.title}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-colors hover:border-primary/30"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="text-base font-semibold text-foreground">
                  {channel.title}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {channel.body}
                </p>
                <span className="mt-auto break-all text-sm font-medium text-primary">
                  {channel.action}
                </span>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:flex-row sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Ready to start a screening?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a free account to upload a skin image and get preliminary
              AI insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/faq"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-primary/[0.05] hover:text-primary"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
