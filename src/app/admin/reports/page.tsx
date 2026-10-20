"use client";

import { Download, Info, Printer } from "lucide-react";
import { useState } from "react";
import { Button, Card, CardHeader, PageHeader, Table, Tabs, Td } from "@/components/ui";
import { addDays, fmtMonth, fromISO, toISO } from "@/lib/dates";
import { monthlySeries } from "@/lib/metrics";
import { deliveriesOn, downloadFile, eachDay, nok, num, priceFor, toCSV } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";

export default function ReportsPage() {
  const data = useDemo();
  const today = toISO(useNow());
  const [months, setMonths] = useState<"3" | "6" | "12">("6");
  const n = Number(months);
  const series = monthlySeries(data, today, n);
  const t = fromISO(today);
  const from = toISO(new Date(t.getFullYear(), t.getMonth() - (n - 1), 1));
  const to = addDays(today, -1);

  // Per customer and per area, over the same period.
  const perCustomer = new Map<string, { name: string; portions: number; revenue: number; days: number }>();
  const perArea = new Map<string, { portions: number; stops: number }>();
  eachDay(from, to, (d) => {
    for (const r of deliveriesOn(data, d)) {
      const c = perCustomer.get(r.customer.id) ?? { name: r.customer.name, portions: 0, revenue: 0, days: 0 };
      c.portions += r.order.total;
      c.revenue += r.order.total * priceFor(r.customer, data);
      c.days++;
      perCustomer.set(r.customer.id, c);
      const a = perArea.get(r.area) ?? { portions: 0, stops: 0 };
      a.portions += r.order.total;
      a.stops++;
      perArea.set(r.area, a);
    }
  });
  const customers = [...perCustomer.values()].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = customers.reduce((s, c) => s + c.revenue, 0);
  const totalPortions = customers.reduce((s, c) => s + c.portions, 0);
  const maxRev = Math.max(1, ...series.map((s) => s.revenue));

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Revenue, lunches delivered and delivery overview. Excl. VAT."
        action={
          <>
            <Tabs value={months} onChange={setMonths} options={[{ value: "3", label: "3 months" }, { value: "6", label: "6 months" }, { value: "12", label: "12 months" }]} />
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="Revenue per month"
            subtitle={`${nok(totalRevenue)} · ${num(totalPortions)} lunches delivered`}
            action={
              <Button variant="ghost" size="sm" onClick={() => downloadFile("revenue-per-month.csv", toCSV([["Month", "Lunches", "Revenue NOK"], ...series.map((s) => [s.month.slice(0, 7), s.portions, s.revenue])]))}>
                <Download className="h-4 w-4" /> Excel / CSV
              </Button>
            }
          />
          <div className="space-y-2 p-5">
            {series.map((s) => (
              <div key={s.month} className="grid grid-cols-[5rem_1fr_7rem] items-center gap-3 text-sm">
                <span className="text-gra-500">{fmtMonth(s.month)}</span>
                <div className="h-5 rounded bg-gra-100">
                  <div className={s.partial ? "h-5 rounded bg-gull-500" : "h-5 rounded bg-sort-900"} style={{ width: `${(s.revenue / maxRev) * 100}%` }} />
                </div>
                <span className="text-right tabular-nums text-sort-900">{nok(s.revenue)}</span>
              </div>
            ))}
            <p className="pt-2 text-xs text-gra-500">Current month is to date.</p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Delivery overview by area"
            action={
              <Button variant="ghost" size="sm" onClick={() => downloadFile("delivery-by-area.csv", toCSV([["Area", "Stops", "Lunches"], ...[...perArea.entries()].map(([a, v]) => [a, v.stops, v.portions])]))}>
                <Download className="h-4 w-4" /> CSV
              </Button>
            }
          />
          <Table head={["Area", "Stops", "Lunches", "Share"]}>
            {[...perArea.entries()]
              .sort((a, b) => b[1].portions - a[1].portions)
              .map(([area, v]) => (
                <tr key={area}>
                  <Td className="font-medium text-sort-900">{area}</Td>
                  <Td className="tabular-nums">{num(v.stops)}</Td>
                  <Td className="tabular-nums">{num(v.portions)}</Td>
                  <Td className="tabular-nums">{totalPortions ? Math.round((v.portions / totalPortions) * 100) : 0}%</Td>
                </tr>
              ))}
          </Table>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Revenue per customer"
            subtitle={`${fmtMonth(from)} to date`}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadFile("revenue-per-customer.csv", toCSV([["Customer", "Deliveries", "Lunches", "Revenue NOK"], ...customers.map((c) => [c.name, c.days, c.portions, c.revenue])]))}
              >
                <Download className="h-4 w-4" /> Excel / CSV
              </Button>
            }
          />
          <Table head={["Customer", "Deliveries", "Lunches", "Avg. per delivery", "Revenue", "Share"]}>
            {customers.map((c) => (
              <tr key={c.name}>
                <Td className="font-medium text-sort-900">{c.name}</Td>
                <Td className="tabular-nums">{num(c.days)}</Td>
                <Td className="tabular-nums">{num(c.portions)}</Td>
                <Td className="tabular-nums">{(c.portions / c.days).toFixed(1)}</Td>
                <Td className="tabular-nums">{nok(c.revenue)}</Td>
                <Td className="tabular-nums">{totalRevenue ? ((c.revenue / totalRevenue) * 100).toFixed(1) : 0}%</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card className="flex items-start gap-3 p-5 xl:col-span-2">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div className="text-sm text-gra-500">
            <p className="font-medium text-sort-900">Customer profitability</p>
            <p className="mt-1">Planned for a later phase. It needs cost per portion and delivery cost per area, which Frænd would provide (BRD Q8).</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
