"use client";

import { useEffect, useState } from "react";

/** Reads ?date=YYYY-MM-DD once on mount (avoids a Suspense boundary for useSearchParams). */
export function useDateParam(fallback: string): [string, (d: string) => void] {
  const [date, setDate] = useState(fallback);
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("date");
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) setDate(d);
  }, []);
  return [date, setDate];
}
