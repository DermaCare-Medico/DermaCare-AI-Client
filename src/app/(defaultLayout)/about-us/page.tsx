import AboutSection from "@/components/sections/AboutSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import AIFeaturesSection from "@/components/sections/AIFeaturesSection";
import DoctorFeaturesSection from "@/components/sections/DoctorFeaturesSection";
import TrustIndicators from "@/components/sections/TrustIndicators";
import FinalCTASection from "@/components/sections/FinalCTASection";

export default function AboutUsPage() {
  return (
    <main className="bg-background">
      <AboutSection />
      <HowItWorksSection />
      <AIFeaturesSection />
      <DoctorFeaturesSection />
      <TrustIndicators />
      <FinalCTASection />
    </main>
  );
}
