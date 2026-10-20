"use client";

import { Download, MapPin, Phone, Printer } from "lucide-react";
import { DateNav } from "@/components/DateNav";
import { Badge, Button, Card, CardHeader, PageHeader } from "@/components/ui";
import { addDays, nextDeliveryDay, toISO } from "@/lib/dates";
import { deliveriesOn, downloadFile, toCSV } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";
import { useDateParam } from "@/lib/useDateParam";
import { DIET_KEYS, DIET_LABEL } from "@/lib/types";

export default function DeliveryPage() {
  const data = useDemo();
  const today = toISO(useNow());
  const [date, setDate] = useDateParam(nextDeliveryDay(addDays(today, 1)));
  const rows = deliveriesOn(data, date);
  const areas = [...new Set(rows.map((r) => r.area))].sort();

  const exportCsv = () =>
    downloadFile(
      `delivery-${date}.csv`,
      toCSV([
        ["Area", "Company", "Contact", "Address", "Phone", "Portions", "Special diets", "Comment"],
        ...rows.map((r) => {
          const a = r.customer.deliveryAddresses[0];
          return [
            r.area,
            r.customer.name,
            r.customer.contactName,
            `${a.street}, ${a.postcode} ${a.city}`,
            r.customer.phone,
            r.order.total,
            DIET_KEYS.filter((k) => r.order.diets[k] > 0).map((k) => `${r.order.diets[k]} ${DIET_LABEL[k]}`).join("; "),
            r.order.comment ?? "",
          ];
        }),
      ]),
    );

  return (
    <div>
      <PageHeader
        title="Delivery list"
        subtitle={`${rows.length} stops · ${rows.reduce((s, r) => s + r.order.total, 0)} portions`}
        action={
          <>
            <Button variant="secondary" onClick={exportCsv}>
              <Download className="h-4 w-4" /> CSV
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          </>
        }
      />
      <div className="mb-6 print:hidden">
        <DateNav value={date} onChange={setDate} />
      </div>
      <div className="space-y-6">
        {areas.map((area) => (
          <Card key={area}>
            <CardHeader title={area} subtitle={`${rows.filter((r) => r.area === area).length} stops`} />
            <div className="divide-y divide-gra-100">
              {rows
                .filter((r) => r.area === area)
                .map((r) => {
                  const a = r.customer.deliveryAddresses[0];
                  return (
                    <div key={r.customer.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_6rem_1fr]">
                      <div>
                        <p className="font-medium text-sort-900">{r.customer.name}</p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-gra-500">
                          <MapPin className="h-3.5 w-3.5" /> {a.street}, {a.postcode} {a.city}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gra-500">
                          <Phone className="h-3.5 w-3.5" /> {r.customer.contactName} ·{" "}
                          <a className="text-sort-900 underline" href={`tel:${r.customer.phone.replace(/\s/g, "")}`}>
                            {r.customer.phone}
                          </a>
                        </p>
                      </div>
                      <p className="text-3xl font-medium tabular-nums text-sort-900">{r.order.total}</p>
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {DIET_KEYS.filter((k) => r.order.diets[k] > 0).map((k) => (
                            <Badge key={k} tone="green">
                              {r.order.diets[k]} {DIET_LABEL[k].toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                        {r.order.comment && <p className="text-sm italic text-gra-500">“{r.order.comment}”</p>}
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        ))}
        {rows.length === 0 && <Card className="p-8 text-center text-gra-500">No deliveries on this day.</Card>}
      </div>
    </div>
  );
}
