"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Field, Modal, PageHeader, Table, Td, inputCls } from "@/components/ui";
import { addDays, fmtDate, toISO } from "@/lib/dates";
import { revenueBetween } from "@/lib/metrics";
import { firstOpenDate, nok, priceFor, standingPatternOn } from "@/lib/logic";
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
      <PageHeader title="Customers & prices" subtitle={`${data.customers.filter((c) => c.active).length} active customers`} />

      <Card className="mb-6 flex flex-wrap items-end gap-4 p-5">
        <Field label="Standard price per portion (NOK excl. VAT)" className="w-64">
          <input className={inputCls} inputMode="numeric" value={std} onChange={(e) => setStd(e.target.value.replace(/\D/g, ""))} />
        </Field>
        <Button
          variant="secondary"
          onClick={() => {
            updateSettings({ standardPrice: Number(std) || data.settings.standardPrice });
            notify({ title: "Standard price updated", body: "Applies to customers without an agreed price." });
          }}
        >
          Update price
        </Button>
        <p className="text-sm text-gray-500">Customers with an agreed price keep their own price.</p>
      </Card>

      <Card>
        <div className="border-b border-gray-100 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input className={`${inputCls} pl-9`} placeholder="Search name or org. number" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <Table head={["Customer", "Segment", "Standing order", "Price", "Invoicing", "Last 30 days", "Status"]}>
          {list.map((c) => {
            const p = standingPatternOn(data, c.id, open);
            const rev = customerRevenue(data, c, addDays(today, -30), addDays(today, -1));
            return (
              <tr key={c.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelected(c.id)}>
                <Td>
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">Org. {c.orgNumber} · Tripletex #{c.tripletexId}</p>
                </Td>
                <Td className="text-gray-600">{c.segment}</Td>
                <Td className="tabular-nums">{p ? WEEKDAYS.map((wd) => p[wd].total).join(" / ") : <span className="text-gray-400">None</span>}</Td>
                <Td className="whitespace-nowrap tabular-nums">
                  {nok(priceFor(c, data))} {c.pricePerPortion !== null && <Badge tone="blue">Agreed</Badge>}
                </Td>
                <Td className="whitespace-nowrap">
                  {c.invoiceFrequency === "agreement" ? "By agreement" : c.invoiceFrequency === "weekly" ? "Weekly" : "Monthly"} · {c.invoiceChannel}
                </Td>
                <Td className="whitespace-nowrap tabular-nums">{nok(rev.revenue)}</Td>
                <Td>{c.active ? <Badge tone="green">Active</Badge> : <Badge>Inactive</Badge>}</Td>
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
                <p className="text-xs uppercase tracking-wide text-gray-400">Contact</p>
                <p className="text-gray-900">{sel.contactName}</p>
                <p className="text-gray-600">{sel.email}</p>
                <p className="text-gray-600">{sel.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Delivery</p>
                {sel.deliveryAddresses.map((a) => (
                  <p key={a.id} className="text-gray-700">
                    {a.label}: {a.street}, {a.postcode} {a.city}
                  </p>
                ))}
                <p className="mt-1 text-gray-500">Customer since {fmtDate(sel.createdAt)}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Agreed price (empty = standard)">
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
              <Field label="Invoice frequency">
                <select className={inputCls} value={sel.invoiceFrequency} onChange={(e) => update(sel.id, { invoiceFrequency: e.target.value as InvoiceFrequency })}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="agreement">By agreement</option>
                </select>
              </Field>
              <Field label="Invoice format">
                <select className={inputCls} value={sel.invoiceChannel} onChange={(e) => update(sel.id, { invoiceChannel: e.target.value as InvoiceChannel })}>
                  <option value="EHF">EHF</option>
                  <option value="PDF">PDF</option>
                </select>
              </Field>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-4">
              {sel.active ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    setActive(sel.id, false);
                    notify({ kind: "info", title: `${sel.name} deactivated`, body: "Future deliveries stopped. History is kept." });
                  }}
                >
                  Deactivate customer
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setActive(sel.id, true)}>
                  Reactivate customer
                </Button>
              )}
              <Button onClick={() => setSelected(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
