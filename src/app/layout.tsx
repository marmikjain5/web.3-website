import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/chaingpt/CookieBanner";
import LenisProvider from "@/components/LenisProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const architypeFont = localFont({
  src: "../../public/fonts/CraftFont.ttf",
  variable: "--font-logo",
  display: "swap",
});

import { ThemeProvider } from "@/components/ThemeProvider";
import PreloaderWrapper from "@/components/PreloaderWrapper";
import Navbar from "@/app/components/navbar";
import GlobalLogo from "@/components/GlobalLogo";

export const metadata: Metadata = {
  title: "Web3 Club | Backing Tomorrow's Builders",
  description:
    "Backing the very best web3 builders — transforming visionary ideas into real-world growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${architypeFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
          {/* LenisProvider integrates Lenis smooth scroll + GSAP ScrollTrigger sync */}
          <LenisProvider>
            <GlobalLogo />
            <PreloaderWrapper>
              <Navbar />
              {children}
              <Footer />
              <CookieBanner />
            </PreloaderWrapper>
          </LenisProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
