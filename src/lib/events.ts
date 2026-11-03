// ─────────────────────────────────────────────────────────────
// WEB.3 Events System — Types, Interfaces & Defaults
// ─────────────────────────────────────────────────────────────

export type EventRegistrationStatus = "open" | "soon" | "closed";
export type EventPublicationStatus = "published" | "draft";
export type EventClassification = "upcoming" | "archived";

export interface LearningCard {
  title: string;
  sub: string;
  accent?: boolean;
}

export interface EventResource {
  title: string;
  url: string;
  type?: "website" | "github" | "docs" | "video" | "other";
}

export interface EventSessionRow {
  id?: string;
  day_id?: string;
  time_slot: string;
  title: string;
  description?: string;
  is_highlight?: boolean;
  is_break?: boolean;
  sub_topics?: string[];
  sort_order?: number;
}

export interface EventDayRow {
  id?: string;
  event_id?: string;
  day_number: number;
  label: string;
  heading: string;
  event_date: string;
  venue?: string;
  sort_order?: number;
  slots: EventSessionRow[];
}

export interface EventGalleryRow {
  id?: string;
  event_id?: string;
  image_url: string;
  caption?: string;
  sort_order?: number;
}

export interface EventSpeakerRow {
  id?: string;
  event_id?: string;
  name: string;
  role?: string;
  company?: string;
  image_url?: string;
  socials?: Record<string, string>;
  sort_order?: number;
}

export interface EventRow {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  date: string;
  start_date: string;
  location: string;
  prize: string;
  tags: string[];
  team_min: number;
  team_max: number;
  description: string;
  short_description?: string;
  detailed_description?: string;
  chain: string | null;
  sponsors: string[];
  status: EventRegistrationStatus;
  publication_status: EventPublicationStatus;
  event_classification: EventClassification;
  event_category?: string;
  image_url: string | null;
  banner_url?: string | null;
  objectives?: string[];
  learning_outcomes?: LearningCard[];
  ticker_items?: string[];
  announcements?: string[];
  resources?: EventResource[];
  is_featured?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface EventDetail extends EventRow {
  days: EventDayRow[];
  gallery: EventGalleryRow[];
  speakers: EventSpeakerRow[];
}

// ─────────────────────────────────────────────────────────────
// Default DECRYPTO Data (Full Fallback & Seed Definition)
// ─────────────────────────────────────────────────────────────

export const DEFAULT_DECRYPTO_TICKER: string[] = [
  "DECRYPTO",
  "27th–29th April",
  "What is Web3",
  "Wallets & MetaMask",
  "Smart Contracts",
  "Solidity Basics",
  "Deploy Your Own Contract",
  "More Updates Coming Soon",
];

export const DEFAULT_DECRYPTO_LEARN_CARDS: LearningCard[] = [
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

export const DEFAULT_DECRYPTO_DAYS: EventDayRow[] = [
  {
    day_number: 1,
    label: "Day 1",
    heading: "Introduction & Fundamentals",
    event_date: "27 April 2026",
    venue: "APJ Abdul Kalam Lab, Lab Block, 4th Floor",
    sort_order: 0,
    slots: [
      { time_slot: "08:30–09:00", title: "Check-in", sort_order: 0 },
      {
        time_slot: "09:00–10:20",
        title: "Inauguration & Welcome Speeches",
        is_highlight: true,
        sort_order: 1,
      },
      {
        time_slot: "10:20–10:40",
        title: "Tea Break & Networking",
        is_break: true,
        sort_order: 2,
      },
      {
        time_slot: "10:40–12:30",
        title: "Session 1: Web3 Core Concepts",
        is_highlight: true,
        sub_topics: [
          "Web2 vs. Web3",
          "Blockchain Basics",
          "Ethereum, Wallets & MetaMask",
        ],
        sort_order: 3,
      },
      {
        time_slot: "12:30–13:30",
        title: "Lunch Break",
        is_break: true,
        sort_order: 4,
      },
      {
        time_slot: "13:30–15:30",
        title: "Session 2: Smart Contracts & Solidity",
        is_highlight: true,
        sub_topics: [
          "Intro to Solidity & Structure",
          "Using Remix IDE",
          "Deploying your first contract",
        ],
        sort_order: 5,
      },
      {
        time_slot: "15:30–16:00",
        title: "Q&A and Wrap-up",
        sort_order: 6,
      },
    ],
  },
  {
    day_number: 2,
    label: "Day 2",
    heading: "Hands-on Development",
    event_date: "28 April 2026",
    venue: "APJ Abdul Kalam Lab, Lab Block, 4th Floor",
    sort_order: 1,
    slots: [
      { time_slot: "08:30–09:00", title: "Check-in", sort_order: 0 },
      { time_slot: "09:00–09:20", title: "Day 2 Briefing & Recap", sort_order: 1 },
      {
        time_slot: "09:20–10:20",
        title: "Session 1: Solidity Workshop",
        is_highlight: true,
        sub_topics: ["Hands-on Solidity basics"],
        sort_order: 2,
      },
      {
        time_slot: "10:20–10:40",
        title: "Tea Break",
        is_break: true,
        sort_order: 3,
      },
      {
        time_slot: "10:40–12:30",
        title: "Session 2: DApp Architecture",
        is_highlight: true,
        sub_topics: [
          "Deploying Smart Contracts",
          "Frontend-Blockchain connection",
          "Introduction to Web3.js",
        ],
        sort_order: 4,
      },
      {
        time_slot: "12:30–13:30",
        title: "Lunch Break",
        is_break: true,
        sort_order: 5,
      },
      {
        time_slot: "13:30–15:30",
        title: "Session 3: Demo Day",
        is_highlight: true,
        sub_topics: ["End-to-end Mini DApp deployment demo"],
        sort_order: 6,
      },
      {
        time_slot: "15:30–16:00",
        title: "Q&A and Day 3 Instructions",
        sort_order: 7,
      },
    ],
  },
  {
    day_number: 3,
    label: "Day 3",
    heading: "Project & Presentations",
    event_date: "29 April 2026",
    venue: "APJ Abdul Kalam Lab, Lab Block, 4th Floor",
    sort_order: 2,
    slots: [
      { time_slot: "08:30–09:00", title: "Check-in", sort_order: 0 },
      {
        time_slot: "09:00–10:20",
        title: "Ideation & Project Starter Kit",
        is_highlight: true,
        sort_order: 1,
      },
      {
        time_slot: "10:20–10:40",
        title: "Tea Break",
        is_break: true,
        sort_order: 2,
      },
      {
        time_slot: "10:40–12:30",
        title: "Build Phase (Part 1)",
        is_highlight: true,
        sub_topics: ["Mini Project — Group or Individual"],
        sort_order: 3,
      },
      {
        time_slot: "12:30–13:30",
        title: "Lunch Break",
        is_break: true,
        sort_order: 4,
      },
      {
        time_slot: "13:30–14:00",
        title: "Build Phase (Part 2)",
        is_highlight: true,
        sub_topics: ["Finalize project work"],
        sort_order: 5,
      },
      {
        time_slot: "14:00–15:30",
        title: "Final Project Presentation",
        is_highlight: true,
        sort_order: 6,
      },
      {
        time_slot: "15:30–16:10",
        title: "Winners Announcement, Swag & Wrap-up",
        is_highlight: true,
        sort_order: 7,
      },
    ],
  },
];

export const DEFAULT_DECRYPTO_EVENT: EventDetail = {
  id: "5842451c-7389-4bec-8e02-d6b1cbffb4ee",
  title: "DECRYPTO",
  subtitle: "2 day bootcamp + 1 day hackathon",
  slug: "decrypto",
  date: "April 27-29, 2026",
  start_date: "2026-04-27T09:00:00+00:00",
  location: "APJ Abdul Kalam Lab, Lab Block, 4th Floor",
  prize: "₹15,000",
  tags: ["Bootcamp", "Hackathon", "WEB3", "Solidity", "Smart Contracts", "dApps"],
  team_min: 3,
  team_max: 4,
  description:
    "Real-time logistics & participant guide. Everything you need for DECRYPTO — 27th to 29th April. Three intense days of hands-on blockchain development, smart contract deployment, and real-world project presentations.",
  short_description: "2 day bootcamp + 1 day hackathon covering Web3 fundamentals, Solidity, and DApp development.",
  detailed_description:
    "DECRYPTO is BMSIT&M's premier Web3 bootcamp and student hackathon. Across three immersive days, builders learn blockchain fundamentals, master smart contract development with Solidity and Remix IDE, connect frontends using Web3.js, and build decentralized applications to compete for prizes.",
  chain: "Ethereum",
  sponsors: ["Alchemy", "Base", "Polygon", "Solana", "Chainlink"],
  status: "closed",
  publication_status: "published",
  event_classification: "archived",
  event_category: "Hackathon",
  image_url:
    "https://mfoszwjuovibjaegtunw.supabase.co/storage/v1/object/public/event-images/1776977179850-ezch7cl2jnc.svg",
  banner_url: null,
  objectives: [
    "Introduce students to decentralized architecture and Web3 fundamentals",
    "Provide hands-on smart contract authoring experience in Solidity",
    "Equip participants to deploy live decentralized applications on testnets",
    "Host a 1-day collaborative hackathon to build working student prototypes",
  ],
  learning_outcomes: DEFAULT_DECRYPTO_LEARN_CARDS,
  ticker_items: DEFAULT_DECRYPTO_TICKER,
  announcements: [
    "DECRYPTO 2026 has concluded! Check out the archive schedule and curriculum below.",
  ],
  resources: [
    { title: "Remix Ethereum IDE", url: "https://remix.ethereum.org", type: "docs" },
    { title: "Solidity Documentation", url: "https://docs.soliditylang.org", type: "docs" },
    { title: "MetaMask Developer Portal", url: "https://metamask.io", type: "website" },
  ],
  is_featured: true,
  sort_order: 0,
  created_at: "2026-04-23T20:46:20.101411+00:00",
  updated_at: "2026-10-31T14:47:50.034+00:00",
  days: DEFAULT_DECRYPTO_DAYS,
  gallery: [],
  speakers: [],
};

export const EVENT_CATEGORIES = [
  "Hackathon",
  "Workshop",
  "Bootcamp",
  "Sprint",
  "Summit",
  "Community",
] as const;

// ─────────────────────────────────────────────────────────────
// Helpers & Validation
// ─────────────────────────────────────────────────────────────

export function slugifyEventTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidEventUrl(url: string | null | undefined): boolean {
  if (!url || !url.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

