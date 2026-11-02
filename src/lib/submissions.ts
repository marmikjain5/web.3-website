export type SubmissionCategory =
  | "project_proposal"
  | "join_project"
  | "events"
  | "hackathons";

export interface SubmissionCategoryMeta {
  id: SubmissionCategory;
  name: string;
  tagline: string;
}

export const SUBMISSION_CATEGORIES: readonly SubmissionCategoryMeta[] = [
  {
    id: "project_proposal",
    name: "Project Proposals",
    tagline: "Submit student-built web3 ideas, technical architectures & ecosystem projects",
  },
  {
    id: "join_project",
    name: "Join a Project",
    tagline: "Match with active student builder teams and contribute to production decentralized apps",
  },
  {
    id: "events",
    name: "Campus Events",
    tagline: "Register for hands-on developer workshops, technical meetups and bootcamps",
  },
  {
    id: "hackathons",
    name: "Hackathon Track",
    tagline: "Represent WEB.3 BMSIT in national & global hackathons with mentors and sponsorships",
  },
] as const;

export interface CategorySettingsRow {
  category: SubmissionCategory;
  google_form_url: string | null;
  is_open: boolean;
  left_heading: string;
  checklist_label_1: string;
  checklist_label_2: string;
  checklist_label_3: string;
  checklist_label_4: string;
  right_heading: string;
  right_subtitle: string;
  card1_heading: string;
  card1_desc: string;
  card2_heading: string;
  card2_desc: string;
  closing_text: string;
  cta_label: string;
  join_heading: string;
  join_subtitle: string;
  updated_at?: string;
  updated_by?: string | null;
}

export interface PublicSubmissionPortalSettings {
  active_category: SubmissionCategory;
  google_form_url: string | null;
  is_open: boolean;
  left_heading: string;
  checklist_label_1: string;
  checklist_label_2: string;
  checklist_label_3: string;
  checklist_label_4: string;
  right_heading: string;
  right_subtitle: string;
  card1_heading: string;
  card1_desc: string;
  card2_heading: string;
  card2_desc: string;
  closing_text: string;
  cta_label: string;
  join_heading: string;
  join_subtitle: string;
}

export const DEFAULT_CATEGORY_SETTINGS: Record<SubmissionCategory, CategorySettingsRow> = {
  project_proposal: {
    category: "project_proposal",
    google_form_url: null,
    is_open: true,
    left_heading: "PROJECT PROPOSALS",
    checklist_label_1: "TECHNICAL ARCHITECTURE",
    checklist_label_2: "CODEBASE REVIEW",
    checklist_label_3: "PEER COLLABORATION",
    checklist_label_4: "CAMPUS DEMO",
    right_heading: "STUDENT BUILDER TRACK",
    right_subtitle: "Peer feedback, technical reviews & campus demos for student projects",
    card1_heading: "TECHNICAL ARCHITECTURE",
    card1_desc: "Get feedback on smart contracts, system design, and decentralized applications from fellow student builders.",
    card2_heading: "PEER COLLABORATION",
    card2_desc: "Connect with student developers, testers, and co-builders across the BMSIT&M campus community.",
    closing_text: "Submissions for student project proposals are currently paused. Follow our socials for the next cycle announcement.",
    cta_label: "SUBMIT PROJECT PROPOSAL",
    join_heading: "STUDENT PROJECT PROPOSALS",
    join_subtitle: "Submit student-built Web3 projects for technical reviews, peer feedback, and community collaboration.",
  },
  join_project: {
    category: "join_project",
    google_form_url: null,
    is_open: true,
    left_heading: "JOIN A PROJECT TEAM",
    checklist_label_1: "OPEN ROLES",
    checklist_label_2: "TEAM MATCHING",
    checklist_label_3: "PEER REVIEWS",
    checklist_label_4: "BUILD IN PUBLIC",
    right_heading: "CONTRIBUTOR SQUAD",
    right_subtitle: "Join active student builder teams and ship production web3 projects",
    card1_heading: "CONTRIBUTOR PATHWAYS",
    card1_desc: "Find open developer, designer, and researcher roles across student projects",
    card2_heading: "ACTIVE SHIP CULTURE",
    card2_desc: "Collaborate, push commits, and build portfolio-grade decentralized apps",
    closing_text: "Apply to join active student project teams building across Web3 ecosystems.",
    cta_label: "APPLY FOR OPEN ROLES",
    join_heading: "BUILDER SQUAD APPLICATIONS",
    join_subtitle: "Match with ongoing student projects and collaborate with peer builders",
  },
  events: {
    category: "events",
    google_form_url: null,
    is_open: true,
    left_heading: "CAMPUS WORKSHOPS & TALKS",
    checklist_label_1: "HANDS-ON BOOTCAMPS",
    checklist_label_2: "GUEST SESSIONS",
    checklist_label_3: "DEV WORKSHOPS",
    checklist_label_4: "CERTIFICATIONS",
    right_heading: "COMMUNITY SESSIONS",
    right_subtitle: "Hands-on technical workshops, guest lectures, and student developer meetups",
    card1_heading: "TECHNICAL BOOTCAMPS",
    card1_desc: "Deep-dives into smart contracts, zero-knowledge proofs, and web3 architecture",
    card2_heading: "INDUSTRY SPEAKER TALKS",
    card2_desc: "Interact with founders, protocols engineers, and ecosystem leaders",
    closing_text: "Register for upcoming developer workshops, technical meetups, and campus seminars.",
    cta_label: "REGISTER FOR EVENT",
    join_heading: "CAMPUS EVENT REGISTRATIONS",
    join_subtitle: "Sign up for hands-on technical sessions and community developer workshops",
  },
  hackathons: {
    category: "hackathons",
    google_form_url: null,
    is_open: true,
    left_heading: "HACKATHON DEPLOYMENTS",
    checklist_label_1: "GLOBAL SPRINT",
    checklist_label_2: "BOUNTY TRACKS",
    checklist_label_3: "MENTOR SUPPORT",
    checklist_label_4: "WINNER SHOWCASE",
    right_heading: "HACKATHON CENTRAL",
    right_subtitle: "Represent WEB.3 BMSIT in premier national & global Web3 hackathons",
    card1_heading: "TEAM FORMATION",
    card1_desc: "Form balanced builder squads with front-end, smart-contract, and design leads",
    card2_heading: "BOUNTY HUNTING",
    card2_desc: "Target ecosystem prize tracks across Ethereum, Solana, and Layer 2s",
    closing_text: "Submit your hackathon team or project to access mentor feedback and gas sponsorships.",
    cta_label: "ENTER HACKATHON TRACK",
    join_heading: "HACKATHON SQUAD SUBMISSIONS",
    join_subtitle: "Compete in national and international hackathons with official club support",
  },
};

/**
 * Validates a Google Form URL strictly matching the database CHECK constraint regex:
 *   ^https:\/\/(forms\.gle\/[a-zA-Z0-9_-]+|docs\.google\.com\/forms\/d\/(e\/)?[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_#-]+)?)(\?[a-zA-Z0-9_=&%-]*)?$
 */
export function validateGoogleFormUrl(rawUrl: string | null | undefined): {
  valid: boolean;
  cleanUrl: string | null;
  error?: string;
} {
  if (!rawUrl || rawUrl.trim() === "") {
    return { valid: true, cleanUrl: null };
  }

  const trimmed = rawUrl.trim();

  if (trimmed.length > 500) {
    return {
      valid: false,
      cleanUrl: null,
      error: "Google Form URL must not exceed 500 characters.",
    };
  }

  const GOOGLE_FORM_REGEX =
    /^https:\/\/(forms\.gle\/[a-zA-Z0-9_-]+|docs\.google\.com\/forms\/d\/(e\/)?[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_#-]+)?)(\?[a-zA-Z0-9_=&%-]*)?$/i;

  if (!GOOGLE_FORM_REGEX.test(trimmed)) {
    return {
      valid: false,
      cleanUrl: null,
      error:
        "Invalid Google Form URL. Please provide a valid https://forms.gle/... or https://docs.google.com/forms/d/... link.",
    };
  }

  return { valid: true, cleanUrl: trimmed };
}

