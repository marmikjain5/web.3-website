import type { Metadata } from "next";
import JoinUsClient from "./JoinUsClient";
import { getPublicSubmissionPortalSettings } from "@/app/actions/submissions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submissions Portal | WEB.3 BMSIT&M",
  description:
    "Official dynamic submission portal for project proposals, builder squads, campus events, and hackathons at WEB.3 BMSIT&M.",
};

export default async function JoinPage() {
  const result = await getPublicSubmissionPortalSettings();
  return <JoinUsClient initialSettings={result.data} />;
}
