/**
 * Projects & Technology Showcase Types and Utilities
 * Supports both Technology Exploration entries and actual Student Projects.
 */

export type EntryType = "exploration" | "project";
export type ProjectStatus = "published" | "draft" | "archived";

export interface ProjectContributor {
  name: string;
  role?: string;
  github?: string;
  avatar_url?: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  slug: string | null;
  category: string;
  entry_type: EntryType;
  description: string;
  icon_name: string | null;
  symbol: string | null;
  image_url: string | null;
  banner_url: string | null;
  tags: string[];
  status: ProjectStatus;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  github_url: string | null;
  demo_url: string | null;
  docs_url: string | null;
  contributors: ProjectContributor[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProjectsSettingsRow {
  id: string;
  heading: string;
  subtitle: string;
  empty_heading: string;
  empty_description: string;
  empty_status: string;
  cta_text: string | null;
  cta_url: string | null;
  show_cta: boolean;
  updated_at: string;
}

export interface ProjectFormData {
  title: string;
  slug?: string;
  category: string;
  entry_type: EntryType;
  description: string;
  icon_name?: string;
  symbol?: string;
  tags: string[];
  status: ProjectStatus;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  github_url?: string;
  demo_url?: string;
  docs_url?: string;
  contributors?: ProjectContributor[];
}

export const CYBER_SYMBOLS = ["◆", "◎", "❖", "▲", "⬡", "■", "⚡", "✦", "◈", "◇"] as const;

export const AVAILABLE_ICONS = [
  "Blocks",
  "BrainCircuit",
  "Code2",
  "Shield",
  "Trophy",
  "GitBranch",
  "Layers",
  "Cpu",
  "Globe",
  "Database",
  "Terminal",
  "Rocket",
  "Sparkles",
  "Smartphone",
  "Network",
  "Server",
] as const;

export const DEFAULT_PROJECTS_SETTINGS: ProjectsSettingsRow = {
  id: "default",
  heading: "OUR PROJECTS",
  subtitle: "EXPLORE. EXPERIMENT. CREATE.",
  empty_heading: "THE NEXT BIG IDEA STARTS HERE.",
  empty_description:
    "We're creating a space for ideas, experiments and projects built by the WEB.3 community. Check back as our builders bring their ideas to life.",
  empty_status: "AWAITING FIRST BUILD",
  cta_text: "JOIN THE BUILDER SQUAD",
  cta_url: "/join",
  show_cta: true,
  updated_at: new Date().toISOString(),
};

/**
 * Initial 6 Technology Exploration Entries.
 * Used as reliable initial seed and type-safe reference.
 */
export const INITIAL_EXPLORATION_ENTRIES: Omit<ProjectRow, "id" | "created_at" | "updated_at">[] = [
  {
    title: "BLOCKCHAIN",
    slug: "blockchain",
    category: "Technology Exploration",
    entry_type: "exploration",
    description: "Explore decentralized systems, smart contracts and on-chain applications.",
    icon_name: "Blocks",
    symbol: "◆",
    image_url: null,
    banner_url: null,
    tags: ["Solidity", "Smart Contracts", "EVM", "DApps"],
    status: "published",
    is_active: true,
    is_featured: true,
    sort_order: 0,
    github_url: null,
    demo_url: null,
    docs_url: null,
    contributors: [],
    metadata: {},
  },
  {
    title: "AI & MACHINE LEARNING",
    slug: "ai-machine-learning",
    category: "Technology Exploration",
    entry_type: "exploration",
    description: "Experiment with intelligent systems, generative AI and machine learning.",
    icon_name: "BrainCircuit",
    symbol: "◎",
    image_url: null,
    banner_url: null,
    tags: ["LLMs", "Machine Learning", "Generative AI", "Computer Vision"],
    status: "published",
    is_active: true,
    is_featured: true,
    sort_order: 1,
    github_url: null,
    demo_url: null,
    docs_url: null,
    contributors: [],
    metadata: {},
  },
  {
    title: "WEB DEVELOPMENT",
    slug: "web-development",
    category: "Technology Exploration",
    entry_type: "exploration",
    description: "Design and develop modern websites, applications and digital experiences.",
    icon_name: "Code2",
    symbol: "❖",
    image_url: null,
    banner_url: null,
    tags: ["Next.js", "TypeScript", "React", "Full Stack"],
    status: "published",
    is_active: true,
    is_featured: false,
    sort_order: 2,
    github_url: null,
    demo_url: null,
    docs_url: null,
    contributors: [],
    metadata: {},
  },
  {
    title: "CYBERSECURITY",
    slug: "cybersecurity",
    category: "Technology Exploration",
    entry_type: "exploration",
    description: "Discover application security, ethical hacking and digital protection.",
    icon_name: "Shield",
    symbol: "▲",
    image_url: null,
    banner_url: null,
    tags: ["Application Security", "Cryptography", "Ethical Hacking", "Security Auditing"],
    status: "published",
    is_active: true,
    is_featured: false,
    sort_order: 3,
    github_url: null,
    demo_url: null,
    docs_url: null,
    contributors: [],
    metadata: {},
  },
  {
    title: "HACKATHONS",
    slug: "hackathons",
    category: "Technology Exploration",
    entry_type: "exploration",
    description: "Collaborate, solve problems and turn ideas into working prototypes.",
    icon_name: "Trophy",
    symbol: "⬡",
    image_url: null,
    banner_url: null,
    tags: ["Rapid Prototyping", "Ideation", "Team Collaboration", "Innovation"],
    status: "published",
    is_active: true,
    is_featured: false,
    sort_order: 4,
    github_url: null,
    demo_url: null,
    docs_url: null,
    contributors: [],
    metadata: {},
  },
  {
    title: "OPEN SOURCE",
    slug: "open-source",
    category: "Technology Exploration",
    entry_type: "exploration",
    description: "Learn collaborative development and contribute to real-world codebases.",
    icon_name: "GitBranch",
    symbol: "■",
    image_url: null,
    banner_url: null,
    tags: ["Git", "GitHub", "Collaboration", "Community"],
    status: "published",
    is_active: true,
    is_featured: false,
    sort_order: 5,
    github_url: null,
    demo_url: null,
    docs_url: null,
    contributors: [],
    metadata: {},
  },
];

/**
 * Validates external and internal URLs safely to prevent javascript: or malformed links.
 */
export function isValidProjectUrl(url: string | null | undefined): boolean {
  if (!url || url.trim() === "") return true;
  const trimmed = url.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Generates an URL-safe slug from a project title.
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

