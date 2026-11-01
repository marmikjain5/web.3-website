import type { Metadata } from "next";
import JoinUsClient from "./JoinUsClient";

export const metadata: Metadata = {
  title: "Join Us | Web3 Club Incubation & Residency",
  description:
    "Unlock exponential growth. For builders, dreamers and pioneers shaping the next era of Web3.",
};

export default function JoinPage() {
  return <JoinUsClient />;
}

