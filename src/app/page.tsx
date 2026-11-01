import { getSiteConfig, getTeamMembers } from "@/app/actions/admin";
import TeamGrid from "@/components/TeamGrid";
import ResidencyHero from "@/components/chaingpt/ResidencyHero";
import ChainHero from "@/components/chaingpt/ChainHero";
import BeyondCapital from "@/components/chaingpt/BeyondCapital";
import IncubationSection from "@/components/chaingpt/IncubationSection";
import PortfolioSection from "@/components/chaingpt/PortfolioSection";
import FaqSection from "@/components/chaingpt/FaqSection";
import CyberSidebar from "@/components/chaingpt/CyberSidebar";
import UpcomingEventHome from "@/components/UpcomingEventHome";
import DecryptoUpdates from "@/components/DecryptoUpdates";

export default async function Home() {
  const config = await getSiteConfig();
  const members = await getTeamMembers();

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden lab-grid-bg">
      {/* Floating Right Cyber Sidebar */}
      <CyberSidebar />

      {/* ── Primary Hero Page: Fullscreen TV Monitor Character Video (WE BACK 3UILJERS) ── */}
      <ResidencyHero />

      {/* ── Supercharging Web3 Builders: Interactive Mouse-Following Capsule ── */}
      <div id="incubation-hub">
        <ChainHero config={config} />
      </div>

      {/* Beyond Capital: Supercharging Web3 Builders */}
      <BeyondCapital />

      {/* Incubation: End-to-End Support */}
      <IncubationSection />

      {/* Portfolio: Our Incubations */}
      <div id="portfolio">
        <PortfolioSection incubationCount={config.incubationCount} />
      </div>

      {/* Flagship Events from Supabase */}
      <div id="events">
        <UpcomingEventHome />
      </div>

      {/* Core Team / Contributors Section (Default Homepage Team Section) */}
      <div id="team">
        <TeamGrid members={members} />
      </div>



      {/* Frequently Asked Questions */}
      <div id="faq">
        <FaqSection faqs={config.faqs} />
      </div>

      {/* Decrypto Curriculum & Hackathon Hub */}
      <DecryptoUpdates />
    </main>
  );
}