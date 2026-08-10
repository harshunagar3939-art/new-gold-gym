import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Marquee from "../components/Marquee";
import Stats from "../components/Stats";
import Programs from "../components/Programs";
import MuscleVisualizer3D from "../components/MuscleVisualizer3D";
import Trainers from "../components/Trainers";
import Testimonial from "../components/Testimonial";
import Pricing from "../components/Pricing";
import ContactCTA from "../components/ContactCTA";
import Footer from "../components/Footer";
import SectionWrap from "../components/SectionWrap";

export default function HomePage() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <>
      <Navbar />
      <Hero />
      <Marquee items={["NEW GOLD GYM", "STRENGTH", "DISCIPLINE", "RESULTS", "POWER"]} />
      <SectionWrap dumbbellPosition="left" type3d="stats">
        <Stats />
      </SectionWrap>
      <SectionWrap dumbbellPosition="right" type3d="programs">
        <Programs />
      </SectionWrap>
      <MuscleVisualizer3D />
      <SectionWrap dumbbellPosition="left" type3d="trainers">
        <Trainers />
      </SectionWrap>
      <SectionWrap dumbbellPosition="right" type3d="pricing">
        <Pricing onSelectPlan={setSelectedPlan} />
      </SectionWrap>
      <SectionWrap dumbbellPosition="left" type3d="dumbbell">
        <Testimonial />
      </SectionWrap>
      <Marquee items={["JOIN TODAY", "NO EXCUSES", "NEW GOLD GYM", "TRAIN HARD"]} />
      <SectionWrap dumbbellPosition="right" type3d="dumbbell">
        <ContactCTA selectedPlan={selectedPlan} />
      </SectionWrap>
      <Footer />
    </>
  );
}

