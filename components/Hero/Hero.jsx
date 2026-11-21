import DotGrid from "../ui/DotGrid";
import TechText from "../ui/TechText";

const Hero = () => {
  return (
    <div className="h-screen relative flex justify-center items-center bg-black">
      <DotGrid />
      <div className="absolute h-screen items-center w-full justify-center z-50 text-white left-0 top-0">
      
      </div>
    </div>
  );
};

export default Hero;
