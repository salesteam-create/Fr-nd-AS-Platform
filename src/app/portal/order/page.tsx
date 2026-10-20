"use client";

import { Copy, Leaf, Lock, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { DayEditor } from "@/components/DayEditor";
import { DeadlineStatus } from "@/components/DeadlineStatus";
import { Badge, Button, Card, PageHeader, Tabs, cx } from "@/components/ui";
import { addDays, fmtDay, holidayName, isLocked, toISO, weekDates, weekNumber, weekStart } from "@/lib/dates";
import { dietSum, effectiveOrder, emptyDay, firstOpenDate, getMenu, nok, priceFor } from "@/lib/logic";
import { useCurrentCustomer, useDemo, useNow } from "@/lib/store";
import { WEEKDAYS, WEEKDAY_LABEL, type DayOrder, type Weekday } from "@/lib/types";

export default function OrderPage() {
  const now = useNow();
  const hour = useDemo((s) => s.settings.deadlineHour);
  const thisWeek = weekStart(toISO(now));
  const [ws, setWs] = useState(() => weekStart(firstOpenDate(now, hour)));
  const weeks = [0, 1, 2].map((i) => addDays(thisWeek, 7 * i));

  return (
    <div>
      <PageHeader
        title="Order lunch"
        subtitle={`Choose portions per day. You can change orders until ${hour}:00 the working day before delivery.`}
        action={
          <Tabs
            value={ws}
            onChange={setWs}
            options={weeks.map((w, i) => ({ value: w, label: i === 0 ? "This week" : i === 1 ? "Next week" : `Week ${weekNumber(w)}` }))}
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
        title: "Order updated",
        body: `${stillOpen.map((wd) => WEEKDAY_LABEL[wd]).join(", ")} saved. Confirmation sent to ${customer.email} (simulated).`,
      });
    }
    if (lockedOut.length) {
      notify({ kind: "error", title: "Deadline passed", body: `${lockedOut.map((wd) => WEEKDAY_LABEL[wd]).join(", ")} locked before you saved.` });
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
            <Copy className="h-4 w-4" /> Copy last week
          </Button>
          <Button variant="secondary" size="sm" onClick={sameAsFirst}>
            Same as {WEEKDAY_LABEL[openDays[0]]} for all open days
          </Button>
          <Button variant="ghost" size="sm" onClick={clear}>
            <Trash2 className="h-4 w-4" /> No lunch this week
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
            <Card key={wd} className={cx("p-5", isLockedDay && "bg-gray-50", dirty && "ring-2 ring-accent-400")}>
              <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{fmtDay(d)}</p>
                    {isLockedDay && <Lock className="h-4 w-4 text-gray-400" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{menu.days[wd].main.name}</p>
                  <p className="mt-0.5 flex items-start gap-1 text-sm text-gray-500">
                    <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" /> {menu.days[wd].vegetarian.name}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <DeadlineStatus date={d} now={now} hour={hour} />
                    {source === "standing" && !dirty && <Badge tone="blue">Standing order</Badge>}
                    {source === "override" && !dirty && <Badge tone="accent">Changed for this week</Badge>}
                    {dirty && <Badge tone="amber">Unsaved</Badge>}
                  </div>
                </div>
                {holidayName(d) ? (
                  <p className="self-center text-sm text-gray-500">No deliveries on {holidayName(d)}.</p>
                ) : (
                  <DayEditor label={WEEKDAY_LABEL[wd]} value={draft[wd]} onChange={(o) => update(wd, o)} disabled={isLockedDay} />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:pl-48">
          <div>
            <p className="text-sm text-gray-500">Week total</p>
            <p className="font-semibold tabular-nums text-gray-900">
              {total} portions · {nok(total * price)} <span className="text-xs font-normal text-gray-500">excl. VAT ({nok(price)} each)</span>
            </p>
          </div>
          <div className="flex gap-2">
            {changed.length > 0 && (
              <Button variant="ghost" onClick={() => setDraft(structuredClone(saved))}>
                <RotateCcw className="h-4 w-4" /> Discard
              </Button>
            )}
            <Button onClick={save} disabled={changed.length === 0 || invalid} size="lg">
              {changed.length ? `Save ${changed.length} change${changed.length > 1 ? "s" : ""}` : "No changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
