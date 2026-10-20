"use client";

import { Copy, Leaf, Lock, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DayEditor } from "@/components/DayEditor";
import { DeadlineStatus } from "@/components/DeadlineStatus";
import { Badge, Button, Card, PageHeader, Tabs, cx } from "@/components/ui";
import { addDays, fmtDay, holidayName, isLocked, toISO, weekDates, weekNumber, weekStart } from "@/lib/dates";
import { dietSum, effectiveOrder, emptyDay, firstOpenDate, getMenu, nok, priceFor } from "@/lib/logic";
import { useCurrentCustomer, useDemo, useNow } from "@/lib/store";
import { WEEKDAYS, type DayOrder, type Weekday } from "@/lib/types";
import { dishName, useT, weekdayLabel } from "@/lib/i18n";

export default function OrderPage() {
  const now = useNow();
  const hour = useDemo((s) => s.settings.deadlineHour);
  const { t } = useT();
  const thisWeek = weekStart(toISO(now));
  const [ws, setWs] = useState(() => weekStart(firstOpenDate(now, hour)));
  const weeks = [0, 1, 2].map((i) => addDays(thisWeek, 7 * i));

  return (
    <div>
      <PageHeader
        title={t("Order lunch", "Bestill lunsj")}
        subtitle={t(
          `Choose portions per day. You can change orders until ${hour}:00 the working day before delivery.`,
          `Velg antall porsjoner per dag. Du kan endre bestillingen frem til kl. ${hour}.00 virkedagen før levering.`,
        )}
        action={
          <Tabs
            value={ws}
            onChange={setWs}
            options={weeks.map((w, i) => ({ value: w, label: i === 0 ? t("This week", "Denne uken") : i === 1 ? t("Next week", "Neste uke") : t(`Week ${weekNumber(w)}`, `Uke ${weekNumber(w)}`) }))}
          />
        }
      />
      {/* Remount the editor per week so the draft starts from saved orders. */}
      <WeekEditor key={ws} ws={ws} />
    </div>
  );
}

function WeekEditor({ ws }: { ws: string }) {
  const customer = useCurrentCustomer()!;
  const data = useDemo();
  const setDayOrders = useDemo((s) => s.setDayOrders);
  const notify = useDemo((s) => s.notify);
  const now = useNow();
  const hour = data.settings.deadlineHour;
  const today = toISO(now);
  const dates = weekDates(ws);
  const menu = getMenu(data, ws, today);
  const price = priceFor(customer, data);
  const { t, lang } = useT();
  const days = (list: Weekday[]) => list.map((wd) => weekdayLabel(wd, lang)).join(", ");

  const saved = useMemo(() => {
    const out = {} as Record<Weekday, DayOrder>;
    for (const wd of WEEKDAYS) out[wd] = structuredClone(effectiveOrder(data, customer.id, dates[wd]).order ?? emptyDay());
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.overrides, data.standing, customer.id, ws]);

  const [draft, setDraft] = useState<Record<Weekday, DayOrder>>(() => structuredClone(saved));

  const locked = (wd: Weekday) => isLocked(dates[wd], now, hour) || !!holidayName(dates[wd]);
  const changed = WEEKDAYS.filter((wd) => !locked(wd) && JSON.stringify(draft[wd]) !== JSON.stringify(saved[wd]));
  const invalid = WEEKDAYS.some((wd) => dietSum(draft[wd]) > draft[wd].total);
  const total = WEEKDAYS.reduce((s, wd) => s + draft[wd].total, 0);
  const openDays = WEEKDAYS.filter((wd) => !locked(wd));

  const update = (wd: Weekday, o: DayOrder) => setDraft((d) => ({ ...d, [wd]: o }));

  const save = () => {
    // Re-check the deadline at the moment of saving.
    const stillOpen = changed.filter((wd) => !isLocked(dates[wd], new Date(Date.now() + data.clockOffsetMs), hour));
    const lockedOut = changed.filter((wd) => !stillOpen.includes(wd));
    if (stillOpen.length) {
      setDayOrders(customer.id, Object.fromEntries(stillOpen.map((wd) => [dates[wd], draft[wd].total > 0 ? draft[wd] : null])));
      notify({
        title: t("Order updated", "Bestillingen er oppdatert"),
        body: t(
          `${days(stillOpen)} saved. Confirmation sent to ${customer.email} (simulated).`,
          `${days(stillOpen)} er lagret. Bekreftelse er sendt til ${customer.email} (simulert).`,
        ),
      });
    }
    if (lockedOut.length) {
      notify({
        kind: "error",
        title: t("Deadline passed", "Fristen har gått ut"),
        body: t(`${days(lockedOut)} locked before you saved.`, `${days(lockedOut)} ble låst før du lagret.`),
      });
      setDraft((d) => ({ ...d, ...Object.fromEntries(lockedOut.map((wd) => [wd, saved[wd]])) }));
    }
  };

  const copyLastWeek = () => {
    const prev = weekDates(addDays(ws, -7));
    setDraft((d) => {
      const n = { ...d };
      for (const wd of openDays) n[wd] = structuredClone(effectiveOrder(data, customer.id, prev[wd]).order ?? emptyDay());
      return n;
    });
  };
  const sameAsFirst = () => {
    const src = draft[openDays[0]];
    if (!src) return;
    setDraft((d) => {
      const n = { ...d };
      for (const wd of openDays) n[wd] = structuredClone(src);
      return n;
    });
  };
  const clear = () =>
    setDraft((d) => {
      const n = { ...d };
      for (const wd of openDays) n[wd] = emptyDay();
      return n;
    });

  return (
    <div className="pb-28">
      {openDays.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={copyLastWeek}>
            <Copy className="h-4 w-4" /> {t("Copy last week", "Kopier forrige uke")}
          </Button>
          <Button variant="secondary" size="sm" onClick={sameAsFirst}>
            {t(`Same as ${weekdayLabel(openDays[0], lang)} for all open days`, `Som ${weekdayLabel(openDays[0], lang).toLowerCase()} for alle åpne dager`)}
          </Button>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="h-4 w-4" /> {t("No lunch this week", "Ingen lunsj denne uken")}
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {WEEKDAYS.map((wd) => {
          const d = dates[wd];
          const isLockedDay = locked(wd);
          const { source } = effectiveOrder(data, customer.id, d);
          const dirty = changed.includes(wd);
          return (
            <Card key={wd} className={cx("p-5", isLockedDay && "bg-krem", dirty && "ring-2 ring-rosa-500")}>
              <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sort-900">{fmtDay(d)}</p>
                    {isLockedDay && <Lock className="h-4 w-4 text-gra-500" />}
                  </div>
                  <p className="mt-1 text-sm text-sort-700">{dishName(menu.days[wd].main, lang)}</p>
                  <p className="mt-0.5 flex items-start gap-1 text-sm text-gra-500">
                    <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sort-700" /> {dishName(menu.days[wd].vegetarian, lang)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <DeadlineStatus date={d} now={now} hour={hour} />
                    {source === "standing" && !dirty && <Badge tone="blue">{t("Standing order", "Fast bestilling")}</Badge>}
                    {source === "override" && !dirty && <Badge tone="accent">{t("Changed for this week", "Endret denne uken")}</Badge>}
                    {dirty && <Badge tone="amber">{t("Unsaved", "Ikke lagret")}</Badge>}
                  </div>
                </div>
                {holidayName(d) ? (
                  <p className="self-center text-sm text-gra-500">{t(`No deliveries on ${holidayName(d)}.`, `Ingen levering: ${holidayName(d)}.`)}</p>
                ) : (
                  <DayEditor label={weekdayLabel(wd, lang)} value={draft[wd]} onChange={(o) => update(wd, o)} disabled={isLockedDay} />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gra-300 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:pl-48">
          <div>
            <p className="text-sm text-gra-500">{t("Week total", "Ukesum")}</p>
            <p className="font-medium tabular-nums text-sort-900">
              {total} {t("portions", "porsjoner")} · {nok(total * price)}{" "}
              <span className="text-xs font-normal text-gra-500">{t(`excl. VAT (${nok(price)} each)`, `eks. mva. (${nok(price)} per stk.)`)}</span>
            </p>
          </div>
          <div className="flex gap-2">
            {changed.length > 0 && (
              <Button variant="ghost" onClick={() => setDraft(structuredClone(saved))}>
                <RotateCcw className="h-4 w-4" /> {t("Discard", "Forkast")}
              </Button>
            )}
            <Button onClick={save} disabled={changed.length === 0 || invalid} size="lg">
              {changed.length
                ? t(`Save ${changed.length} change${changed.length > 1 ? "s" : ""}`, `Lagre ${changed.length} ${changed.length > 1 ? "endringer" : "endring"}`)
                : t("No changes", "Ingen endringer")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
