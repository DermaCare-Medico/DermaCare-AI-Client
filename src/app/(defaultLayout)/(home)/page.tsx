import WhoWeAreSection from "@/components/Mainlayout/Home/WhoWeAre";
import HeroSection from "./HeroSection";
import HowItWorksSection from "@/components/Mainlayout/Home/HowItWork";
import FeaturedDoctorsSection from "@/components/Mainlayout/Home/FeaturedDoctorsSection";
import FAQSection from "@/components/sections/FAQSection";
import FinalCTASection from "@/components/sections/FinalCTASection";

const page = () => {
  return (
    <div className="mb-20">
      <HeroSection />
      <WhoWeAreSection />
      <HowItWorksSection />
      <FeaturedDoctorsSection />
      <FAQSection variant="compact" />
      <FinalCTASection />
    </div>
  );
};

export default page;
