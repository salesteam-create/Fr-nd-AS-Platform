"use client";

import { Lock, Timer } from "lucide-react";
import { deadlineFor, fmtCountdown, fmtTime, fmtWeekdayShort, holidayName, isLocked } from "@/lib/dates";
import { useT } from "@/lib/i18n";
import { Badge } from "./ui";

export function DeadlineStatus({ date, now, hour }: { date: string; now: Date; hour: number }) {
  const { t } = useT();
  const holiday = holidayName(date);
  if (holiday) return <Badge tone="gray">{t("Closed", "Stengt")} · {holiday}</Badge>;
  const deadline = deadlineFor(date, hour);
  if (isLocked(date, now, hour)) {
    return (
      <Badge tone="gray">
        <Lock className="h-3 w-3" /> {t("Locked", "Låst")}
      </Badge>
    );
  }
  const left = deadline.getTime() - now.getTime();
  const soon = left < 3 * 3600_000;
  return (
    <Badge tone={soon ? "amber" : "green"} className="whitespace-normal">
      <Timer className="h-3 w-3 shrink-0" /> {t("Until", "Frem til")} {fmtWeekdayShort(deadline)} {fmtTime(deadline)} · {fmtCountdown(left)} {t("left", "igjen")}
    </Badge>
  );
}
