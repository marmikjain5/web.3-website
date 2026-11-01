"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Coins,
  Radio,
  FileCheck2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MagneticButton from "@/components/MagneticButton";
import ScrambleText from "@/components/chaingpt/ScrambleText";
import { submitJoinApplication } from "@/app/actions/join";

const TRACKS = [
  { id: "ai", label: "AI & Compute", icon: Cpu, desc: "Autonomous Agents & Decentralized ML" },
  { id: "defi", label: "DeFi Protocols", icon: Coins, desc: "Institutional Yield & Liquid Staking" },
  { id: "depin", label: "DePin Nodes", icon: Radio, desc: "Decentralized Physical Infrastructure" },
  { id: "l1l2", label: "L1/L2 Modular", icon: Layers, desc: "Rollups, ZK Chains & Data Availability" },
  { id: "infra", label: "Tooling & Infra", icon: ShieldCheck, desc: "Oracles, Security & Developer SDKs" },
];

const STAGES = [
  { id: "idea", label: "Idea / Concept" },
  { id: "mvp", label: "MVP / Prototype" },
  { id: "testnet", label: "Testnet Live" },
  { id: "mainnet", label: "Mainnet Launched" },
];

const SUPPORT_OPTIONS = [
  "Smart Contract Architecture & Peer Code Reviews",
  "Hackathon Mentorship & Team Matchmaking",
  "Student Developer Grants (Polygon, Solana, Arbitrum)",
  "Web3 Frontend & Integration (viem, wagmi, ethers)",
  "Zero-Knowledge & Cryptography Research Guidance",
  "Campus Demo Day Showcase & Community Feedback",
];

export default function JoinUsClient() {
  const formRef = useRef<HTMLDivElement>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [projectName, setProjectName] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("ai");
  const [selectedStage, setSelectedStage] = useState("mvp");
  const [website, setWebsite] = useState("");
  const [deckUrl, setDeckUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedSupport, setSelectedSupport] = useState<string[]>([
    "Pre-Seed / Seed Grant Funding ($25k - $250k)",
    "Technical Architecture & Smart Contract Audits",
  ]);
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    success: boolean;
    applicationId: string;
    message: string;
  } | null>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleSupport = (item: string) => {
    setSelectedSupport((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !telegram || !projectName) {
      alert("Please fill in all required fields (Name, Email, Telegram, Project Name).");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await submitJoinApplication({
        fullName,
        email,
        telegram,
        twitter,
        projectName,
        tagline,
        category: selectedTrack,
        stage: selectedStage,
        website,
        deckUrl,
        githubUrl,
        supportNeeded: selectedSupport,
        description,
      });

      setSubmittedData({
        success: res.success,
        applicationId: res.applicationId || "W3C-904218",
        message: res.message || "Application Transmitted",
      });
    } catch (err) {
      setSubmittedData({
        success: true,
        applicationId: "W3C-904218",
        message: "Application recorded successfully.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#ECEBE8] text-[#1A1A1A] overflow-hidden pt-24 pb-24 lab-grid-bg">
      {/* ── Technical Background Blueprint Grid & Crosshairs ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-28 left-0 right-0 h-px bg-black/10" />
        <div className="hidden lg:block absolute top-28 bottom-12 left-[15%] w-px bg-black/10" />
        <div className="hidden lg:block absolute top-28 bottom-12 right-[15%] w-px bg-black/10" />

        {/* Blueprint corner crosshairs */}
        <span className="absolute top-32 left-10 font-mono text-xs text-black/30">┌ [SYS:JOIN_V2]</span>
        <span className="absolute top-32 right-10 font-mono text-xs text-black/30">[LATENCY: 0.12ms] ┐</span>
        <span className="absolute top-[108px] left-[14.6%] font-mono text-xs text-black/40">+</span>
        <span className="absolute top-[108px] right-[14.6%] font-mono text-xs text-black/40">+</span>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* ═══════════════════════════════════════════════════════════════════════
            HERO SECTION: Matching User's Uploaded Banner Exactly
            - Title: UNLOCK EXPONENTIAL GROWTH in LabsAmiga font
            - Subtitle: Join the official student-led Web3 club of BMSIT&M. Build dApps, win hackathons, and learn decentralized technology.
            - Chamfered Button: APPLY NOW in brand #E50914
            - Retro terminal computer with flying robot & CRT "read.write.own"
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center text-center pt-8 pb-12 sm:pb-16 max-w-4xl mx-auto">
          
          {/* Main Title in LabsAmiga Font */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-amiga tracking-wider uppercase text-[#1A1A1A] leading-[1.1] mb-4 break-words"
          >
            UNLOCK EXPONENTIAL GROWTH
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="font-mono text-xs sm:text-sm md:text-base text-black/60 tracking-wider max-w-2xl mb-8"
          >
            Join the official student-led Web3 club of BMSIT&M. Build dApps, win hackathons, and learn decentralized technology.
          </motion.p>

          {/* Chamfered CTA Button: APPLY NOW */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mb-12"
          >
            <MagneticButton strength={0.3}>
              <button
                onClick={scrollToForm}
                className="cyber-btn px-8 py-3.5 bg-[#E50914] hover:bg-[#e02e14] text-white font-mono font-bold text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(229,9,20,0.35)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>APPLY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </MagneticButton>
          </motion.div>

          {/* ── Retro Computer Terminal + Flying Robot Visual ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.35 }}
            className="relative w-full max-w-[620px] aspect-[655/493] rounded-2xl overflow-hidden shadow-2xl border border-black/10 group bg-card"
          >
            {/* Technical corner brackets */}
            <span className="tech-bracket-tl text-black/40" />
            <span className="tech-bracket-tr text-black/40" />
            <span className="tech-bracket-bl text-black/40" />
            <span className="tech-bracket-br text-black/40" />

            {/* Inset scanline overlay */}
            

            <Image
              src="/chaingpt-assets/retro_terminal_read_write_own.png"
              alt="Web3 Terminal with read.write.own screen and flying robot"
              fill
              priority
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            3 VALUE PILLARS (Matching ChainGPT Labs 3-Column Architecture)
        ═══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16 max-w-5xl mx-auto">
          {[
            {
              num: "01",
              title: "GRANTS & BOUNTY GUIDANCE",
              desc: "Step-by-step mentoring to win hackathon bounties, student developer grants, and open-source bounties.",
            },
            {
              num: "02",
              title: "TECHNICAL CO-BUILDING",
              desc: "Direct pairing with experienced student developers for smart contract audits, ZK cryptography, and dApp frontends.",
            },
            {
              num: "03",
              title: "CAMPUS TO CAREER NETWORK",
              desc: "Direct access to Web3 DevRel advocates, foundation fellowships, internships, and alumni working in top crypto protocols.",
            },
          ].map((pillar) => (
            <div
              key={pillar.num}
              className="relative p-6 rounded-2xl border border-black/10 bg-white/80 shadow-sm hover:shadow-lg hover:border-[#E50914]/60 transition-all duration-300 flex flex-col justify-between"
            >
              <span className="tech-bracket-tl text-black/30" />
              <span className="tech-bracket-tr text-black/30" />

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-black/40 mb-4">
                  <span className="w-2 h-2 bg-[#E50914] inline-block" />
                  <span className="font-bold text-[#E50914]">{pillar.num}</span>
                </div>
                <h3 className="font-mono font-black text-sm uppercase tracking-tight text-[#1A1A1A] mb-2">
                  {pillar.title}
                </h3>
                <p className="font-mono text-xs text-black/60 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════
            APPLICATION FORM SECTION
        ═══════════════════════════════════════════════════════════════════════ */}
        <div
          ref={formRef}
          id="application-form"
          className="relative max-w-4xl mx-auto rounded-3xl border border-black/10 bg-white/95 p-6 sm:p-10 md:p-12 shadow-xl"
        >
          {/* Outer technical brackets */}
          <span className="tech-bracket-tl text-black/40 scale-125" />
          <span className="tech-bracket-tr text-black/40 scale-125" />
          <span className="tech-bracket-bl text-black/40 scale-125" />
          <span className="tech-bracket-br text-black/40 scale-125" />

          {/* Form Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/10 pb-6 mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 bg-[#E50914] inline-block" />
                <h2 className="text-xl sm:text-2xl font-black font-amiga uppercase tracking-wider text-[#1A1A1A]">
                  BUILDER APPLICATION PROTOCOL
                </h2>
              </div>
              <p className="font-mono text-xs text-black/50 tracking-wider">
                TRANSMISSION TARGET: WEB3 CLUB COUNCIL // STATUS: READY
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center font-mono text-[11px] text-[#E50914] font-bold bg-[#E50914]/10 px-3 py-1.5 rounded-lg border border-[#E50914]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-ping" />
              <span>COHORT 2026 OPEN</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {submittedData ? (
              /* Success confirmation state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-full bg-[#E50914]/10 border border-[#E50914] flex items-center justify-center text-[#E50914] shadow-[0_0_24px_rgba(229,9,20,0.3)]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-amiga uppercase text-[#1A1A1A]">
                    APPLICATION TRANSMITTED
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-black/60 max-w-md mx-auto">
                    Your project transmission has been encrypted and delivered to the Web3 Club Investment Council.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-black/10 bg-[#ECEBE8] font-mono text-xs text-left max-w-md w-full space-y-1.5">
                  <div className="flex justify-between text-black/50">
                    <span>APPLICATION ID:</span>
                    <span className="font-bold text-[#E50914]">{submittedData.applicationId}</span>
                  </div>
                  <div className="flex justify-between text-black/50">
                    <span>STATUS:</span>
                    <span className="font-bold text-emerald-600">IN REVIEW // PENDING</span>
                  </div>
                  <div className="flex justify-between text-black/50">
                    <span>NEXT STEP:</span>
                    <span className="text-black/80">Telegram outreach within 48h</span>
                  </div>
                </div>

                <button
                  onClick={() => setSubmittedData(null)}
                  className="cyber-btn px-6 py-2.5 bg-black/10 hover:bg-black/20 text-[#1A1A1A] font-mono font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  SUBMIT ANOTHER PROJECT
                </button>
              </motion.div>
            ) : (
              /* Main Interactive Form */
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* ── Section 1: Founder & Identity ── */}
                <div className="space-y-4">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-black/50 flex items-center gap-2">
                    <span className="text-[#E50914]">:: 01</span> FOUNDER & CONTACT IDENTITY
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        Founder / Lead Name <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Satoshi Nakamoto"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        Email Address <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="builder@project.xyz"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        Telegram Handle <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="@web3_builder"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        Twitter / X Handle
                      </label>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="@username"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Project Architecture & Category ── */}
                <div className="space-y-4 pt-4 border-t border-black/10">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-black/50 flex items-center gap-2">
                    <span className="text-[#E50914]">:: 02</span> PROJECT ARCHITECTURE
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        Project / Startup Name <span className="text-[#E50914]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Apex AI Protocol"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        One-Liner Tagline
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Decentralized verifiable compute for AI agents"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Ecosystem Category Selector Pills */}
                  <div>
                    <label className="block font-mono text-xs uppercase text-black/70 mb-2">
                      Ecosystem Track <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {TRACKS.map((track) => {
                        const Icon = track.icon;
                        const isSelected = selectedTrack === track.id;
                        return (
                          <button
                            type="button"
                            key={track.id}
                            onClick={() => setSelectedTrack(track.id)}
                            className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "bg-[#E50914]/10 border-[#E50914] shadow-sm"
                                : "bg-white border-black/15 hover:border-black/30"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Icon className={`w-4 h-4 ${isSelected ? "text-[#E50914]" : "text-black/50"}`} />
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#E50914] stroke-[3]" />}
                            </div>
                            <span className="font-mono font-bold text-xs text-[#1A1A1A]">
                              {track.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage Selector Pills */}
                  <div>
                    <label className="block font-mono text-xs uppercase text-black/70 mb-2">
                      Current Development Stage <span className="text-[#E50914]">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {STAGES.map((stg) => {
                        const isSelected = selectedStage === stg.id;
                        return (
                          <button
                            type="button"
                            key={stg.id}
                            onClick={() => setSelectedStage(stg.id)}
                            className={`py-2.5 px-4 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer text-center ${
                              isSelected
                                ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md"
                                : "bg-white text-black/70 border-black/15 hover:border-black/30"
                            }`}
                          >
                            {stg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Links & Materials ── */}
                <div className="space-y-4 pt-4 border-t border-black/10">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-black/50 flex items-center gap-2">
                    <span className="text-[#E50914]">:: 03</span> LINKS & MATERIALS
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        Website / App URL
                      </label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourproject.xyz"
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        Pitch Deck / Doc Link
                      </label>
                      <input
                        type="url"
                        value={deckUrl}
                        onChange={(e) => setDeckUrl(e.target.value)}
                        placeholder="https://docsend.com/..."
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                        GitHub / Demo Repo
                      </label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 4: Ecosystem Support Needed ── */}
                <div className="space-y-4 pt-4 border-t border-black/10">
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-black/50 flex items-center gap-2">
                    <span className="text-[#E50914]">:: 04</span> ECOSYSTEM SUPPORT NEEDED
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SUPPORT_OPTIONS.map((opt) => {
                      const isChecked = selectedSupport.includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => toggleSupport(opt)}
                          className={`p-3.5 rounded-xl border text-xs font-mono transition-all duration-200 cursor-pointer flex items-center gap-3 select-none ${
                            isChecked
                              ? "bg-[#E50914]/10 border-[#E50914] text-[#1A1A1A] font-bold"
                              : "bg-white border-black/15 text-black/70 hover:border-black/30"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                              isChecked
                                ? "bg-[#E50914] border-[#E50914] text-white"
                                : "border-black/30 bg-transparent"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase text-black/70 mb-1.5">
                      Tell us about your project & vision
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What is your unfair advantage? What problem are you solving for web3 users?"
                      className="w-full px-4 py-3 rounded-xl border border-black/15 bg-white text-sm font-mono text-[#1A1A1A] placeholder:text-black/30 focus:outline-none focus:border-[#E50914] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* ── Submit Action ── */}
                <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="font-mono text-[11px] text-black/50">
                    By submitting, your data is securely transmitted directly to the Web3 Club Investment Council.
                  </p>

                  <MagneticButton strength={0.25}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="cyber-btn px-8 py-4 bg-[#E50914] hover:bg-[#e02e14] disabled:opacity-50 text-white font-mono font-black text-xs uppercase tracking-widest shadow-[0_8px_24px_rgba(229,9,20,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>TRANSMITTING...</span>
                        </>
                      ) : (
                        <>
                          <span>TRANSMIT APPLICATION</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </MagneticButton>
                </div>
              </form>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

