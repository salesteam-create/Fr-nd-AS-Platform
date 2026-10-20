"use client";

import { Clock, FlaskConical, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deadlineFor, fmtDateTime } from "@/lib/dates";
import { firstOpenDate } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";
import { cx } from "./ui";

const HOUR = 3600_000;

/** Floating controls for presenting the demo: move the clock to show deadlines and locking. */
export function DemoBar() {
  const [open, setOpen] = useState(false);
  const now = useNow();
  const offset = useDemo((s) => s.clockOffsetMs);
  const setOffset = useDemo((s) => s.setClockOffset);
  const reset = useDemo((s) => s.resetDemo);
  const hour = useDemo((s) => s.settings.deadlineHour);
  const notify = useDemo((s) => s.notify);

  const shift = (ms: number) => setOffset(offset + ms);
  const jumpToDeadline = () => {
    const target = deadlineFor(firstOpenDate(now, hour), hour).getTime() - 2 * 60_000;
    setOffset(target - Date.now());
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full sm:bottom-4 bg-sort-900 px-4 py-2 text-xs font-medium text-white shadow-card print:hidden"
      >
        <FlaskConical className="h-4 w-4" />
        Demo
        <span className={cx("tabular-nums", offset !== 0 && "text-amber-300")}>{fmtDateTime(now)}</span>
      </button>
    );
  }

  const btn = "rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-medium hover:bg-white/20";
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md rounded-2xl bg-sort-900 p-4 text-white shadow-card sm:right-auto print:hidden">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-medium">
          <FlaskConical className="h-4 w-4" /> Demo controls
        </p>
        <button onClick={() => setOpen(false)} aria-label="Close demo controls" className="rounded p-1 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-gra-300">
        <Clock className="h-3.5 w-3.5" /> Demo clock
        {offset !== 0 && <span className="rounded bg-amber-400/20 px-1.5 text-amber-300">shifted</span>}
      </p>
      <p className="text-lg font-medium tabular-nums">{fmtDateTime(now)}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button className={btn} onClick={() => shift(-HOUR)}>−1 h</button>
        <button className={btn} onClick={() => shift(HOUR)}>+1 h</button>
        <button className={btn} onClick={() => shift(24 * HOUR)}>+1 day</button>
        <button className={btn} onClick={jumpToDeadline}>2 min before next deadline</button>
        <button className={btn} onClick={() => shift(5 * 60_000)}>+5 min</button>
        <button className={btn} onClick={() => setOffset(0)}>Real time</button>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs">
        <Link href="/portal" className={btn}>Customer portal</Link>
        <Link href="/admin" className={btn}>Frænd admin</Link>
        <button
          className={cx(btn, "ml-auto flex items-center gap-1 text-red-300")}
          onClick={() => {
            if (confirm("Reset all demo data to the starting state?")) {
              reset();
              notify({ kind: "info", title: "Demo data reset" });
            }
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset data
        </button>
      </div>
    </div>
  );
}
