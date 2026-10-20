"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { DateNav } from "@/components/DateNav";
import { DayEditor } from "@/components/DayEditor";
import { Badge, Button, Card, Modal, PageHeader, cx } from "@/components/ui";
import { fmtDay, fmtLong, isDeliveryDay, isLocked, toISO, weekDates, weekStart } from "@/lib/dates";
import { dietSum, effectiveOrder, emptyDay, standingPatternOn } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { WEEKDAYS, type DayOrder } from "@/lib/types";

export default function OrdersPage() {
  const data = useDemo();
  const setDayOrders = useDemo((s) => s.setDayOrders);
  const notify = useDemo((s) => s.notify);
  const { t } = useT();
  const now = useNow();
  const hour = data.settings.deadlineHour;
  const [ws, setWs] = useState(weekStart(toISO(now)));
  const dates = weekDates(ws);
  const [edit, setEdit] = useState<{ customerId: string; date: string; order: DayOrder } | null>(null);

  const customers = data.customers.filter((c) => c.active || WEEKDAYS.some((wd) => effectiveOrder(data, c.id, dates[wd]).order));
  const totals = WEEKDAYS.map((wd) => customers.reduce((s, c) => s + (effectiveOrder(data, c.id, dates[wd]).order?.total ?? 0), 0));

  const save = () => {
    if (!edit) return;
    setDayOrders(edit.customerId, { [edit.date]: edit.order.total > 0 ? edit.order : null });
    const c = data.customers.find((x) => x.id === edit.customerId);
    notify({
      title: t("Order updated by Frænd", "Bestilling endret av Frænd"),
      body: `${c?.name}, ${fmtLong(edit.date)}: ${edit.order.total} ${t("portions. Customer notified (simulated).", "porsjoner. Kunden er varslet (simulert).")}`,
    });
    setEdit(null);
  };

  return (
    <div>
      <PageHeader
        title={t("Orders", "Bestillinger")}
        subtitle={t("All customer orders for the week. Click a cell to change it, also after the deadline.", "Alle kundebestillinger for uken. Klikk på en celle for å endre den, også etter fristen.")}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <DateNav value={ws} onChange={setWs} step={7} mode="week" />
        <span className="flex items-center gap-3 text-xs text-gra-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-rosa-100 ring-1 ring-gra-300" /> {t("Standing order", "Fast bestilling")}</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-orange-50 ring-1 ring-orange-200" /> {t("Changed", "Endret")}</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> {t("Locked", "Låst")}</span>
        </span>
      </div>
      <Card className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gra-300 text-left text-xs uppercase tracking-wide text-gra-500">
              <th className="px-4 py-3 font-medium">{t("Customer", "Kunde")}</th>
              {WEEKDAYS.map((wd) => (
                <th key={wd} className="px-2 py-3 text-center font-medium">
                  <span className="flex items-center justify-center gap-1">
                    {fmtDay(dates[wd])}
                    {isLocked(dates[wd], now, hour) && <Lock className="h-3 w-3" />}
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-right font-medium">{t("Week", "Uke")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gra-100">
            {customers.map((c) => {
              const hasStanding = !!standingPatternOn(data, c.id, dates.fri);
              let week = 0;
              return (
                <tr key={c.id}>
                  <td className="whitespace-nowrap px-4 py-2">
                    <p className="font-medium text-sort-900">{c.name}</p>
                    <p className="text-xs text-gra-500">{hasStanding ? t("Standing order", "Fast bestilling") : t("Ad hoc", "Enkeltbestillinger")}
                      {!c.active && ` · ${t("inactive", "inaktiv")}`}</p>
                  </td>
                  {WEEKDAYS.map((wd) => {
                    const d = dates[wd];
                    const { order, source } = effectiveOrder(data, c.id, d);
                    week += order?.total ?? 0;
                    const closed = !isDeliveryDay(d);
                    return (
                      <td key={wd} className="px-2 py-2 text-center">
                        <button
                          disabled={closed}
                          onClick={() => setEdit({ customerId: c.id, date: d, order: structuredClone(order ?? emptyDay()) })}
                          className={cx(
                            "w-16 rounded-md py-1.5 font-medium tabular-nums ring-1 ring-inset hover:ring-2",
                            closed && "cursor-default bg-krem text-gra-300 ring-gra-300 hover:ring-1",
                            !closed && source === "override" && "bg-orange-50 text-rosa-700 ring-orange-200",
                            !closed && source === "standing" && "bg-rosa-100 text-sort-900 ring-gra-300",
                            !closed && source === "none" && "bg-white text-gra-300 ring-gra-300",
                          )}
                        >
                          {closed ? "—" : order ? order.total : "0"}
                        </button>
                        {order && dietSum(order) > 0 && <p className="mt-0.5 text-[10px] text-gra-500">{dietSum(order)} {t("special", "spesial")}</p>}
                      </td>
                    );
                  })}
                  <td className="px-4 py-2 text-right font-medium tabular-nums">{week}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gra-300 bg-krem font-medium">
              <td className="px-4 py-3">{t("Total", "Totalt")}</td>
              {totals.map((t, i) => (
                <td key={i} className="px-2 py-3 text-center tabular-nums">
                  {t}
                </td>
              ))}
              <td className="px-4 py-3 text-right tabular-nums">{totals.reduce((a, b) => a + b, 0)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit ? `${data.customers.find((c) => c.id === edit.customerId)?.name} · ${fmtLong(edit.date)}` : ""}>
        {edit && (
          <div className="space-y-4">
            {isLocked(edit.date, now, hour) && (
              <Badge tone="amber">
                <Lock className="h-3 w-3" /> {t("Locked for the customer. Frænd can still override.", "Låst for kunden. Frænd kan fortsatt overstyre.")}
              </Badge>
            )}
            <DayEditor label={t("Order", "Bestilling")} value={edit.order} onChange={(o) => setEdit({ ...edit, order: o })} />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEdit(null)}>
                {t("Cancel", "Avbryt")}
              </Button>
              <Button onClick={save} disabled={dietSum(edit.order) > edit.order.total}>
                {t("Save", "Lagre")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
