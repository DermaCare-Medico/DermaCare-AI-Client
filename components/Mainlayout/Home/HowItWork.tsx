import { Scan, Video, FileText, ShoppingBag, ChevronRight } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Screen",
      description: "Image check, symptoms, AI result with confidence.",
      icon: Scan,
    },
    {
      number: "2",
      title: "Consult",
      description: "Verified doctors, booking, video call.",
      icon: Video,
    },
    {
      number: "3",
      title: "Prescription",
      description: "Doctor-written, explained in simple words.",
      icon: FileText,
    },
    {
      number: "4",
      title: "Order",
      description: "Order from the DermaCare Store and track your package.",
      icon: ShoppingBag,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="w-full bg-[#F7F9FC] py-20 px-6 md:px-12 lg:px-24 font-sans text-[#172033]"
    >
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        {/* Section Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F2942] tracking-tight">
            How It Works
          </h2>
          <p className="text-base text-[#64748B]">
            Get the right care in 4 simple steps.
          </p>
        </div>

        {/* 4-Step Cards Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative flex items-stretch group">
                {/* Step Card */}
                <div className="w-full bg-white/80 backdrop-blur-md border border-[#E2E8F0] hover:border-[#0F888D]/40 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Icon Container with Soft Teal Gradient Background */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#14B8A6]/15 to-[#0F888D]/20 text-[#0F888D] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-7 h-7 stroke-[1.75]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#0F2942] tracking-tight">
                    {step.number}. {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow Connector (Visible between cards on Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-[#0F888D]/40">
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}