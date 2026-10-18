import Link from "next/link";
import {
  ShieldCheck,
  LockKeyhole,
  Database,
  Share2,
  UserRound,
  Baby,
  RefreshCw,
  CalendarDays,
  ArrowUpRight,
  Eye,
  FileText,
  Scale,
  Sparkles,
} from "lucide-react";

const policySections = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information We Collect",
    icon: Database,
    content: [
      {
        heading: "Account Information",
        text: "When you register, the platform may collect information such as your name, email address, and phone number, depending on the fields you provide.",
      },
      {
        heading: "Skin Images and Related Information",
        text: "If you use AI-assisted screening, you may submit skin images and related information. Skin images can contain sensitive information, so please review how they are processed and stored before submitting them.",
      },
      {
        heading: "Technical Information",
        text: "The platform may process technical information required to operate the service, such as browser details, device information, and diagnostic logs, where applicable.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    number: "02",
    title: "How We Use Your Information",
    icon: Eye,
    content: [
      {
        heading: "Providing the Service",
        text: "Information may be used to create and manage your account, provide available platform features, and deliver AI-assisted screening where enabled.",
      },
      {
        heading: "Communication and Support",
        text: "Your contact information may be used to respond to your requests, provide relevant service communications, and assist with account-related issues.",
      },
      {
        heading: "Security and Improvement",
        text: "Information may be used to maintain platform functionality, investigate technical problems, and help protect the service from misuse, where applicable.",
      },
    ],
  },
  {
    id: "data-sharing",
    number: "03",
    title: "Data Sharing and Disclosure",
    icon: Share2,
    content: [
      {
        heading: "Service Providers",
        text: "Information may be processed by third-party providers that support the platform, such as hosting, authentication, storage, or AI processing services, if those providers are used.",
      },
      {
        heading: "Professional Care",
        text: "Information may be shared with a healthcare professional only where the relevant feature, user action, and applicable privacy requirements permit it.",
      },
      {
        heading: "Legal Requirements",
        text: "Information may be disclosed where required by applicable law or a valid legal process.",
      },
    ],
  },
  {
    id: "data-security",
    number: "04",
    title: "Data Security and Retention",
    icon: LockKeyhole,
    content: [
      {
        heading: "Security Measures",
        text: "Appropriate safeguards should be used to protect personal information against unauthorized access, loss, or misuse. The specific protections depend on the measures actually implemented by the platform.",
      },
      {
        heading: "Data Retention",
        text: "Personal information should be retained only for as long as necessary for the stated purposes or as required by applicable law. Actual retention periods should be documented by the platform.",
      },
      {
        heading: "No Absolute Guarantee",
        text: "No online service can guarantee absolute security. Avoid sharing information that is not necessary to use the service.",
      },
    ],
  },
  {
    id: "your-rights",
    number: "05",
    title: "Your Privacy Rights",
    icon: UserRound,
    content: [
      {
        heading: "Access and Correction",
        text: "Depending on applicable law and the platform's capabilities, you may be able to request access to your personal information or ask for inaccurate information to be corrected.",
      },
      {
        heading: "Deletion and Requests",
        text: "You may request deletion of your information or ask questions about how it is handled. Some information may need to be retained where legally required.",
      },
      {
        heading: "Communication Preferences",
        text: "Where applicable, you can manage optional communications through the available settings or request assistance from the platform's support team.",
      },
    ],
  },
  {
    id: "childrens-privacy",
    number: "06",
    title: "Children's Privacy",
    icon: Baby,
    content: [
      {
        heading: "Age Restrictions",
        text: "The platform's minimum age requirements should be clearly stated and followed. If the service is not intended for children under a specified age, that restriction should be documented here.",
      },
      {
        heading: "Information About Children",
        text: "If you believe a child has provided personal information inappropriately, contact the platform operator so the matter can be reviewed under applicable law and policy.",
      },
    ],
  },
  {
    id: "policy-changes",
    number: "07",
    title: "Changes to This Policy",
    icon: RefreshCw,
    content: [
      {
        heading: "Policy Updates",
        text: "This policy may be revised as the platform changes. Material updates should be communicated through an appropriate channel where required.",
      },
      {
        heading: "Reviewing Changes",
        text: "Please revisit this page periodically to understand the privacy practices described here. The effective date should be updated whenever a revised policy is published.",
      },
    ],
  },
];

export default function PrivacyPage() {
  const lastUpdated = "October 14, 2026";

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.09] via-primary/[0.03] to-background py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary/[0.06] blur-3xl" />
          <div className="absolute inset-0 opacity-[0.1] [background-image:radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:26px_26px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Privacy & Transparency
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Privacy,{" "}
              <span className="text-primary">Our Responsibility.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Learn how DermaCare AI approaches personal information, skin
              images, data sharing, and your privacy choices.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2.5">
                <CalendarDays className="h-4 w-4 text-primary" />
                <span>Last updated: {lastUpdated}</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>Privacy Policy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="relative py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
            {/* Table of Contents */}
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-foreground">
                      On this page
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Browse policy sections
                    </p>
                  </div>
                </div>

                <nav aria-label="Privacy policy sections" className="space-y-1">
                  {policySections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-primary/[0.06] hover:text-primary"
                    >
                      <span className="pt-0.5 text-xs font-semibold text-primary/60">
                        {section.number}
                      </span>
                      <span className="leading-5">{section.title}</span>
                    </a>
                  ))}
                </nav>

                <div className="mt-5 rounded-xl bg-primary/[0.06] p-4">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    Your information matters
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Review this policy before sharing personal or skin-related
                    information.
                  </p>
                </div>
              </div>
            </aside>

            {/* Policy Body */}
            <div className="min-w-0">
              <div className="mb-8 rounded-2xl border border-primary/15 bg-primary/[0.04] p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Scale className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      About this Privacy Policy
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      This page describes intended privacy practices for
                      DermaCare AI. Before publication, the platform operator
                      should verify every statement against the actual
                      application, its service providers, and applicable law.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {policySections.map((section) => {
                  const Icon = section.icon;

                  return (
                    <article
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-28 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-primary/20 sm:p-7 lg:p-8"
                    >
                      <div className="mb-6 flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold tracking-widest text-primary">
                            SECTION {section.number}
                          </p>
                          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                            {section.title}
                          </h2>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {section.content.map((item) => (
                          <div key={item.heading}>
                            <h3 className="text-sm font-semibold text-foreground sm:text-base">
                              {item.heading}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">
                              {item.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Contact / Disclaimer */}
              <div className="mt-8 rounded-2xl border border-border/70 bg-muted/30 p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-foreground">
                      Questions about your privacy?
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Contact the platform operator through the official
                      support channel listed on the website for questions
                      about this policy or your personal information.
                    </p>

                    <Link
                      href="/contact"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                    >
                      Contact Support
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              <p className="mt-8 text-center text-xs leading-6 text-muted-foreground">
                This policy draft is for project development purposes and is
                not legal advice. Have it reviewed for your actual data
                practices and applicable legal requirements before publishing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}