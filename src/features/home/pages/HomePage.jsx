import { HomeHero } from "../components/HomeHero";
import { LiveRaceBand } from "../components/LiveRaceBand";
import { EcosystemSection } from "../components/EcosystemSection";
import { RegisterStrip } from "../components/RegisterStrip";
import { VirtualPaddock } from "../components/VirtualPaddock";
import { BackboneSection } from "../components/BackboneSection";
import { HomeFooter } from "../components/HomeFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <HomeHero />
      <LiveRaceBand />
      <EcosystemSection />
      {/* Not in FE-v2 — kept from the previous landing page so owners and
          jockeys keep a public registration entry point. */}
      <RegisterStrip />
      <VirtualPaddock />
      <BackboneSection />
      <HomeFooter />
    </div>
  );
}
