"use client";

import { useEffect, useState, type ReactNode } from "react";

// Demo data lives in localStorage, so render only in the browser to avoid hydration mismatches.
export function Hydrated({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-gra-500">Loading demo…</div>;
  }
  return <>{children}</>;
}
