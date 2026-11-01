import { getSiteConfig, getTeamMembers } from "@/app/actions/admin";
import TeamGrid from "@/components/TeamGrid";
import ResidencyHero from "@/components/chaingpt/ResidencyHero";
import ChainHero from "@/components/chaingpt/ChainHero";
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

      {/* ── Supercharging Student Builders: Interactive Mechanical AI Core ── */}
      <div id="incubation-hub">
        <ChainHero config={config} />
      </div>

      {/* ── Student Incubation: 3D Robot & 4-Stage Acceleration Roadmap ── */}
      <IncubationSection />

      {/* ── Student Initiatives & Ecosystem Tracks ── */}
      <div id="portfolio">
        <PortfolioSection incubationCount={config.incubationCount} />
      </div>

      {/* ── Flagship Events from Supabase ── */}
      <div id="events">
        <UpcomingEventHome />
      </div>

      {/* ── Decrypto Curriculum & Hackathon Hub ── */}
      <DecryptoUpdates />

      {/* ── Core Team / Contributors Section ── */}
      <div id="team">
        <TeamGrid members={members} />
      </div>

      {/* ── Frequently Asked Questions for Students ── */}
      <div id="faq">
        <FaqSection faqs={config.faqs} />
      </div>
    </main>
  );
}
