"use client";

import { PartyPopper, Pause, Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { DayEditor } from "@/components/DayEditor";
import { Badge, Button, Card, CardHeader, Field, PageHeader, inputCls } from "@/components/ui";
import { addDays, fmtLong, isDeliveryDay, weekStart } from "@/lib/dates";
import { dietSum, emptyDay, firstOpenDate, nok, priceFor, standingPatternOn } from "@/lib/logic";
import { useCurrentCustomer, useDemo, useNow } from "@/lib/store";
import { WEEKDAYS, WEEKDAY_LABEL, type WeekPattern } from "@/lib/types";

const blankPattern = (n = 0): WeekPattern =>
  Object.fromEntries(WEEKDAYS.map((wd) => [wd, emptyDay(n)])) as WeekPattern;

export default function StandingOrderPage() {
  const customer = useCurrentCustomer()!;
  const data = useDemo();
  const setStanding = useDemo((s) => s.setStandingOrder);
  const notify = useDemo((s) => s.notify);
  const now = useNow();
  const hour = data.settings.deadlineHour;
  const open = firstOpenDate(now, hour);
  const current = standingPatternOn(data, customer.id, open);
  const price = priceFor(customer, data);

  const [welcome, setWelcome] = useState(false);
  useEffect(() => setWelcome(new URLSearchParams(window.location.search).has("welcome")), []);

  const [pattern, setPattern] = useState<WeekPattern>(() => structuredClone(current ?? blankPattern(10)));
  // Start options: the first open delivery day, or the following Mondays.
  const nextMonday = addDays(weekStart(open), 7);
  const startOptions = Array.from(new Set([open, nextMonday, addDays(nextMonday, 7)])).filter(isDeliveryDay);
  const [from, setFrom] = useState(startOptions[0]);

  const weekly = WEEKDAYS.reduce((s, wd) => s + pattern[wd].total, 0);
  const invalid = WEEKDAYS.some((wd) => dietSum(pattern[wd]) > pattern[wd].total);

  const save = () => {
    setStanding(customer.id, from, pattern);
    notify({ title: current ? "Standing order updated" : "Standing order created", body: `Repeats every week from ${fmtLong(from)}. Confirmation sent by email (simulated).` });
    setWelcome(false);
  };
  const pause = () => {
    setStanding(customer.id, from, null);
    notify({ kind: "info", title: "Standing order paused", body: `No automatic deliveries from ${fmtLong(from)}. You can still order single days.` });
  };

  return (
    <div>
      {welcome && (
        <Card className="mb-6 flex items-start gap-4 bg-brand-50 p-5 ring-brand-200">
          <PartyPopper className="h-6 w-6 shrink-0 text-accent-500" />
          <div>
            <p className="font-semibold text-brand-900">Your account is ready</p>
            <p className="mt-1 text-sm text-brand-800">
              Most companies order the same every week. Set your usual numbers below and we will repeat them automatically. You can still change single days.
            </p>
          </div>
        </Card>
      )}

      <PageHeader
        title="Standing order"
        subtitle="Your usual weekly order. It repeats automatically every week, and you can override single days on the Order page."
        action={current ? <Badge tone="green"><Repeat className="h-3 w-3" /> Active</Badge> : <Badge>Not active</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader title="Weekly pattern" subtitle="Portions and special diets per weekday" />
          <div className="divide-y divide-gray-100">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="grid gap-3 px-5 py-4 md:grid-cols-[8rem_1fr]">
                <p className="pt-2 font-medium text-gray-900">{WEEKDAY_LABEL[wd]}</p>
                <DayEditor
                  label={WEEKDAY_LABEL[wd]}
                  value={pattern[wd]}
                  showComment={false}
                  onChange={(o) => setPattern((p) => ({ ...p, [wd]: o }))}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-sm text-gray-500">Per week</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-gray-900">{weekly} portions</p>
            <p className="text-sm text-gray-600">≈ {nok(weekly * price)} excl. VAT</p>
            <Field label="Start from" className="mt-4">
              <select className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)}>
                {startOptions.map((d) => (
                  <option key={d} value={d}>
                    {fmtLong(d)}
                    {d === open ? " (first open day)" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs text-gray-500">Days before this date keep their current orders. One-off changes from this date are replaced.</p>
            <Button className="mt-4 w-full" onClick={save} disabled={invalid || weekly === 0}>
              {current ? "Save standing order" : "Start standing order"}
            </Button>
            {current && (
              <Button variant="danger" className="mt-2 w-full" onClick={pause}>
                <Pause className="h-4 w-4" /> Pause from this date
              </Button>
            )}
          </Card>
          <Card className="p-5 text-sm text-gray-600">
            <p className="font-medium text-gray-900">Good to know</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Public holidays are skipped automatically.</li>
              <li>Changes are possible until {hour}:00 the working day before delivery.</li>
              <li>You are invoiced {customer.invoiceFrequency === "weekly" ? "weekly" : customer.invoiceFrequency === "monthly" ? "monthly" : "as agreed"} by {customer.invoiceChannel}.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
