"use client";

import { ArrowRight, CalendarDays, FileText, Repeat, Truck } from "lucide-react";
import Link from "next/link";
import { DeadlineStatus } from "@/components/DeadlineStatus";
import { DishImage } from "@/components/DishImage";
import { Badge, Card, CardHeader, PageHeader } from "@/components/ui";
import { addDays, fmtDate, fmtDay, fmtLong, toISO, weekDates, weekStart, weekdayOf } from "@/lib/dates";
import { effectiveOrder, firstOpenDate, getMenu, nok, priceFor, standingPatternOn } from "@/lib/logic";
import { useCurrentCustomer, useDemo, useNow } from "@/lib/store";
import { WEEKDAYS } from "@/lib/types";

export default function PortalHome() {
  const customer = useCurrentCustomer()!;
  const data = useDemo();
  const now = useNow();
  const today = toISO(now);
  const hour = data.settings.deadlineHour;

  // Next delivery that actually has an order.
  let next: string | null = null;
  for (let d = today, i = 0; i < 30; d = addDays(d, 1), i++) {
    if (effectiveOrder(data, customer.id, d).order) {
      next = d;
      break;
    }
  }
  const nextOrder = next ? effectiveOrder(data, customer.id, next).order : null;
  const nextDish = next ? getMenu(data, weekStart(next), today).days[weekdayOf(next)!] : null;
  const open = firstOpenDate(now, hour);
  const ws = weekStart(open);
  const dates = weekDates(ws);
  const weekTotal = WEEKDAYS.reduce((s, wd) => s + (effectiveOrder(data, customer.id, dates[wd]).order?.total ?? 0), 0);
  const standing = standingPatternOn(data, customer.id, open);
  const invoices = data.invoices.filter((i) => i.customerId === customer.id).sort((a, b) => b.number - a.number);

  return (
    <div>
      <PageHeader title={`Hi, ${customer.contactName.split(" ")[0]}`} subtitle={`${customer.name} · ${customer.deliveryAddresses[0]?.street}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="grid sm:grid-cols-[1fr_14rem]">
            <div className="p-6">
              <p className="flex items-center gap-2 text-sm font-medium text-rosa-700">
                <Truck className="h-4 w-4" /> Next delivery
              </p>
              {next && nextOrder && nextDish ? (
                <>
                  <p className="mt-2 text-2xl font-medium text-sort-900">{fmtLong(next)}</p>
                  <p className="mt-1 text-sort-700">
                    <span className="text-3xl font-medium tabular-nums text-sort-900">{nextOrder.total}</span> portions · {nextDish.main.name}
                  </p>
                  <div className="mt-3">
                    <DeadlineStatus date={next} now={now} hour={hour} />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-gra-500">No upcoming deliveries. Place an order or set up a standing order.</p>
              )}
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/portal/order" className="inline-flex items-center gap-2 rounded-lg bg-sort-900 px-4 py-2 text-sm font-medium text-white hover:bg-sort-700">
                  Change this week <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/portal/menu" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-sort-900 ring-1 ring-gra-300 hover:bg-gra-100">
                  See the menu
                </Link>
              </div>
            </div>
            {nextDish && <DishImage dish={nextDish.main} className="hidden h-full min-h-[12rem] sm:flex" />}
          </div>
        </Card>

        <Card className="p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-gra-500">
            <Repeat className="h-4 w-4" /> Standing order
          </p>
          {standing ? (
            <>
              <p className="mt-2 text-lg font-medium text-sort-900">Active</p>
              <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className="rounded-md bg-rosa-100 py-2">
                    <p className="text-[10px] font-medium uppercase text-sort-700">{wd}</p>
                    <p className="font-medium tabular-nums text-sort-900">{standing[wd].total}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-2 text-gra-500">Not set up. Save time by ordering the same every week.</p>
          )}
          <Link href="/portal/standing" className="mt-4 inline-block text-sm font-medium text-rosa-700 hover:underline">
            {standing ? "Change standing order →" : "Set up standing order →"}
          </Link>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title={`Week of ${fmtDay(ws)}`}
            subtitle={`${weekTotal} portions · ${nok(weekTotal * priceFor(customer, data))} excl. VAT`}
            action={
              <Link href="/portal/order" className="text-sm font-medium text-rosa-700 hover:underline">
                Edit →
              </Link>
            }
          />
          <div className="divide-y divide-gra-100">
            {WEEKDAYS.map((wd) => {
              const d = dates[wd];
              const { order, source } = effectiveOrder(data, customer.id, d);
              return (
                <div key={wd} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-gra-500" />
                    <span className="w-28 text-sm font-medium text-sort-900">{fmtDay(d)}</span>
                    <span className="text-sm tabular-nums text-sort-900">{order ? `${order.total} portions` : "No delivery"}</span>
                    {source === "override" && <Badge tone="accent">Changed</Badge>}
                  </div>
                  <DeadlineStatus date={d} now={now} hour={hour} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-gra-500">
            <FileText className="h-4 w-4" /> Latest invoice
          </p>
          {invoices[0] ? (
            <>
              <p className="mt-2 text-lg font-medium text-sort-900">{nok(invoices[0].total)}</p>
              <p className="text-sm text-gra-500">
                {fmtDate(invoices[0].periodStart)} – {fmtDate(invoices[0].periodEnd)}
              </p>
              <div className="mt-2">
                <Badge tone={invoices[0].status === "paid" ? "green" : "amber"}>{invoices[0].status === "paid" ? "Paid" : `Due ${fmtDate(invoices[0].dueDate)}`}</Badge>
              </div>
            </>
          ) : (
            <p className="mt-2 text-gra-500">No invoices yet.</p>
          )}
          <Link href="/portal/history" className="mt-4 inline-block text-sm font-medium text-rosa-700 hover:underline">
            All invoices →
          </Link>
        </Card>
      </div>
    </div>
  );
}
