"use client";

import { useState, useEffect } from "react";
import Preloader from "./Preloader";

export default function PreloaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);

  // Instant fallback so the user NEVER encounters a black or blank screen
  useEffect(() => {
    // Fast 650ms max timeout
    const t = setTimeout(() => setLoaded(true), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
      <div className="w-full min-h-full">
        {children}
      </div>
    </>
  );
}
