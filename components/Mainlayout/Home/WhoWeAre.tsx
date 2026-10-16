import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ArrowRight, Phone, ShieldCheck } from "lucide-react";
import img1 from "../../../public/images/doctor.jpg"
import img2 from "../../../public/images/doctor1.jpg"

export default function WhoWeAreSection() {
  const features = [
    "AI-Assisted Preliminary Screening",
    "Verified Board-Certified Dermatologists",
    "Safe & Curated Natural Care Guidance",
    "Digital Prescription Management",
    "Pharmacy Price & Stock Comparison",
    "Role-Based Access & Patient Privacy",
  ];

  return (
    <section className="w-full bg-[#F7F9FC] py-16 px-6 md:px-12 lg:px-24 font-sans text-[#172033]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Overlapping Images */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-start">
          {/* Main Large Image */}
          <div className="relative w-[320px] sm:w-[380px] h-[400px] sm:h-[460px] rounded-2xl overflow-hidden shadow-md border border-[#E2E8F0]">
            <Image
              src={img1}
              alt="Professional dermatologist consultation"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Overlapping Secondary Image (Bottom Right) */}
          <div className="absolute -bottom-8 right-2 sm:right-6 w-[220px] sm:w-[260px] h-[160px] sm:h-[180px] rounded-2xl overflow-hidden border-4 border-[#F7F9FC] shadow-xl">
            <Image
              src={img2}
              alt="Real skin analysis and care"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Right Side: DermaCare AI Brand Content */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] w-fit shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#0F888D]" />
            <span className="text-xs font-semibold text-[#0F2942] tracking-wide">
              Who We Are
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F2942] tracking-tight leading-[1.2]">
            Understand your skin. <br />
            <span className="text-[#0F888D]">Know what to do next.</span>
          </h2>

          {/* Paragraph */}
          <p className="text-sm text-[#64748B] leading-relaxed max-w-xl">
            DermaCare AI connects preliminary AI skin screening, verified doctor discovery, 
            online teleconsultation, digital prescriptions, and local pharmacy ordering into one simple, 
            connected platform designed around clinical safety and patient privacy.
          </p>

          {/* Feature List (2-column grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 my-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-[#172033]">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Action Area */}
          <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-[#E2E8F0] mt-2">
            {/* CTA Button */}
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-3 bg-[#0F888D] hover:bg-[#0d7579] text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-md group"
            >
              <span>Learn How It Works</span>
              <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Support / Emergency Help Block */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#163A5F] text-white flex items-center justify-center shadow-sm">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-[#0F2942] tracking-wide">
                  +1 (800) 555-DERMA
                </span>
                <span className="text-[11px] text-[#64748B]">24/7 Patient Support Line</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}