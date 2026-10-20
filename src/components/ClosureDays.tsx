"use client";

import { CalendarOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { addDays, fmtLong, isLocked, publicHolidayName, publicHolidaysFrom, toISO, weekdayOf } from "@/lib/dates";
import { useT } from "@/lib/i18n";
import { deliveriesOn } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";
import { Badge, Button, Card, CardHeader, Field, inputCls } from "./ui";

/** Frænd closure days (FR-34): no deliveries, standing orders skip the day, affected customers get an email. */
export function ClosureDays() {
  const data = useDemo();
  const addClosure = useDemo((s) => s.addClosure);
  const removeClosure = useDemo((s) => s.removeClosure);
  const notify = useDemo((s) => s.notify);
  const { t } = useT();
  const now = useNow();
  const today = toISO(now);
  const hour = data.settings.deadlineHour;
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const weekday = date ? weekdayOf(date) : null;
  const existing = date ? publicHolidayName(date) ?? data.closures[date] ?? null : null;
  const affected = date && weekday && !existing ? deliveriesOn(data, date) : [];
  const portions = affected.reduce((s, r) => s + r.order.total, 0);
  const valid = !!date && date >= today && !!weekday && !existing && reason.trim().length > 0;

  const close = () => {
    const n = addClosure(date, reason.trim());
    const firstEmail = useDemo.getState().emails[0];
    notify({
      title: t("Day closed", "Dagen er stengt"),
      body: t(
        `${fmtLong(date)}: no deliveries. ${n} customer(s) notified by email.`,
        `${fmtLong(date)}: ingen leveringer. ${n} kunde(r) er varslet på e-post.`,
      ),
      emailId: n > 0 ? firstEmail?.id : undefined,
    });
    setDate("");
    setReason("");
  };

  const own = Object.entries(data.closures)
    .filter(([d]) => d >= today)
    .sort(([a], [b]) => a.localeCompare(b));
  const holidays = publicHolidaysFrom(today).filter((h) => h.date <= addDays(today, 365));

  return (
    <Card className="lg:col-span-2">
      <CardHeader
        title={t("Closure days", "Stengte dager")}
        subtitle={t(
          "No deliveries on these days. Standing orders skip them automatically, and customers with an order are notified.",
          "Ingen leveringer disse dagene. Faste bestillinger hoppes over automatisk, og kunder med bestilling blir varslet.",
        )}
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[11rem_1fr]">
            <Field label={t("Date", "Dato")}>
              <input type="date" className={inputCls} min={today} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label={t("Reason (shown to customers)", "Årsak (vises til kundene)")}>
              <input className={inputCls} placeholder={t("e.g. Staff day", "f.eks. Personaldag")} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Field>
          </div>
          {date && !weekday && <p className="text-sm text-gra-500">{t("That is a weekend. There are no deliveries anyway.", "Det er en helgedag. Da er det ingen leveringer uansett.")}</p>}
          {date && existing && <p className="text-sm text-gra-500">{t(`Already closed: ${existing}.`, `Allerede stengt: ${existing}.`)}</p>}
          {date && weekday && !existing && (
            <div className="bg-krem p-3 text-sm text-sort-700 ring-1 ring-gra-300">
              <p>
                {t(
                  `Affects ${affected.length} customer(s) and ${portions} portions on ${fmtLong(date)}.`,
                  `Gjelder ${affected.length} kunde(r) og ${portions} porsjoner ${fmtLong(date)}.`,
                )}
              </p>
              {isLocked(date, now, hour) && (
                <p className="mt-1 font-medium text-rod-600">
                  {t("Orders for this day are already locked. Call the customers as well.", "Bestillingene for denne dagen er allerede låst. Ring kundene i tillegg.")}
                </p>
              )}
            </div>
          )}
          <Button onClick={close} disabled={!valid}>
            <CalendarOff className="h-4 w-4" /> {t("Close this day", "Steng denne dagen")}
          </Button>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-caps text-sort-900">{t("Frænd closure days", "Frænds stengte dager")}</p>
            <ul className="mt-2 divide-y divide-gra-100 ring-1 ring-gra-300">
              {own.map(([d, r]) => (
                <li key={d} className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm">
                  <span>
                    <span className="font-medium text-sort-900">{fmtLong(d)}</span> <span className="text-gra-500">· {r}</span>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t("Reopen day", "Åpne dagen igjen")}
                    onClick={() => {
                      removeClosure(d);
                      notify({ kind: "info", title: t("Day reopened", "Dagen er åpnet igjen"), body: t("Standing orders apply again for this day.", "Faste bestillinger gjelder igjen for denne dagen.") });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
              {own.length === 0 && <li className="bg-white px-3 py-2 text-sm text-gra-500">{t("None planned.", "Ingen planlagt.")}</li>}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-caps text-sort-900">{t("Public holidays (automatic)", "Helligdager (automatisk)")}</p>
            <ul className="mt-2 max-h-48 divide-y divide-gra-100 overflow-y-auto ring-1 ring-gra-300">
              {holidays.map((h) => (
                <li key={h.date} className="flex items-center justify-between gap-3 bg-white px-3 py-2 text-sm">
                  <span>
                    <span className="text-sort-900">{fmtLong(h.date)}</span> <span className="text-gra-500">· {h.name}</span>
                  </span>
                  <Badge tone="gray">{t("Holiday", "Helligdag")}</Badge>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
