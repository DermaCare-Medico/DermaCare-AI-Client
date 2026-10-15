import WhoWeAreSection from "@/components/Mainlayout/Home/WhoWeAre";
import HeroSection from "./HeroSection";
import HowItWorksSection from "@/components/Mainlayout/Home/HowItWork";
import FeaturedDoctorsSection from "@/components/Mainlayout/Home/FeaturedDoctorsSection";


const page = () => {
    return (
        <div className="mb-20">
            <HeroSection />
            <WhoWeAreSection />
            <HowItWorksSection/>    
            <FeaturedDoctorsSection />
        </div>
    );
};

export default page;
