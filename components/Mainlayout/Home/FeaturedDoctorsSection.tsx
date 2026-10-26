import Image from "next/image";
import Link from "next/link";
import { Star, ShieldCheck, Sparkles, Calendar } from "lucide-react";
import { Button, ButtonArrow } from "@/components/ui/button";

interface Doctor {
  id: string;
  name: string;
  title: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  consultationFee: string;
  matchScore: number;
  avatarUrl: string;
  specialties: string[];
  nextAvailable: string;
}

const doctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sarah Rahman",
    title: "Senior Dermatologist",
    experience: "12 yrs exp",
    rating: 4.9,
    reviewsCount: 320,
    consultationFee: "৳800",
    matchScore: 96,
    avatarUrl: "https://images.unsplash.com/photo-1594824813566-888553a19b88?auto=format&fit=crop&w=600&q=80",
    specialties: ["Acne & Scarring", "Laser Therapy"],
    nextAvailable: "Today, 4:00 PM",
  },
  {
    id: "doc-2",
    name: "Dr. Tanvir Hasan",
    title: "Clinical Dermatologist",
    experience: "8 yrs exp",
    rating: 4.8,
    reviewsCount: 210,
    consultationFee: "৳600",
    matchScore: 91,
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80",
    specialties: ["Eczema & Psoriasis", "Pediatric Skin"],
    nextAvailable: "Tomorrow, 10:30 AM",
  },
  {
    id: "doc-3",
    name: "Dr. Ayesha Siddiqua",
    title: "Aesthetic & Skin Specialist",
    experience: "10 yrs exp",
    rating: 4.9,
    reviewsCount: 265,
    consultationFee: "৳750",
    matchScore: 88,
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    specialties: ["Anti-Aging", "Pigmentation"],
    nextAvailable: "Today, 6:15 PM",
  },
  {
    id: "doc-4",
    name: "Dr. Rahat Karim",
    title: "Trichologist & Dermatologist",
    experience: "6 yrs exp",
    rating: 4.7,
    reviewsCount: 180,
    consultationFee: "৳650",
    matchScore: 84,
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&q=80",
    specialties: ["Hair & Scalp", "Skin Screening"],
    nextAvailable: "Wed, 2:00 PM",
  },
];

export default function FeaturedDoctorsSection() {
  return (
    <section className="w-full bg-transparent px-4 py-20 font-sans text-[#172033] sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#E2E8F0] pb-6">
          <div className="flex flex-col gap-1.5">
            {/* <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F888D] bg-[#0F888D]/10 px-3 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Matched Specialists</span>
            </div> */}
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F2942] tracking-tight">
              Featured Doctors
            </h2>
            <p className="text-sm text-[#64748B]">
              Trusted board-certified experts tailored to your preliminary scan results.
            </p>
          </div>

          <Button asChild variant="cta">
            <Link href="/doctors">View All Doctors <ButtonArrow /></Link>
          </Button>
        </div>

        {/* Doctor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="group relative bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Card Header Media */}
              <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={doctor.avatarUrl}
                  alt={doctor.name}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2942]/80 via-transparent to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                  {/* Verified Badge */}
                  <div className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#0F2942] shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0F888D]" />
                    <span>Verified</span>
                  </div>

                  {/* AI Match Badge */}
                  {/* <div className="inline-flex items-center gap-1 bg-[#0F888D] text-white px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
                    <span>{doctor.matchScore}% Match</span>
                  </div> */}
                </div>

                {/* Doctor Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-xs font-medium text-teal-200">
                    {doctor.title} • {doctor.experience}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                    {doctor.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-3.5 flex-1 justify-between">
                
                {/* Rating & Availability */}
                <div className="flex items-center justify-between text-xs border-b border-[#E2E8F0] pb-3">
                  <div className="flex items-center gap-1 text-[#0F2942] font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                    <span>{doctor.rating}</span>
                    <span className="text-[#64748B] font-normal">
                      ({doctor.reviewsCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#0F888D] font-medium bg-[#0F888D]/10 px-2 py-0.5 rounded-md">
                    <Calendar className="w-3 h-3" />
                    <span>{doctor.nextAvailable}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {doctor.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-md"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Pricing & CTA Button */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-[#64748B]">Consultation Fee</span>
                    <span className="text-base font-bold text-[#0F2942]">
                      {doctor.consultationFee}
                    </span>
                  </div>

                  <Button asChild size="sm" className="w-full">
                    <Link href={`/doctors/${doctor.id}`}>View Profile &amp; Book</Link>
                  </Button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Footer Disclaimer */}
        {/* <p className="text-xs text-[#64748B] text-center mt-2">
          Ratings, fees, and AI match scores are based on real patient evaluations and preliminary skin assessment alignment.
        </p> */}

      </div>
    </section>
  );
}
