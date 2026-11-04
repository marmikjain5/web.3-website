"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, Globe, Lock } from "lucide-react";
import SpotlightCard from "@/app/components/ui/SpotlightCard";
import DecryptedText from "@/app/components/ui/DecryptedText";

const benefits = [
  {
    icon: <Shield className="w-8 h-8 text-[#FF5500]" />,
    title: "Hands-On Learning",
    description: "Master smart contract development, zero-knowledge proofs, and decentralized protocols through workshops and peer mentorship.",
  },
  {
    icon: <Zap className="w-8 h-8 text-[#FF5500]" />,
    title: "Project Incubation",
    description: "Build production dApps, compete in premier hackathons (ETHIndia, Solana Renaissance), and secure student developer grants.",
  },
  {
    icon: <Users className="w-8 h-8 text-[#FF5500]" />,
    title: "Student Community",
    description: "Join 500+ active student engineers, researchers, and creators at BMSIT&M shaping the future of decentralized technology.",
  },
];

const infoBlocks = [
  {
    icon: <Globe className="w-8 h-8 text-[#FF5500]" />,
    title: "What is Web3?",
    content: (
      <>
        Web3 is the next evolution of the internet—a{" "}
        <span className="text-[#FF5500] font-semibold">
          decentralized, user-centric
        </span>{" "}
        web built on{" "}
        <span className="text-[#FF5500] font-semibold">
          cryptographic primitives and distributed ledgers
        </span>
        . Unlike the legacy web where centralized corporations own your identity and data, Web3 empowers individuals with{" "}
        <span className="text-[#FF5500] font-semibold">true digital sovereignty</span>
        , composable open finance, and trustless infrastructure.
      </>
    ),
  },
  {
    icon: <Lock className="w-8 h-8 text-[#FF5500]" />,
    title: "The Future Impact",
    content: (
      <>
        By removing centralized single points of failure, Web3 is laying the foundation for{" "}
        <span className="text-[#FF5500] font-semibold">
          autonomous agent economies
        </span>
        , transparent algorithmic governance, and{" "}
        <span className="text-[#FF5500] font-semibold">
          censorship-resistant networks
        </span>
        . It redistributes economic incentives directly to builders, creators, and community operators.
      </>
    ),
  },
];

export default function AboutSection() {
  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden lab-grid-bg">
      {/* Background Radial Highlights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#FF5500]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FF5500]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="border-b border-border pb-6 mb-12 sm:mb-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-[#FF5500] shadow-[0_0_8px_#FF5500]" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/60">
              MISSION_MANIFESTO
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black cyber-font tracking-tight text-foreground">
            ABOUT LABS
          </h1>
        </div>

        {/* Info Blocks Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-24">
          {infoBlocks.map((block, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <SpotlightCard
                className="h-full p-5 sm:p-8 md:p-10 rounded-2xl bg-card border border-border hover:border-[#FF5500]/50 transition-colors shadow-sm relative group"
                spotlightColor="rgba(255, 85, 0, 0.12)"
              >
                <span className="tech-bracket-tl text-[#FF5500]" />
                <span className="tech-bracket-tr text-[#FF5500]" />
                <span className="tech-bracket-bl text-[#FF5500]" />
                <span className="tech-bracket-br text-[#FF5500]" />

                <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-[#FF5500]/10 w-fit rounded-xl border border-[#FF5500]/30 group-hover:scale-105 transition-transform">
                  {block.icon}
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-3 font-mono">
                  <DecryptedText
                    text={block.title}
                    speed={40}
                    encryptedClassName="text-[#FF5500]"
                  />
                </h2>
                <div className="h-1 w-16 bg-[#FF5500] mb-4 sm:mb-6 rounded-full shadow-[0_0_12px_rgba(255,85,0,0.5)]" />
                <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-sans">
                  {block.content}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        {/* Member Benefits Section */}
        <div className="mb-8 sm:mb-12 border-t border-border pt-12 sm:pt-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 bg-foreground" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground/60">
              ECOSYSTEM_ADVANTAGE
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight cyber-font">
            <DecryptedText text="MEMBER BENEFITS" speed={50} maxIterations={12} />
          </h2>
          <div className="h-1 w-20 bg-[#FF5500] mt-3 sm:mt-4 rounded-full shadow-[0_0_10px_rgba(255,85,0,0.5)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -6 }}
              className="h-full"
            >
              <SpotlightCard
                className="h-full p-5 sm:p-8 bg-card rounded-2xl border border-border hover:border-[#FF5500]/50 transition-all duration-300 shadow-sm relative group flex flex-col justify-between"
                spotlightColor="rgba(255, 85, 0, 0.12)"
              >
                <span className="tech-bracket-tl" />
                <span className="tech-bracket-tr" />

                <div>
                  <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 bg-[#FF5500]/10 w-fit rounded-xl border border-[#FF5500]/20 group-hover:scale-105 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold font-mono text-foreground mb-2 sm:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed font-sans">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-border flex items-center justify-between text-[11px] font-mono text-foreground/40">
                  <span>TIER_01</span>
                  <span className="text-[#FF5500] font-bold">VERIFIED</span>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
