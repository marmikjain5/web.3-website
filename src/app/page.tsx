import { getPublicSubmissionPortalSettings } from "@/app/actions/submissions";
import { getPublicProjects, getProjectsPageSettings } from "@/app/actions/projects";
import TeamGallery from "@/components/TeamGallery";
import ResidencyHero from "@/components/chaingpt/ResidencyHero";
import ChainHero from "@/components/chaingpt/ChainHero";
import IncubationSection from "@/components/chaingpt/IncubationSection";
import CoinShowcaseSection from "@/components/chaingpt/CoinShowcaseSection";
import PortfolioSection from "@/components/chaingpt/PortfolioSection";
import FaqSection from "@/components/chaingpt/FaqSection";
import CyberSidebar from "@/components/chaingpt/CyberSidebar";
import UpcomingEventHome from "@/components/UpcomingEventHome";

export default async function Home() {
  const portalSettingsResult = await getPublicSubmissionPortalSettings();
  const [projectsResult, settingsResult] = await Promise.all([
    getPublicProjects(),
    getProjectsPageSettings(),
  ]);

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-hidden lab-grid-bg">
      {/* Floating Right Cyber Sidebar */}
      <CyberSidebar />

      {/* ── Primary Hero Page: Fullscreen TV Monitor Character Video (WE BACK 3UILJERS) ── */}
      <ResidencyHero />

      {/* ── Supercharging Student Builders: Interactive Mechanical AI Core ── */}
      <div id="incubation-hub" className="scroll-mt-28">
        <ChainHero portalSettings={portalSettingsResult.data} />
      </div>

      {/* ── Protocol Coin: 3D Interactive Coin Showcase ── */}
      <CoinShowcaseSection />

      {/* ── Student Incubation: AI Robot & 4-Stage Acceleration Roadmap ── */}
      <IncubationSection />

      {/* ── Student Initiatives & Ecosystem Tracks ── */}
      <div id="portfolio">
        <PortfolioSection
          initialProjects={projectsResult.data}
          settings={settingsResult.data}
        />
      </div>

      {/* ── Flagship Events from Supabase ── */}
      <div id="events">
        <UpcomingEventHome />
      </div>

      {/* ── Community Gallery / Life at Web3 ── */}
      <div id="team">
        <TeamGallery />
      </div>

      {/* ── Frequently Asked Questions for Students ── */}
      <div id="faq">
        <FaqSection />
      </div>
    </main>
  );
}
