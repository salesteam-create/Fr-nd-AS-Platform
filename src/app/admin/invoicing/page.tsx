"use client";

import { CheckCircle2, Eye, Loader2, Plug, RefreshCw, Send } from "lucide-react";
import { useState } from "react";
import { InvoiceStatus, InvoiceView } from "@/components/InvoiceView";
import { Badge, Button, Card, CardHeader, Modal, PageHeader, Table, Tabs, Td } from "@/components/ui";
import { addDays, fmtDate, fmtDateTime, fmtMonth, fromISO, toISO, weekNumber, weekStart } from "@/lib/dates";
import { invoiceLines, nok } from "@/lib/logic";
import { logMessage, useT } from "@/lib/i18n";
import { useDemo, useNow } from "@/lib/store";
import type { Invoice } from "@/lib/types";

type Run = "monthly" | "weekly";

export default function InvoicingPage() {
  const data = useDemo();
  const generate = useDemo((s) => s.generateInvoices);
  const send = useDemo((s) => s.sendInvoicesToTripletex);
  const syncLedger = useDemo((s) => s.syncLedger);
  const notify = useDemo((s) => s.notify);
  const { t, lang } = useT();
  const today = toISO(useNow());
  const [run, setRun] = useState<Run>("monthly");
  const [view, setView] = useState<Invoice | null>(null);

  // The most recent closed period for each invoicing run.
  const td = fromISO(today);
  const period: [string, string] =
    run === "monthly"
      ? [toISO(new Date(td.getFullYear(), td.getMonth() - 1, 1)), toISO(new Date(td.getFullYear(), td.getMonth(), 0))]
      : [addDays(weekStart(today), -7), addDays(weekStart(today), -1)];
  const periodLabel = run === "monthly" ? fmtMonth(period[0]) : `${t("Week", "Uke")} ${weekNumber(period[0])}`;

  const eligible = data.customers.filter((c) => (run === "weekly" ? c.invoiceFrequency === "weekly" : c.invoiceFrequency !== "weekly"));
  const candidates = eligible
    .map((c) => {
      const lines = invoiceLines(data, c, period[0], period[1]);
      const amount = lines.reduce((s, l) => s + l.portions * l.unitPrice, 0);
      const existing = data.invoices.find((i) => i.customerId === c.id && i.periodStart === period[0] && i.periodEnd === period[1]);
      return { c, lines, amount, existing };
    })
    .filter((x) => x.lines.length > 0);
  const toCreate = candidates.filter((x) => !x.existing);

  const pending = data.invoices.filter((i) => i.tripletexStatus !== "synced");
  const recent = [...data.invoices].sort((a, b) => b.number - a.number).slice(0, 25);
  const name = (id: string) => data.customers.find((c) => c.id === id)?.name ?? "";

  return (
    <div>
      <PageHeader
        title={t("Invoicing & Tripletex", "Fakturering og Tripletex")}
        subtitle={t("Invoices are built from delivered orders, then created and sent through Tripletex.", "Fakturaene bygges fra leverte bestillinger, og opprettes og sendes via Tripletex.")}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title={`1. ${t("Prepare invoices", "Klargjør fakturaer")} · ${periodLabel}`}
            subtitle={`${fmtDate(period[0])} – ${fmtDate(period[1])}`}
            action={<Tabs value={run} onChange={setRun} options={[{ value: "monthly", label: t("Monthly & agreement", "Månedlig og avtale") }, { value: "weekly", label: t("Weekly", "Ukentlig") }]} />}
          />
          <Table head={[t("Customer", "Kunde"), t("Deliveries", "Leveranser"), t("Portions", "Porsjoner"), t("Amount excl. VAT", "Beløp eks. mva."), t("Status", "Status")]}>
            {candidates.map(({ c, lines, amount, existing }) => (
              <tr key={c.id}>
                <Td className="font-medium text-sort-900">{c.name}</Td>
                <Td className="tabular-nums">{lines.length}</Td>
                <Td className="tabular-nums">{lines.reduce((s, l) => s + l.portions, 0)}</Td>
                <Td className="tabular-nums">{nok(amount)}</Td>
                <Td>{existing ? <InvoiceStatus inv={existing} /> : <Badge tone="amber">{t("Not invoiced", "Ikke fakturert")}</Badge>}</Td>
              </tr>
            ))}
          </Table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gra-300 p-5">
            <p className="text-sm text-gra-500">
              {toCreate.length} {t("invoice(s) to create", "faktura(er) å opprette")} · {nok(toCreate.reduce((s, x) => s + x.amount, 0))} {t("excl. VAT", "eks. mva.")}
            </p>
            <Button
              disabled={toCreate.length === 0}
              onClick={() => {
                const n = generate(toCreate.map((x) => x.c.id), period[0], period[1]);
                notify({
                  title: `${n} ${t("draft invoice(s) created", "fakturautkast opprettet")}`,
                  body: t("Review them, then send to Tripletex.", "Kontroller dem, og send dem til Tripletex."),
                });
              }}
            >
              {t("Create draft invoices", "Opprett fakturautkast")}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title={t("Tripletex connection", "Tripletex-tilkobling")} />
          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rosa-100">
                <Plug className="h-5 w-5 text-sort-700" />
              </span>
              <div>
                <p className="font-medium text-sort-900">{t("Connected (simulated)", "Tilkoblet (simulert)")}</p>
                <p className="text-xs text-gra-500">{t("Customers, invoices and ledger via the Tripletex API", "Kunder, fakturaer og reskontro via Tripletex-API-et")}</p>
              </div>
            </div>
            <ul className="space-y-1 text-sm text-gra-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sort-700" /> {t("New customers created automatically", "Nye kunder opprettes automatisk")}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sort-700" /> {t("Invoices sent as PDF or EHF", "Fakturaer sendes som PDF eller EHF")}</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-sort-700" /> {t("Payments synced back to the platform", "Innbetalinger synkroniseres tilbake til plattformen")}</li>
            </ul>
            <Button variant="secondary" className="w-full" onClick={syncLedger}>
              <RefreshCw className="h-4 w-4" /> {t("Sync customer ledger now", "Synkroniser kundereskontro nå")}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader
          title={`2. ${t("Send to Tripletex", "Send til Tripletex")} · ${pending.length} ${t("waiting", "venter")}`}
          subtitle={t("Tripletex creates the invoice and sends it by the customer's chosen channel.", "Tripletex oppretter fakturaen og sender den via kundens valgte kanal.")}
          action={
            <Button variant="accent" disabled={pending.filter((i) => i.tripletexStatus === "not_synced").length === 0} onClick={() => send(pending.filter((i) => i.tripletexStatus === "not_synced").map((i) => i.id))}>
              <Send className="h-4 w-4" /> {t("Send all to Tripletex", "Send alle til Tripletex")}
            </Button>
          }
        />
        <Table head={[t("Invoice", "Faktura"), t("Customer", "Kunde"), t("Period", "Periode"), t("Total incl. VAT", "Totalt inkl. mva."), t("Channel", "Kanal"), "Tripletex", ""]}>
          {pending.map((i) => (
            <tr key={i.id}>
              <Td className="font-medium text-sort-900">{i.number}</Td>
              <Td>{name(i.customerId)}</Td>
              <Td className="whitespace-nowrap">
                {fmtDate(i.periodStart)} – {fmtDate(i.periodEnd)}
              </Td>
              <Td className="tabular-nums">{nok(i.total)}</Td>
              <Td>
                <Badge tone="blue">{i.channel}</Badge>
              </Td>
              <Td>
                {i.tripletexStatus === "syncing" ? (
                  <Badge tone="amber">
                    <Loader2 className="h-3 w-3 animate-spin" /> {t("Sending…", "Sender…")}
                  </Badge>
                ) : (
                  <Badge>{t("Not sent", "Ikke sendt")}</Badge>
                )}
              </Td>
              <Td>
                <Button variant="ghost" size="sm" onClick={() => setView(i)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </Td>
            </tr>
          ))}
          {pending.length === 0 && (
            <tr>
              <Td className="text-gra-500">{t("Nothing waiting. All invoices are in Tripletex.", "Ingenting venter. Alle fakturaer er i Tripletex.")}</Td>
            </tr>
          )}
        </Table>
      </Card>

      <div className="mt-6 grid gap-6">
        <Card>
          <CardHeader title={t("Recent invoices", "Siste fakturaer")} />
          <Table head={[t("Invoice", "Faktura"), t("Customer", "Kunde"), t("Period", "Periode"), t("Total", "Totalt"), t("Status", "Status"), "Tripletex", ""]}>
            {recent.map((i) => (
              <tr key={i.id}>
                <Td className="font-medium text-sort-900">{i.number}</Td>
                <Td className="whitespace-nowrap">{name(i.customerId)}</Td>
                <Td className="whitespace-nowrap">
                  {fmtDate(i.periodStart)} – {fmtDate(i.periodEnd)}
                </Td>
                <Td className="tabular-nums">{nok(i.total)}</Td>
                <Td>
                  <InvoiceStatus inv={i} />
                </Td>
                <Td className="text-xs text-gra-500">{i.tripletexId ? `#${i.tripletexId}` : "–"}</Td>
                <Td>
                  <Button variant="ghost" size="sm" onClick={() => setView(i)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </Td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card>
          <CardHeader title={t("Sync log", "Synkroniseringslogg")} />
          <ul className="max-h-80 divide-y divide-gra-100 overflow-y-auto">
            {data.syncLog.map((l) => (
              <li key={l.id} className="px-5 py-3 text-sm">
                <p className="text-sort-900">{logMessage(l, lang)}</p>
                <p className="mt-0.5 text-xs text-gra-500">
                  {fmtDateTime(new Date(l.at))} · {lang === "no" ? { customer: "kunde", invoice: "faktura", ledger: "reskontro" }[l.kind] : l.kind}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view ? `${t("Invoice", "Faktura")} ${view.number}` : ""} wide>
        {view && <InvoiceView inv={data.invoices.find((i) => i.id === view.id) ?? view} customer={data.customers.find((c) => c.id === view.customerId)!} />}
      </Modal>
    </div>
  );
}
