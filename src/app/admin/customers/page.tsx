"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Table, Td, inputCls } from "@/components/ui";
import { addDays, fmtDate, toISO } from "@/lib/dates";
import { revenueBetween } from "@/lib/metrics";
import { firstOpenDate, nok, priceFor, standingPatternOn } from "@/lib/logic";
import { frequencyLabel, segmentLabel, useT } from "@/lib/i18n";
import { useDemo, useNow } from "@/lib/store";
import { WEEKDAYS, type Customer, type DemoData, type InvoiceChannel, type InvoiceFrequency } from "@/lib/types";

function customerRevenue(data: DemoData, c: Customer, from: string, to: string) {
  // Restrict the data to one customer for the revenue helper.
  return revenueBetween({ ...data, customers: [c] }, from, to);
}

export default function CustomersPage() {
  const data = useDemo();
  const update = useDemo((s) => s.updateCustomer);
  const setActive = useDemo((s) => s.setCustomerActive);
  const updateSettings = useDemo((s) => s.updateSettings);
  const notify = useDemo((s) => s.notify);
  const { t, lang } = useT();
  const now = useNow();
  const today = toISO(now);
  const open = firstOpenDate(now, data.settings.deadlineHour);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [std, setStd] = useState(String(data.settings.standardPrice));

  const list = data.customers.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.orgNumber.includes(q));
  const sel = data.customers.find((c) => c.id === selected) ?? null;

  return (
    <div>
      <PageHeader title={t("Customers & prices", "Kunder og priser")} subtitle={`${data.customers.filter((c) => c.active).length} ${t("active customers", "aktive kunder")}`} />

      <Card className="mb-6 flex flex-wrap items-end gap-4 p-5">
        <Field label={t("Standard price per portion (NOK excl. VAT)", "Standardpris per porsjon (NOK eks. mva.)")} className="w-64">
          <input className={inputCls} inputMode="numeric" value={std} onChange={(e) => setStd(e.target.value.replace(/\D/g, ""))} />
        </Field>
        <Button
          variant="secondary"
          onClick={() => {
            updateSettings({ standardPrice: Number(std) || data.settings.standardPrice });
            notify({
              title: t("Standard price updated", "Standardpris oppdatert"),
              body: t("Applies to customers without an agreed price.", "Gjelder kunder uten avtalt pris."),
            });
          }}
        >
          {t("Update price", "Oppdater pris")}
        </Button>
        <p className="text-sm text-gra-500">{t("Customers with an agreed price keep their own price.", "Kunder med avtalt pris beholder sin egen pris.")}</p>
      </Card>

      <Card>
        <div className="border-b border-gra-300 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gra-500" />
            <input className={`${inputCls} pl-9`} placeholder={t("Search name or org. number", "Søk på navn eller org.nr.")} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <Table
          head={[t("Customer", "Kunde"), t("Segment", "Segment"), t("Standing order", "Fast bestilling"), t("Price", "Pris"), t("Invoicing", "Fakturering"), t("Last 30 days", "Siste 30 dager"), t("Status", "Status")]}
        >
          {list.map((c) => {
            const p = standingPatternOn(data, c.id, open);
            const rev = customerRevenue(data, c, addDays(today, -30), addDays(today, -1));
            return (
              <tr key={c.id} className="cursor-pointer hover:bg-krem" onClick={() => setSelected(c.id)}>
                <Td>
                  <p className="font-medium text-sort-900">{c.name}</p>
                  <p className="text-xs text-gra-500">
                    {t("Org.", "Org.nr.")} {c.orgNumber} · Tripletex #{c.tripletexId}
                  </p>
                </Td>
                <Td className="text-gra-500">{segmentLabel(c.segment, lang)}</Td>
                <Td className="tabular-nums">{p ? WEEKDAYS.map((wd) => p[wd].total).join(" / ") : <span className="text-gra-500">{t("None", "Ingen")}</span>}</Td>
                <Td className="whitespace-nowrap tabular-nums">
                  {nok(priceFor(c, data))} {c.pricePerPortion !== null && <Badge tone="blue">{t("Agreed", "Avtalt")}</Badge>}
                </Td>
                <Td className="whitespace-nowrap">
                  {frequencyLabel(c.invoiceFrequency, lang)} · {c.invoiceChannel}
                </Td>
                <Td className="whitespace-nowrap tabular-nums">{nok(rev.revenue)}</Td>
                <Td>{c.active ? <Badge tone="green">{t("Active", "Aktiv")}</Badge> : <Badge>{t("Inactive", "Inaktiv")}</Badge>}</Td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Modal open={!!sel} onClose={() => setSelected(null)} title={sel?.name ?? ""} wide>
        {sel && (
          <div className="space-y-5">
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-gra-500">{t("Contact", "Kontakt")}</p>
                <p className="text-sort-900">{sel.contactName}</p>
                <p className="text-gra-500">{sel.email}</p>
                <p className="text-gra-500">{sel.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gra-500">{t("Delivery", "Levering")}</p>
                {sel.deliveryAddresses.map((a) => (
                  <p key={a.id} className="text-sort-700">
                    {a.label}: {a.street}, {a.postcode} {a.city}
                  </p>
                ))}
                <p className="mt-1 text-gra-500">{t("Customer since", "Kunde siden")} {fmtDate(sel.createdAt)}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label={t("Agreed price (empty = standard)", "Avtalt pris (tom = standard)")}>
                <input
                  className={inputCls}
                  inputMode="numeric"
                  placeholder={String(data.settings.standardPrice)}
                  value={sel.pricePerPortion ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "");
                    update(sel.id, { pricePerPortion: v ? Number(v) : null });
                  }}
                />
              </Field>
              <Field label={t("Invoice frequency", "Fakturafrekvens")}>
                <select className={inputCls} value={sel.invoiceFrequency} onChange={(e) => update(sel.id, { invoiceFrequency: e.target.value as InvoiceFrequency })}>
                  <option value="monthly">{frequencyLabel("monthly", lang)}</option>
                  <option value="weekly">{frequencyLabel("weekly", lang)}</option>
                  <option value="agreement">{frequencyLabel("agreement", lang)}</option>
                </select>
              </Field>
              <Field label={t("Invoice format", "Fakturaformat")}>
                <select className={inputCls} value={sel.invoiceChannel} onChange={(e) => update(sel.id, { invoiceChannel: e.target.value as InvoiceChannel })}>
                  <option value="EHF">EHF</option>
                  <option value="PDF">PDF</option>
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-gra-300 pt-4">
              {sel.active ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    setActive(sel.id, false);
                    notify({
                      kind: "info",
                      title: `${sel.name} ${t("deactivated", "deaktivert")}`,
                      body: t("Future deliveries stopped. History is kept.", "Fremtidige leveranser er stoppet. Historikken beholdes."),
                    });
                  }}
                >
                  {t("Deactivate customer", "Deaktiver kunde")}
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setActive(sel.id, true)}>
                  {t("Reactivate customer", "Aktiver kunde igjen")}
                </Button>
              )}
              <Button onClick={() => setSelected(null)}>{t("Done", "Ferdig")}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
