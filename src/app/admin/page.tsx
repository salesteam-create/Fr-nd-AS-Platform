"use client";

import { ArrowRight, ChefHat, RefreshCw, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { DeadlineStatus } from "@/components/DeadlineStatus";
import { Badge, Card, CardHeader, PageHeader, Stat } from "@/components/ui";
import { addDays, fmtDateTime, fmtDay, fmtLong, fmtMonth, isLocked, nextDeliveryDay, toISO, weekStart } from "@/lib/dates";
import { bestSellers, monthlySeries, revenueBetween, weekTotals } from "@/lib/metrics";
import { deliveriesOn, nok, num, productionFor } from "@/lib/logic";
import { logMessage, useT, weekdayShort } from "@/lib/i18n";
import { useDemo, useNow } from "@/lib/store";

export default function AdminDashboard() {
  const data = useDemo();
  const { t, lang } = useT();
  const now = useNow();
  const today = toISO(now);
  const hour = data.settings.deadlineHour;

  const tomorrow = nextDeliveryDay(addDays(today, 1));
  const tRows = deliveriesOn(data, tomorrow);
  const tPortions = tRows.reduce((s, r) => s + r.order.total, 0);
  const production = productionFor(data, tomorrow, today, lang).filter((l) => l.portions > 0);

  const nextWeek = addDays(weekStart(today), 7);
  const nw = weekTotals(data, nextWeek);
  const nwPortions = nw.reduce((s, d) => s + d.portions, 0);
  const nwRevenue = nw.reduce((s, d) => s + d.revenue, 0);
  const maxDay = Math.max(1, ...nw.map((d) => d.portions));

  const monthStart = today.slice(0, 8) + "01";
  const mtd = revenueBetween(data, monthStart, addDays(today, -1));
  const last30 = revenueBetween(data, addDays(today, -30), addDays(today, -1));
  const active = data.customers.filter((c) => c.active).length;
  const best = bestSellers(data, addDays(today, -30), addDays(today, -1), today, 5, lang);
  const series = monthlySeries(data, today, 6);
  const maxRev = Math.max(1, ...series.map((s) => s.revenue));

  return (
    <div>
      <PageHeader title={t("Dashboard", "Dashbord")} subtitle={fmtLong(today)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                {t("Next delivery day", "Neste leveringsdag")} · {fmtDay(tomorrow)}
                {isLocked(tomorrow, now, hour) ? <Badge tone="green">{t("Final, orders locked", "Endelig, bestillinger låst")}</Badge> : <DeadlineStatus date={tomorrow} now={now} hour={hour} />}
              </span>
            }
            action={
              <Link href={`/admin/production?date=${tomorrow}`} className="flex items-center gap-1 text-sm font-medium text-rosa-700 hover:underline">
                {t("Production list", "Produksjonsliste")} <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-6 p-5 sm:grid-cols-[12rem_1fr]">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gra-500">{t("Lunches", "Lunsjer")}</p>
                <p className="text-4xl font-medium tabular-nums text-sort-900">{tPortions}</p>
              </div>
              <div>
                <p className="text-sm text-gra-500">{t("Customers", "Kunder")}</p>
                <p className="text-2xl font-medium tabular-nums text-sort-900">{tRows.length}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-sort-700">
                <ChefHat className="h-4 w-4 text-sort-700" /> {t("Production needs", "Produksjonsbehov")}
              </p>
              <ul className="divide-y divide-gra-100 rounded-lg ring-1 ring-gra-300">
                {production.map((l) => (
                  <li key={l.key} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className={l.dish ? "font-medium text-sort-900" : "text-gra-500"}>{l.label}</span>
                    <span className="font-medium tabular-nums">{l.portions}</span>
                  </li>
                ))}
                {production.length === 0 && <li className="px-3 py-2 text-sm text-gra-500">{t("No orders.", "Ingen bestillinger.")}</li>}
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title={t("Next week", "Neste uke")} subtitle={`${t("From", "Fra")} ${fmtDay(nextWeek)}`} />
          <div className="p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gra-500">{t("Lunches ordered", "Bestilte lunsjer")}</p>
                <p className="text-2xl font-medium tabular-nums">{num(nwPortions)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gra-500">{t("Revenue forecast", "Omsetningsprognose")}</p>
                <p className="text-2xl font-medium tabular-nums">{nok(nwRevenue)}</p>
              </div>
            </div>
            <div className="mt-5 flex h-32 items-end gap-2">
              {nw.map((d) => (
                <div key={d.wd} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs tabular-nums text-gra-500">{d.portions}</span>
                  <div className="w-full rounded-t bg-rosa-500" style={{ height: `${(d.portions / maxDay) * 90}px` }} />
                  <span className="text-xs uppercase text-gra-500">{weekdayShort(d.wd, lang)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t("Revenue this month", "Omsetning denne måneden")} value={nok(mtd.revenue)} hint={`${num(mtd.portions)} ${t("lunches delivered", "lunsjer levert")}`} icon={<TrendingUp className="h-5 w-5" />} />
        <Stat label={t("Active customers", "Aktive kunder")} value={active} hint={`${data.customers.length - active} ${t("inactive", "inaktive")}`} icon={<Users className="h-5 w-5" />} />
        <Stat label={t("Average order value", "Gjennomsnittlig ordreverdi")} value={nok(last30.orders ? last30.revenue / last30.orders : 0)} hint={t("Per delivery, last 30 days", "Per levering, siste 30 dager")} icon={<UtensilsCrossed className="h-5 w-5" />} />
        <Stat label={t("Lunches, last 30 days", "Lunsjer, siste 30 dager")} value={num(last30.portions)} hint={`${nok(last30.revenue)} ${t("revenue", "omsetning")}`} icon={<ChefHat className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title={t("Revenue by month", "Omsetning per måned")} subtitle={t("Excl. VAT. Current month to date.", "Eks. mva. Inneværende måned hittil.")} />
          <div className="flex h-56 items-end gap-3 p-5">
            {series.map((s) => (
              <div key={s.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums text-gra-500">{Math.round(s.revenue / 1000)}k</span>
                <div className={s.partial ? "w-full rounded-t bg-gull-500" : "w-full rounded-t bg-sort-900"} style={{ height: `${(s.revenue / maxRev) * 150}px` }} />
                <span className="text-xs text-gra-500">{fmtMonth(s.month).split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title={t("Best-selling dishes", "Mest solgte retter")} subtitle={t("Last 30 days", "Siste 30 dager")} />
          <ol className="divide-y divide-gra-100">
            {best.map((b, i) => (
              <li key={b.name} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <span className="w-5 text-gra-500">{i + 1}</span>
                <span className="flex-1 text-sort-900">{b.name}</span>
                <span className="font-medium tabular-nums">{num(b.portions)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title={t("Tripletex activity", "Tripletex-aktivitet")}
          action={
            <Link href="/admin/invoicing" className="flex items-center gap-1 text-sm font-medium text-rosa-700 hover:underline">
              <RefreshCw className="h-4 w-4" /> {t("Invoicing", "Fakturering")}
            </Link>
          }
        />
        <ul className="divide-y divide-gra-100">
          {data.syncLog.slice(0, 5).map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm">
              <span className="text-sort-700">{logMessage(l, lang)}</span>
              <span className="text-xs text-gra-500">{fmtDateTime(new Date(l.at))}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
