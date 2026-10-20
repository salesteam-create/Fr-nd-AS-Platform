"use client";

import { useEffect } from "react";
import { useDemo } from "@/lib/store";
import { cx } from "./ui";

/** EN / NO switch. The choice is remembered; ?lang=no in the URL opens the demo in Norwegian. */
export function LangToggle({ dark }: { dark?: boolean }) {
  const lang = useDemo((s) => s.lang);
  const setLang = useDemo((s) => s.setLang);
  return (
    <div className={cx("inline-flex text-[11px] font-medium uppercase tracking-caps ring-1", dark ? "ring-gra-500" : "ring-sort-900")} role="group" aria-label="Language">
      {(["en", "no"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cx(
            "px-2 py-1",
            lang === l ? (dark ? "bg-rosa-500 text-sort-900" : "bg-sort-900 text-white") : dark ? "text-gra-300 hover:text-white" : "text-sort-900 hover:bg-gra-100",
          )}
        >
          {l === "en" ? "EN" : "NO"}
        </button>
      ))}
    </div>
  );
}

export function LangFromUrl() {
  const setLang = useDemo((s) => s.setLang);
  useEffect(() => {
    const l = new URLSearchParams(window.location.search).get("lang");
    if (l === "no" || l === "en") setLang(l);
  }, [setLang]);
  return null;
}
