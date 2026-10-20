"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, fmtLong, weekNumber, weekStart, weekdayOf } from "@/lib/dates";
import { Button } from "./ui";

export function DateNav({ value, onChange, step = 1, mode = "day" }: { value: string; onChange: (iso: string) => void; step?: number; mode?: "day" | "week" }) {
  // In day mode, step over weekends.
  const move = (dir: 1 | -1) => {
    let d = addDays(value, dir * step);
    while (mode === "day" && !weekdayOf(d)) d = addDays(d, dir);
    onChange(d);
  };
  const label = mode === "week" ? `Week ${weekNumber(value)} · from ${fmtLong(weekStart(value))}` : fmtLong(value);
  return (
    <div className="inline-flex items-center gap-1 rounded-lg bg-white p-1 ring-1 ring-gray-200">
      <Button variant="ghost" size="sm" aria-label="Previous" onClick={() => move(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[12rem] text-center text-sm font-medium text-gray-800">{label}</span>
      <Button variant="ghost" size="sm" aria-label="Next" onClick={() => move(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
