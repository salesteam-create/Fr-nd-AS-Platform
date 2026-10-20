"use client";

import { PartyPopper, Pause, Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { DayEditor } from "@/components/DayEditor";
import { Badge, Button, Card, CardHeader, Field, PageHeader, inputCls } from "@/components/ui";
import { addDays, fmtLong, isDeliveryDay, weekStart } from "@/lib/dates";
import { dietSum, emptyDay, firstOpenDate, nok, priceFor, standingPatternOn } from "@/lib/logic";
import { useCurrentCustomer, useDemo, useNow } from "@/lib/store";
import { WEEKDAYS, type WeekPattern } from "@/lib/types";
import { useT, weekdayLabel } from "@/lib/i18n";

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
  const { t, lang } = useT();

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
    notify({
      title: current ? t("Standing order updated", "Fast bestilling er oppdatert") : t("Standing order created", "Fast bestilling er opprettet"),
      body: t(
        `Repeats every week from ${fmtLong(from)}. Confirmation sent by email (simulated).`,
        `Gjentas hver uke fra ${fmtLong(from)}. Bekreftelse er sendt på e-post (simulert).`,
      ),
    });
    setWelcome(false);
  };
  const pause = () => {
    setStanding(customer.id, from, null);
    notify({
      kind: "info",
      title: t("Standing order paused", "Fast bestilling er satt på pause"),
      body: t(
        `No automatic deliveries from ${fmtLong(from)}. You can still order single days.`,
        `Ingen automatiske leveranser fra ${fmtLong(from)}. Du kan fortsatt bestille enkeltdager.`,
      ),
    });
  };

  return (
    <div>
      {welcome && (
        <Card className="mb-6 flex items-start gap-4 bg-rosa-100 p-5 ring-gra-300">
          <PartyPopper className="h-6 w-6 shrink-0 text-rosa-700" />
          <div>
            <p className="font-medium text-sort-900">{t("Your account is ready", "Kontoen din er klar")}</p>
            <p className="mt-1 text-sm text-sort-900">
              {t(
                "Most companies order the same every week. Set your usual numbers below and we will repeat them automatically. You can still change single days.",
                "De fleste bedrifter bestiller det samme hver uke. Legg inn det vanlige antallet nedenfor, så gjentar vi det automatisk. Du kan fortsatt endre enkeltdager.",
              )}
            </p>
          </div>
        </Card>
      )}

      <PageHeader
        title={t("Standing order", "Fast bestilling")}
        subtitle={t(
          "Your usual weekly order. It repeats automatically every week, and you can override single days on the Order page.",
          "Din vanlige ukesbestilling. Den gjentas automatisk hver uke, og du kan endre enkeltdager under Bestill lunsj.",
        )}
        action={current ? <Badge tone="green"><Repeat className="h-3 w-3" /> {t("Active", "Aktiv")}</Badge> : <Badge>{t("Not active", "Ikke aktiv")}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card>
          <CardHeader title={t("Weekly pattern", "Ukemønster")} subtitle={t("Portions and special diets per weekday", "Porsjoner og spesialkost per ukedag")} />
          <div className="divide-y divide-gra-100">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="grid gap-3 px-5 py-4 md:grid-cols-[8rem_1fr]">
                <p className="pt-2 font-medium text-sort-900">{weekdayLabel(wd, lang)}</p>
                <DayEditor
                  label={weekdayLabel(wd, lang)}
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
            <p className="text-sm text-gra-500">{t("Per week", "Per uke")}</p>
            <p className="mt-1 text-2xl font-medium tabular-nums text-sort-900">{weekly} {t("portions", "porsjoner")}</p>
            <p className="text-sm text-gra-500">≈ {nok(weekly * price)} {t("excl. VAT", "eks. mva.")}</p>
            <Field label={t("Start from", "Start fra")} className="mt-4">
              <select className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)}>
                {startOptions.map((d) => (
                  <option key={d} value={d}>
                    {fmtLong(d)}
                    {d === open ? t(" (first open day)", " (første åpne dag)") : ""}
                  </option>
                ))}
              </select>
            </Field>
            <p className="mt-2 text-xs text-gra-500">
              {t(
                "Days before this date keep their current orders. One-off changes from this date are replaced.",
                "Dager før denne datoen beholder bestillingene sine. Enkeltendringer fra denne datoen blir erstattet.",
              )}
            </p>
            <Button className="mt-4 w-full" onClick={save} disabled={invalid || weekly === 0}>
              {current ? t("Save standing order", "Lagre fast bestilling") : t("Start standing order", "Start fast bestilling")}
            </Button>
            {current && (
              <Button variant="danger" className="mt-2 w-full" onClick={pause}>
                <Pause className="h-4 w-4" /> {t("Pause from this date", "Sett på pause fra denne datoen")}
              </Button>
            )}
          </Card>
          <Card className="p-5 text-sm text-gra-500">
            <p className="font-medium text-sort-900">{t("Good to know", "Greit å vite")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>{t("Public holidays are skipped automatically.", "Helligdager hoppes over automatisk.")}</li>
              <li>{t(`Changes are possible until ${hour}:00 the working day before delivery.`, `Du kan gjøre endringer frem til kl. ${hour}.00 virkedagen før levering.`)}</li>
              <li>
                {t(
                  `You are invoiced ${customer.invoiceFrequency === "weekly" ? "weekly" : customer.invoiceFrequency === "monthly" ? "monthly" : "as agreed"} by ${customer.invoiceChannel}.`,
                  `Du faktureres ${customer.invoiceFrequency === "weekly" ? "ukentlig" : customer.invoiceFrequency === "monthly" ? "månedlig" : "etter avtale"} som ${customer.invoiceChannel}.`,
                )}
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
