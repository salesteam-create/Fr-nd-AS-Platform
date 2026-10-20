"use client";

import { ArrowRight, ChefHat, RefreshCw, TrendingUp, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { DeadlineStatus } from "@/components/DeadlineStatus";
import { Badge, Card, CardHeader, PageHeader, Stat } from "@/components/ui";
import { addDays, fmtDateTime, fmtDay, fmtLong, fmtMonth, isLocked, nextDeliveryDay, toISO, weekStart } from "@/lib/dates";
import { bestSellers, monthlySeries, revenueBetween, weekTotals } from "@/lib/metrics";
import { deliveriesOn, nok, num, productionFor } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";

export default function AdminDashboard() {
  const data = useDemo();
  const now = useNow();
  const today = toISO(now);
  const hour = data.settings.deadlineHour;

  const tomorrow = nextDeliveryDay(addDays(today, 1));
  const tRows = deliveriesOn(data, tomorrow);
  const tPortions = tRows.reduce((s, r) => s + r.order.total, 0);
  const production = productionFor(data, tomorrow, today).filter((l) => l.portions > 0);

  const nextWeek = addDays(weekStart(today), 7);
  const nw = weekTotals(data, nextWeek);
  const nwPortions = nw.reduce((s, d) => s + d.portions, 0);
  const nwRevenue = nw.reduce((s, d) => s + d.revenue, 0);
  const maxDay = Math.max(1, ...nw.map((d) => d.portions));

  const monthStart = today.slice(0, 8) + "01";
  const mtd = revenueBetween(data, monthStart, addDays(today, -1));
  const last30 = revenueBetween(data, addDays(today, -30), addDays(today, -1));
  const active = data.customers.filter((c) => c.active).length;
  const best = bestSellers(data, addDays(today, -30), addDays(today, -1), today);
  const series = monthlySeries(data, today, 6);
  const maxRev = Math.max(1, ...series.map((s) => s.revenue));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={fmtLong(today)} />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={
              <span className="flex flex-wrap items-center gap-2">
                Next delivery day · {fmtDay(tomorrow)}
                {isLocked(tomorrow, now, hour) ? <Badge tone="green">Final, orders locked</Badge> : <DeadlineStatus date={tomorrow} now={now} hour={hour} />}
              </span>
            }
            action={
              <Link href={`/admin/production?date=${tomorrow}`} className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:underline">
                Production list <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-6 p-5 sm:grid-cols-[12rem_1fr]">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Lunches</p>
                <p className="text-4xl font-semibold tabular-nums text-gray-900">{tPortions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Customers</p>
                <p className="text-2xl font-semibold tabular-nums text-gray-900">{tRows.length}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <ChefHat className="h-4 w-4 text-brand-500" /> Production needs
              </p>
              <ul className="divide-y divide-gray-100 rounded-lg ring-1 ring-gray-100">
                {production.map((l) => (
                  <li key={l.key} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className={l.dish ? "font-medium text-gray-900" : "text-gray-600"}>{l.label}</span>
                    <span className="font-semibold tabular-nums">{l.portions}</span>
                  </li>
                ))}
                {production.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">No orders.</li>}
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Next week" subtitle={`From ${fmtDay(nextWeek)}`} />
          <div className="p-5">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Lunches ordered</p>
                <p className="text-2xl font-semibold tabular-nums">{num(nwPortions)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Revenue forecast</p>
                <p className="text-2xl font-semibold tabular-nums">{nok(nwRevenue)}</p>
              </div>
            </div>
            <div className="mt-5 flex h-32 items-end gap-2">
              {nw.map((d) => (
                <div key={d.wd} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs tabular-nums text-gray-600">{d.portions}</span>
                  <div className="w-full rounded-t bg-brand-400" style={{ height: `${(d.portions / maxDay) * 90}px` }} />
                  <span className="text-xs uppercase text-gray-500">{d.wd}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue this month" value={nok(mtd.revenue)} hint={`${num(mtd.portions)} lunches delivered`} icon={<TrendingUp className="h-5 w-5" />} />
        <Stat label="Active customers" value={active} hint={`${data.customers.length - active} inactive`} icon={<Users className="h-5 w-5" />} />
        <Stat label="Average order value" value={nok(last30.orders ? last30.revenue / last30.orders : 0)} hint="Per delivery, last 30 days" icon={<UtensilsCrossed className="h-5 w-5" />} />
        <Stat label="Lunches, last 30 days" value={num(last30.portions)} hint={`${nok(last30.revenue)} revenue`} icon={<ChefHat className="h-5 w-5" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Revenue by month" subtitle="Excl. VAT. Current month to date." />
          <div className="flex h-56 items-end gap-3 p-5">
            {series.map((s) => (
              <div key={s.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs tabular-nums text-gray-600">{Math.round(s.revenue / 1000)}k</span>
                <div className={s.partial ? "w-full rounded-t bg-accent-400/70" : "w-full rounded-t bg-brand-600"} style={{ height: `${(s.revenue / maxRev) * 150}px` }} />
                <span className="text-xs text-gray-500">{fmtMonth(s.month).split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Best-selling dishes" subtitle="Last 30 days" />
          <ol className="divide-y divide-gray-50">
            {best.map((b, i) => (
              <li key={b.name} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                <span className="w-5 text-gray-400">{i + 1}</span>
                <span className="flex-1 text-gray-800">{b.name}</span>
                <span className="font-medium tabular-nums">{num(b.portions)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Tripletex activity"
          action={
            <Link href="/admin/invoicing" className="flex items-center gap-1 text-sm font-medium text-accent-600 hover:underline">
              <RefreshCw className="h-4 w-4" /> Invoicing
            </Link>
          }
        />
        <ul className="divide-y divide-gray-50">
          {data.syncLog.slice(0, 5).map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 text-sm">
              <span className="text-gray-700">{l.message}</span>
              <span className="text-xs text-gray-400">{fmtDateTime(new Date(l.at))}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
