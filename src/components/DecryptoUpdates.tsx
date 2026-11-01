"use client";

import { useState } from "react";
import "./decrypto-updates.css";

/* ───────────────────────────── DATA ───────────────────────────── */

const TICKER_ITEMS = [
  "DECRYPTO",
  "27th–29th April",
  "What is Web3",
  "Wallets & MetaMask",
  "Smart Contracts",
  "Solidity Basics",
  "Deploy Your Own Contract",
  "More Updates Coming Soon",
];

const LEARN_CARDS = [
  {
    title: "Web3 Basics",
    sub: "Blockchain, Ethereum & how Web3 works",
    accent: true,
  },
  {
    title: "Wallets",
    sub: "MetaMask setup & crypto wallet fundamentals",
    accent: false,
  },
  {
    title: "Smart Contracts",
    sub: "Write & deploy contracts on Ethereum",
    accent: false,
  },
  {
    title: "Solidity",
    sub: "Basics of Solidity using Remix IDE",
    accent: false,
  },
  {
    title: "DApp Dev",
    sub: "Frontend-blockchain connection via Web3.js",
    accent: false,
  },
  {
    title: "Build & Ship",
    sub: "Deploy a real Mini DApp end-to-end",
    accent: false,
  },
];

interface TimeSlot {
  time: string;
  title: string;
  highlight?: boolean;
  isBreak?: boolean;
  subs?: string[];
}

interface DayData {
  label: string;
  heading: string;
  date: string;
  venue: string;
  slots: TimeSlot[];
}

const DAYS: DayData[] = [
  {
    label: "Day 1",
    heading: "Introduction & Fundamentals",
    date: "27 April 2026",
    venue: "APJ Abdul Kalam Lab, Lab Block, 4th Floor",
    slots: [
      { time: "08:30–09:00", title: "Check-in" },
      {
        time: "09:00–10:20",
        title: "Inauguration & Welcome Speeches",
        highlight: true,
      },
      {
        time: "10:20–10:40",
        title: "Tea Break & Networking",
        isBreak: true,
      },
      {
        time: "10:40–12:30",
        title: "Session 1: Web3 Core Concepts",
        highlight: true,
        subs: [
          "Web2 vs. Web3",
          "Blockchain Basics",
          "Ethereum, Wallets & MetaMask",
        ],
      },
      { time: "12:30–13:30", title: "Lunch Break", isBreak: true },
      {
        time: "13:30–15:30",
        title: "Session 2: Smart Contracts & Solidity",
        highlight: true,
        subs: [
          "Intro to Solidity & Structure",
          "Using Remix IDE",
          "Deploying your first contract",
        ],
      },
      { time: "15:30–16:00", title: "Q&A and Wrap-up" },
    ],
  },
  {
    label: "Day 2",
    heading: "Hands-on Development",
    date: "28 April 2026",
    venue: "APJ Abdul Kalam Lab, Lab Block, 4th Floor",
    slots: [
      { time: "08:30–09:00", title: "Check-in" },
      { time: "09:00–09:20", title: "Day 2 Briefing & Recap" },
      {
        time: "09:20–10:20",
        title: "Session 1: Solidity Workshop",
        highlight: true,
        subs: ["Hands-on Solidity basics"],
      },
      { time: "10:20–10:40", title: "Tea Break", isBreak: true },
      {
        time: "10:40–12:30",
        title: "Session 2: DApp Architecture",
        highlight: true,
        subs: [
          "Deploying Smart Contracts",
          "Frontend-Blockchain connection",
          "Introduction to Web3.js",
        ],
      },
      { time: "12:30–13:30", title: "Lunch Break", isBreak: true },
      {
        time: "13:30–15:30",
        title: "Session 3: Demo Day",
        highlight: true,
        subs: ["End-to-end Mini DApp deployment demo"],
      },
      { time: "15:30–16:00", title: "Q&A and Day 3 Instructions" },
    ],
  },
  {
    label: "Day 3",
    heading: "Project & Presentations",
    date: "29 April 2026",
    venue: "APJ Abdul Kalam Lab, Lab Block, 4th Floor",
    slots: [
      { time: "08:30–09:00", title: "Check-in" },
      {
        time: "09:00–10:20",
        title: "Ideation & Project Starter Kit",
        highlight: true,
      },
      { time: "10:20–10:40", title: "Tea Break", isBreak: true },
      {
        time: "10:40–12:30",
        title: "Build Phase (Part 1)",
        highlight: true,
        subs: ["Mini Project — Group or Individual"],
      },
      { time: "12:30–13:30", title: "Lunch Break", isBreak: true },
      {
        time: "13:30–14:00",
        title: "Build Phase (Part 2)",
        highlight: true,
        subs: ["Finalize project work"],
      },
      {
        time: "14:00–15:30",
        title: "Final Project Presentation",
        highlight: true,
      },
      {
        time: "15:30–16:10",
        title: "Winners Announcement, Swag & Wrap-up",
        highlight: true,
      },
    ],
  },
];

/* ───────────────────────────── TICKER ───────────────────────────── */

function Ticker({ reverse = false }: { reverse?: boolean }) {
  const row = TICKER_ITEMS.map((item, i) => (
    <span key={i} className="decrypto-ticker-item">
      {item}
      <span className="decrypto-ticker-dot" />
    </span>
  ));

  return (
    <div className="decrypto-ticker-strip">
      <div
        className="decrypto-ticker-track"
        style={{
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

/* ───────────────────────────── COMPONENT ───────────────────────────── */

export default function DecryptoUpdates() {
  const [activeDay, setActiveDay] = useState(0);
  const day = DAYS[activeDay];

  return (
    <section id="decrypto-updates" className="decrypto-root">
      {/* ── TOP TICKER ── */}
      <Ticker />

      {/* ── MAIN BODY ── */}
      <div className="decrypto-grid">
        {/* LEFT COLUMN */}
        <div className="decrypto-left">
          <h1 className="decrypto-heading">
            <span className="decrypto-heading-white">DECRYPTO</span>
            <br />
            <span className="decrypto-heading-accent">UPDATES</span>
          </h1>

          <p className="decrypto-subtext">
            Real-time logistics &amp; participant guide.
            <br />
            Everything you need for DECRYPTO — 27th to 29th April.
          </p>

          <span className="decrypto-date-badge">27TH – 29TH APRIL 2026</span>

          <div className="decrypto-venue-row">
            <span className="decrypto-blink-dot" />
            <span className="decrypto-venue-text">
              VENUE WILL BE UPDATED SOON
            </span>
          </div>

          <p className="decrypto-learn-label">YOU WILL LEARN</p>

          <div className="decrypto-cards-grid">
            {LEARN_CARDS.map((c) => (
              <div
                key={c.title}
                className={`decrypto-card${c.accent ? " decrypto-card--accent" : ""}`}
              >
                <p
                  className="decrypto-card-title"
                  style={c.accent ? { color: "#FF5500" } : undefined}
                >
                  {c.title}
                </p>
                <p className="decrypto-card-sub">{c.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="decrypto-right">
          {/* Day Tabs */}
          <div className="decrypto-tabs">
            {DAYS.map((d, i) => (
              <button
                key={d.label}
                onClick={() => setActiveDay(i)}
                className={`decrypto-tab${activeDay === i ? " decrypto-tab--active" : ""}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Day Panel */}
          <div className="decrypto-panel">
            <div className="decrypto-panel-header">
              <p className="decrypto-panel-title">{day.heading}</p>
              <p className="decrypto-panel-date">{day.date}</p>
              <p className="decrypto-panel-venue">{day.venue}</p>
            </div>

            {/* Timeline */}
            <div className="decrypto-timeline">
              {day.slots.map((slot, i) => (
                <div key={i} className="decrypto-slot">
                  <span
                    className={`decrypto-slot-dot${slot.highlight ? " decrypto-slot-dot--hl" : ""}`}
                  />
                  <span className="decrypto-slot-time">{slot.time}</span>
                  <div className="decrypto-slot-content">
                    <p
                      className="decrypto-slot-title"
                      style={
                        slot.isBreak
                          ? { color: "#555", fontStyle: "italic" }
                          : undefined
                      }
                    >
                      {slot.title}
                    </p>
                    {slot.subs?.map((s, j) => (
                      <p key={j} className="decrypto-slot-sub">
                        <span style={{ color: "#FF5500" }}>— </span>
                        {s}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TICKER ── */}
      <Ticker reverse />
    </section>
  );
}
