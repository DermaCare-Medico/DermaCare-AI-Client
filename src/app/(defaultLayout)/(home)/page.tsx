import WhoWeAreSection from "@/components/Mainlayout/Home/WhoWeAre";
import HeroSection from "./HeroSection";
import HowItWorksSection from "@/components/Mainlayout/Home/HowItWork";
import FeaturedDoctorsSection from "@/components/Mainlayout/Home/FeaturedDoctorsSection";
import FAQSection from "@/components/sections/FAQSection";

const page = () => {
  return (
    <div className="relative w-full min-h-screen bg-[#F8FAF9] overflow-hidden">
      {/* Scoped editorial background texture layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Accent 1: Hero area - soft top drift */}
        <div
          className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-[1480px] h-[340px] opacity-[0.16] bg-[url('/images/medical-lines.svg')] bg-no-repeat bg-[position:center_top] bg-[size:1480px_auto] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,black_20%,transparent_85%)]"
        />

        {/* Accent 2: Who We Are area - left-anchored accent with 350px+ vertical gap */}
        <div
          className="absolute top-[1080px] -left-20 sm:-left-10 lg:left-0 w-[500px] sm:w-[650px] lg:w-[760px] h-[300px] opacity-[0.15] bg-[url('/images/medical-lines.svg')] bg-no-repeat bg-[position:left_center] bg-[size:1400px_auto] [mask-image:radial-gradient(ellipse_70%_65%_at_30%_50%,black_20%,transparent_85%)]"
        />

        {/* Accent 3: How It Works area - right-anchored accent with 350px+ vertical gap */}
        <div
          className="absolute top-[1880px] -right-20 sm:-right-10 lg:right-0 w-[500px] sm:w-[650px] lg:w-[760px] h-[300px] opacity-[0.15] bg-[url('/images/medical-lines.svg')] bg-no-repeat bg-[position:right_center] bg-[size:1400px_auto] [mask-image:radial-gradient(ellipse_70%_65%_at_70%_50%,black_20%,transparent_85%)]"
        />

        {/* Accent 4: Doctors & FAQ transition - subtle centered accent with 300px+ vertical gap */}
        <div
          className="absolute top-[2760px] left-1/2 -translate-x-1/2 w-full max-w-[1240px] h-[280px] opacity-[0.14] bg-[url('/images/medical-lines.svg')] bg-no-repeat bg-[position:center_bottom] bg-[size:1350px_auto] [mask-image:radial-gradient(ellipse_65%_60%_at_50%_50%,black_20%,transparent_80%)]"
        />
      </div>

      {/* Main landing page sections */}
      <div className="relative z-10 pb-16">
        <HeroSection />
        <WhoWeAreSection />
        <HowItWorksSection />
        <FeaturedDoctorsSection />
        <FAQSection variant="compact" />
      </div>
    </div>
  );
};

export default page;
