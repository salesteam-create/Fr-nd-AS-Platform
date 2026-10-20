"use client";

import { Lock, Timer } from "lucide-react";
import { deadlineFor, fmtCountdown, fmtTime, holidayName, isLocked } from "@/lib/dates";
import { Badge } from "./ui";

const weekdayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short" });

export function DeadlineStatus({ date, now, hour }: { date: string; now: Date; hour: number }) {
  const holiday = holidayName(date);
  if (holiday) return <Badge tone="gray">Closed · {holiday}</Badge>;
  const deadline = deadlineFor(date, hour);
  if (isLocked(date, now, hour)) {
    return (
      <Badge tone="gray">
        <Lock className="h-3 w-3" /> Locked
      </Badge>
    );
  }
  const left = deadline.getTime() - now.getTime();
  const soon = left < 3 * 3600_000;
  return (
    <Badge tone={soon ? "amber" : "green"} className="whitespace-normal">
      <Timer className="h-3 w-3 shrink-0" /> Until {weekdayFmt.format(deadline)} {fmtTime(deadline)} · {fmtCountdown(left)} left
    </Badge>
  );
}
