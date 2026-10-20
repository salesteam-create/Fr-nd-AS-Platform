"use client";

import { Clock, FlaskConical, Mail, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deadlineFor, fmtDateTime, fmtTime } from "@/lib/dates";
import { useT } from "@/lib/i18n";
import { firstOpenDate } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";
import { emailSubject } from "./EmailPreview";
import { LangToggle } from "./LangToggle";
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
  const emails = useDemo((s) => s.emails);
  const customers = useDemo((s) => s.customers);
  const openEmail = useDemo((s) => s.openEmail);
  const { t } = useT();

  const shift = (ms: number) => setOffset(offset + ms);
  const jumpToDeadline = () => {
    const target = deadlineFor(firstOpenDate(now, hour), hour).getTime() - 2 * 60_000;
    setOffset(target - Date.now());
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 z-40 flex items-center gap-2 rounded-full bg-sort-900 px-4 py-2 text-xs font-medium text-white shadow-card ring-1 ring-rosa-500 sm:bottom-4 print:hidden"
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
          <FlaskConical className="h-4 w-4" /> {t("Demo controls", "Demokontroller")}
        </p>
        <button onClick={() => setOpen(false)} aria-label={t("Close demo controls", "Lukk demokontroller")} className="rounded p-1 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-gra-300">
        <Clock className="h-3.5 w-3.5" /> {t("Demo clock", "Demoklokke")}
        {offset !== 0 && <span className="rounded bg-amber-400/20 px-1.5 text-amber-300">{t("shifted", "forskjøvet")}</span>}
      </p>
      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-medium tabular-nums">{fmtDateTime(now)}</p>
        <LangToggle dark />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button className={btn} onClick={() => shift(-HOUR)}>−1 {t("h", "t")}</button>
        <button className={btn} onClick={() => shift(HOUR)}>+1 {t("h", "t")}</button>
        <button className={btn} onClick={() => shift(24 * HOUR)}>+1 {t("day", "dag")}</button>
        <button className={btn} onClick={jumpToDeadline}>{t("2 min before next deadline", "2 min før neste frist")}</button>
        <button className={btn} onClick={() => shift(5 * 60_000)}>+5 min</button>
        <button className={btn} onClick={() => setOffset(0)}>{t("Real time", "Sanntid")}</button>
      </div>
      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="flex items-center gap-2 text-xs text-gra-300">
          <Mail className="h-3.5 w-3.5" /> {t(`Sent emails (${emails.length})`, `Sendte e-poster (${emails.length})`)}
        </p>
        {emails.length === 0 ? (
          <p className="mt-1 text-xs text-gra-500">{t("None yet. Save an order to send a confirmation.", "Ingen ennå. Lagre en bestilling for å sende en bekreftelse.")}</p>
        ) : (
          <ul className="mt-1 max-h-40 overflow-y-auto">
            {emails.slice(0, 5).map((e) => (
              <li key={e.id}>
                <button onClick={() => openEmail(e.id)} className="flex w-full items-baseline justify-between gap-2 rounded px-1 py-1 text-left text-xs hover:bg-white/10">
                  <span className="min-w-0 truncate">
                    {emailSubject(e, t)} <span className="text-gra-500">· {customers.find((c) => c.id === e.customerId)?.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-gra-500">{fmtTime(new Date(e.at))}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs">
        <Link href="/portal" className={btn}>{t("Customer portal", "Kundeportal")}</Link>
        <Link href="/admin" className={btn}>{t("Frænd admin", "Frænd-admin")}</Link>
        <button
          className={cx(btn, "ml-auto flex items-center gap-1 text-red-300")}
          onClick={() => {
            if (confirm(t("Reset all demo data to the starting state?", "Tilbakestille alle demodata til start?"))) {
              reset();
              notify({ kind: "info", title: t("Demo data reset", "Demodata tilbakestilt") });
            }
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> {t("Reset data", "Tilbakestill data")}
        </button>
      </div>
    </div>
  );
}
