import BackgroundFX from "./components/BackgroundFX.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Ecosystem from "./components/Ecosystem.jsx";
import AppsSection from "./components/AppsSection.jsx";
import WhySection from "./components/WhySection.jsx";
import AudienceSection from "./components/AudienceSection.jsx";
import VisualExperience from "./components/VisualExperience.jsx";
import Roadmap from "./components/Roadmap.jsx";
import FinalCta from "./components/FinalCta.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-space-deep text-slate-50">
      <BackgroundFX />
      <Header />
      <main>
        <Hero />
        <Ecosystem />
        <AppsSection />
        <WhySection />
        <AudienceSection />
        <VisualExperience />
        <Roadmap />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
