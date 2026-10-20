"use client";

import { Download, Printer } from "lucide-react";
import { useState } from "react";
import { DateNav } from "@/components/DateNav";
import { DeadlineStatus } from "@/components/DeadlineStatus";
import { Badge, Button, Card, CardHeader, PageHeader, Table, Tabs, Td } from "@/components/ui";
import { addDays, isLocked, nextDeliveryDay, toISO } from "@/lib/dates";
import { deliveriesOn, dietSum, downloadFile, productionFor, toCSV } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";
import { useDateParam } from "@/lib/useDateParam";
import { allergenList, dietLabel, useT } from "@/lib/i18n";
import { DIET_KEYS } from "@/lib/types";

export default function ProductionPage() {
  const data = useDemo();
  const { t, lang } = useT();
  const now = useNow();
  const today = toISO(now);
  const hour = data.settings.deadlineHour;
  const [date, setDate] = useDateParam(nextDeliveryDay(addDays(today, 1)));
  const [tab, setTab] = useState<"production" | "packing">("production");

  const lines = productionFor(data, date, today, lang);
  const rows = deliveriesOn(data, date).sort((a, b) => b.order.total - a.order.total);
  const total = rows.reduce((s, r) => s + r.order.total, 0);
  const locked = isLocked(date, now, hour);

  const exportCsv = () => {
    if (tab === "production") {
      downloadFile(`production-${date}.csv`, toCSV([[t("Item", "Vare"), t("Portions", "Porsjoner")], ...lines.map((l) => [l.label, l.portions])]));
    } else {
      downloadFile(
        `packing-${date}.csv`,
        toCSV([[t("Company", "Bedrift"), t("Total", "Totalt"), ...DIET_KEYS.map((k) => dietLabel(k, lang)), t("Comment", "Kommentar")], ...rows.map((r) => [r.customer.name, r.order.total, ...DIET_KEYS.map((k) => r.order.diets[k]), r.order.comment ?? ""])]),
      );
    }
  };

  return (
    <div>
      <PageHeader
        title={t("Production & packing", "Produksjon og pakking")}
        subtitle={t("Updates automatically from customer orders. Final once the deadline has passed.", "Oppdateres automatisk fra kundenes bestillinger. Endelig når fristen har passert.")}
        action={
          <>
            <Button variant="secondary" onClick={exportCsv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> {t("Print", "Skriv ut")}
            </Button>
          </>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-3 print:hidden">
        <DateNav value={date} onChange={setDate} />
        {locked ? <Badge tone="green">{t("Final", "Endelig")}</Badge> : <DeadlineStatus date={date} now={now} hour={hour} />}
        <div className="ml-auto">
          <Tabs value={tab} onChange={setTab} options={[{ value: "production", label: t("Production list", "Produksjonsliste") }, { value: "packing", label: t("Packing list", "Pakkeliste") }]} />
        </div>
      </div>

      {tab === "production" ? (
        <Card>
          <CardHeader
            title={`${t("Production list", "Produksjonsliste")} · ${total} ${t("portions", "porsjoner")}`}
            subtitle={locked ? t("Orders are locked. These numbers are final.", "Bestillingene er låst. Tallene er endelige.") : t("Preliminary. Customers can still change orders.", "Foreløpig. Kundene kan fortsatt endre bestillinger.")}
          />
          <Table head={[t("Item", "Vare"), t("Portions", "Porsjoner"), t("Allergens", "Allergener")]}>
            {lines.map((l) => (
              <tr key={l.key} className={l.portions === 0 ? "opacity-40" : ""}>
                <Td className={l.dish ? "font-medium text-sort-900" : "pl-8"}>
                  {l.label}
                  {l.notes && l.notes.length > 0 && (
                    <ul className="mt-1 text-xs font-normal text-gra-500">
                      {l.notes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  )}
                </Td>
                <Td className="text-lg font-medium tabular-nums text-sort-900">{l.portions}</Td>
                <Td className="text-xs text-gra-500">{l.dish && allergenList(l.dish.allergens, lang)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title={`${t("Packing list", "Pakkeliste")} · ${rows.length} ${t("customers", "kunder")}`}
            subtitle={t("Portions per company, with special diets packed and labelled separately", "Porsjoner per bedrift. Spesialkost pakkes og merkes separat")}
          />
          <Table head={[t("Company", "Bedrift"), t("Total", "Totalt"), t("Regular", "Vanlig"), t("Special diets", "Spesialkost"), t("Comment", "Kommentar")]}>
            {rows.map((r) => (
              <tr key={r.customer.id}>
                <Td className="font-medium text-sort-900">{r.customer.name}</Td>
                <Td className="text-lg font-medium tabular-nums text-sort-900">{r.order.total}</Td>
                <Td className="tabular-nums">{r.order.total - dietSum(r.order)}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {DIET_KEYS.filter((k) => r.order.diets[k] > 0).map((k) => (
                      <Badge key={k} tone="green">
                        {r.order.diets[k]} {dietLabel(k, lang).toLowerCase()}
                        {k === "other" && r.order.otherNote ? ` (${r.order.otherNote})` : ""}
                      </Badge>
                    ))}
                  </div>
                </Td>
                <Td className="text-xs text-gra-500">{r.order.comment}</Td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <Td className="text-gra-500">{t("No orders for this day.", "Ingen bestillinger denne dagen.")}</Td>
              </tr>
            )}
          </Table>
        </Card>
      )}
    </div>
  );
}
