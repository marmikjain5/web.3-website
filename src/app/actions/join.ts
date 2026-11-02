"use server";

export interface JoinApplicationData {
  fullName: string;
  email: string;
  telegram: string;
  twitter?: string;
  projectName: string;
  tagline: string;
  category: string;
  stage: string;
  website?: string;
  deckUrl?: string;
  githubUrl?: string;
  supportNeeded: string[];
  description: string;
}

/**
 * Legacy application endpoint — permanently retired.
 * Direct application submissions into the registrations table have been replaced
 * by the official Google Forms submission portal.
 * This server action does not query or mutate the registrations table.
 */
export async function submitJoinApplication(_data: JoinApplicationData) {
  void _data;
  return {
    success: false,
    error:
      "Direct residency submissions via this form have been retired. Please use the official Google Form on our submission portal.",
  };
}
