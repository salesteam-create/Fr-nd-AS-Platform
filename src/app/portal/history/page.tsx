"use client";

import { Eye, Printer } from "lucide-react";
import { useState } from "react";
import { InvoiceStatus, InvoiceView } from "@/components/InvoiceView";
import { Button, Card, CardHeader, Modal, PageHeader, Table, Td } from "@/components/ui";
import { addDays, fmtDate, fmtDay, toISO, weekDates, weekNumber, weekStart } from "@/lib/dates";
import { effectiveOrder, nok, priceFor } from "@/lib/logic";
import { useCurrentCustomer, useDemo, useNow } from "@/lib/store";
import { WEEKDAYS, type Invoice } from "@/lib/types";
import { frequencyLabel, useT, weekdayShort } from "@/lib/i18n";

export default function HistoryPage() {
  const customer = useCurrentCustomer()!;
  const data = useDemo();
  const now = useNow();
  const thisWeek = weekStart(toISO(now));
  const [open, setOpen] = useState<Invoice | null>(null);
  const price = priceFor(customer, data);
  const { t, lang } = useT();

  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisWeek, -7 * (i + 1)));
  const invoices = data.invoices.filter((i) => i.customerId === customer.id && i.status !== "draft").sort((a, b) => b.number - a.number);

  return (
    <div>
      <PageHeader title={t("History & invoices", "Historikk og fakturaer")} subtitle={t("Delivered orders and invoices for your company.", "Leverte bestillinger og fakturaer for bedriften din.")} />
      <div className="grid gap-6">
        <Card>
          <CardHeader
            title={t("Invoices", "Fakturaer")}
            subtitle={`${t("Sent as", "Sendes som")} ${customer.invoiceChannel}, ${frequencyLabel(customer.invoiceFrequency, lang).toLowerCase()}`}
          />
          <Table head={[t("Invoice", "Faktura"), t("Period", "Periode"), t("Portions", "Porsjoner"), t("Total incl. VAT", "Totalt inkl. mva."), t("Status", "Status"), ""]}>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <Td className="font-medium text-sort-900">{inv.number}</Td>
                <Td>
                  {fmtDate(inv.periodStart)} – {fmtDate(inv.periodEnd)}
                </Td>
                <Td className="tabular-nums">{inv.lines.reduce((s, l) => s + l.portions, 0)}</Td>
                <Td className="tabular-nums">{nok(inv.total)}</Td>
                <Td>
                  <InvoiceStatus inv={inv} />
                </Td>
                <Td>
                  <Button variant="ghost" size="sm" onClick={() => setOpen(inv)}>
                    <Eye className="h-4 w-4" /> {t("View", "Vis")}
                  </Button>
                </Td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <Td className="text-gra-500">{t("No invoices yet.", "Ingen fakturaer ennå.")}</Td>
              </tr>
            )}
          </Table>
        </Card>

        <Card>
          <CardHeader title={t("Delivered orders", "Leverte bestillinger")} subtitle={t("The last eight weeks", "De siste åtte ukene")} />
          <Table head={[t("Week", "Uke"), ...WEEKDAYS.map((w) => weekdayShort(w, lang)), t("Total", "Totalt"), t("Amount excl. VAT", "Beløp eks. mva.")]}>
            {weeks.map((ws) => {
              const dates = weekDates(ws);
              const counts = WEEKDAYS.map((wd) => effectiveOrder(data, customer.id, dates[wd]).order?.total ?? 0);
              const total = counts.reduce((a, b) => a + b, 0);
              return (
                <tr key={ws}>
                  <Td className="whitespace-nowrap font-medium text-sort-900">
                    {t("Week", "Uke")} {weekNumber(ws)} <span className="font-normal text-gra-500">· {fmtDay(ws)}</span>
                  </Td>
                  {counts.map((c, i) => (
                    <Td key={i} className="tabular-nums">
                      {c || "–"}
                    </Td>
                  ))}
                  <Td className="font-medium tabular-nums">{total}</Td>
                  <Td className="tabular-nums">{nok(total * price)}</Td>
                </tr>
              );
            })}
          </Table>
        </Card>
      </div>

      <Modal open={!!open} onClose={() => setOpen(null)} title={open ? `${t("Invoice", "Faktura")} ${open.number}` : ""} wide>
        {open && (
          <>
            <InvoiceView inv={open} customer={customer} />
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => window.print()}>
                <Printer className="h-4 w-4" /> {t("Print / save as PDF", "Skriv ut / lagre som PDF")}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
