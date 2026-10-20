"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { asset } from "@/lib/asset";
import { fmtDateTime, fmtDay, fmtLong } from "@/lib/dates";
import { useT, weekdayLabel, type Lang } from "@/lib/i18n";
import { useDemo } from "@/lib/store";
import { WEEKDAYS, type Customer, type SimEmail } from "@/lib/types";

type T = (en: string, no: string) => string;

export function emailSubject(e: SimEmail, t: T): string {
  switch (e.kind) {
    case "welcome":
      return t("Welcome to Frænd corporate lunch", "Velkommen til Frænd bedriftslunsj");
    case "order_confirmation":
      return t("Your lunch order is updated", "Lunsjbestillingen din er oppdatert");
    case "standing_confirmation":
      return e.pattern
        ? t("Your standing order is confirmed", "Den faste bestillingen din er bekreftet")
        : t("Your standing order is paused", "Den faste bestillingen din er satt på pause");
    case "closure_notice":
      return t(`No delivery on ${fmtLong(e.date!)}`, `Ingen levering ${fmtLong(e.date!)}`);
    case "fraend_change":
      return t("Frænd has updated your order", "Frænd har endret bestillingen din");
  }
}

/** Global modal showing the simulated email selected with openEmail(id). */
export function EmailPreview() {
  const id = useDemo((s) => s.openEmailId);
  const email = useDemo((s) => s.emails.find((e) => e.id === s.openEmailId));
  const customer = useDemo((s) => s.customers.find((c) => c.id === email?.customerId));
  const hour = useDemo((s) => s.settings.deadlineHour);
  const close = useDemo((s) => s.openEmail);
  const { t, lang } = useT();
  if (!id || !email || !customer) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-sort-900/50 sm:items-center sm:p-4" onClick={() => close(null)}>
      <div
        className="max-h-[92vh] w-full overflow-y-auto bg-white shadow-card sm:max-w-xl"
        onClick={(ev) => ev.stopPropagation()}
        role="dialog"
        aria-label={emailSubject(email, t)}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gra-300 bg-gra-100 px-5 py-4 text-sm">
          <dl className="grid grid-cols-[4rem_1fr] gap-y-1">
            <dt className="text-gra-500">{t("From", "Fra")}</dt>
            <dd className="text-sort-900">Frænd Bedriftslunsj &lt;lunsj@fraend.no&gt;</dd>
            <dt className="text-gra-500">{t("To", "Til")}</dt>
            <dd className="text-sort-900">{email.to}</dd>
            <dt className="text-gra-500">{t("Subject", "Emne")}</dt>
            <dd className="font-medium text-sort-900">{emailSubject(email, t)}</dd>
            <dt className="text-gra-500">{t("Date", "Dato")}</dt>
            <dd className="text-sort-700">{fmtDateTime(new Date(email.at))}</dd>
          </dl>
          <button onClick={() => close(null)} aria-label={t("Close", "Lukk")} className="p-1 text-gra-500 hover:bg-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-8 sm:px-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/brand/fraend-logo.png")} alt="Frænd" className="w-24" />
          <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-sort-700">
            <p>{t(`Hi ${firstName(customer)},`, `Hei ${firstName(customer)},`)}</p>
            <Body email={email} customer={customer} hour={hour} t={t} lang={lang} />
          </div>
          <Link
            href="/portal"
            onClick={() => close(null)}
            className="mt-8 inline-block bg-sort-900 px-6 py-3 text-xs font-medium uppercase tracking-caps text-white hover:bg-sort-700"
          >
            {t("Open the portal", "Åpne portalen")}
          </Link>
          <p className="mt-8 text-[15px] text-sort-700">
            {t("Best regards,", "Vennlig hilsen")}
            <br />
            Frænd
          </p>
          <p className="mt-1 text-sm text-gull-700">{t("We share the taste of inclusion", "Vi deler smaken av inkludering")}</p>
        </div>

        <p className="border-t border-gra-300 bg-krem px-6 py-3 text-xs text-gra-500">
          {t("Simulated email for the demo. Nothing was sent.", "Simulert e-post i demoen. Ingenting ble sendt.")}
        </p>
      </div>
    </div>
  );
}

const firstName = (c: Customer) => c.contactName.split(" ")[0];

function Body({ email, customer, hour, t, lang }: { email: SimEmail; customer: Customer; hour: number; t: T; lang: Lang }) {
  const deadline = (
    <p className="text-sm text-gra-500">
      {t(
        `You can change your orders until ${hour}:00 the working day before delivery.`,
        `Du kan endre bestillingene dine frem til kl. ${hour}.00 virkedagen før levering.`,
      )}
    </p>
  );
  const portions = (n: number) => (n === 0 ? t("no delivery", "ingen levering") : `${n} ${t("portions", "porsjoner")}`);
  const changeList = (
    <ul className="divide-y divide-gra-100 border-y border-gra-300">
      {(email.changes ?? []).map((c) => (
        <li key={c.date} className="flex flex-wrap justify-between gap-2 py-2.5 text-sort-900">
          <span>{fmtDay(c.date)}</span>
          <span className="tabular-nums">
            <span className="text-gra-500">{portions(c.before)}</span> → <span className="font-medium">{portions(c.after)}</span>
          </span>
        </li>
      ))}
    </ul>
  );

  switch (email.kind) {
    case "welcome":
      return (
        <>
          <p>
            {t(
              `Thank you for registering ${customer.name}. Your account is ready, and you can order lunch for your team straight away.`,
              `Takk for at du registrerte ${customer.name}. Kontoen er klar, og du kan bestille lunsj til teamet ditt med en gang.`,
            )}
          </p>
          <p>
            {t(
              "Most companies set up a standing order with their usual numbers. We repeat it every week, and you can still change single days.",
              "De fleste bedrifter setter opp en fast bestilling med vanlig antall. Vi gjentar den hver uke, og du kan fortsatt endre enkeltdager.",
            )}
          </p>
          {deadline}
        </>
      );
    case "order_confirmation":
      return (
        <>
          <p>{t("We have received your changes. This is your updated order:", "Vi har mottatt endringene dine. Slik ser bestillingen ut nå:")}</p>
          {changeList}
          {deadline}
        </>
      );
    case "fraend_change":
      return (
        <>
          <p>
            {t(
              "We have made a change to your order, as agreed with you. This is the updated order:",
              "Vi har gjort en endring i bestillingen din, etter avtale med deg. Slik ser bestillingen ut nå:",
            )}
          </p>
          {changeList}
          <p className="text-sm text-gra-500">
            {t("If something doesn't look right, just reply to this email.", "Hvis noe ikke stemmer, kan du bare svare på denne e-posten.")}
          </p>
        </>
      );
    case "standing_confirmation":
      return email.pattern ? (
        <>
          <p>
            {t(
              `Your standing order starts ${fmtLong(email.from!)} and repeats automatically every week:`,
              `Den faste bestillingen starter ${fmtLong(email.from!)} og gjentas automatisk hver uke:`,
            )}
          </p>
          <ul className="divide-y divide-gra-100 border-y border-gra-300">
            {WEEKDAYS.map((wd, i) => (
              <li key={wd} className="flex justify-between py-2 text-sort-900">
                <span>{weekdayLabel(wd, lang)}</span>
                <span className="tabular-nums">{portions(email.pattern![i])}</span>
              </li>
            ))}
          </ul>
          <p>{t("Public holidays and closure days are skipped automatically.", "Helligdager og stengte dager hoppes over automatisk.")}</p>
          {deadline}
        </>
      ) : (
        <>
          <p>
            {t(
              `Your standing order is paused from ${fmtLong(email.from!)}. There are no automatic deliveries until you start it again.`,
              `Den faste bestillingen er satt på pause fra ${fmtLong(email.from!)}. Det blir ingen automatiske leveranser før du starter den igjen.`,
            )}
          </p>
          <p>{t("You can still order lunch for single days in the portal.", "Du kan fortsatt bestille lunsj for enkeltdager i portalen.")}</p>
        </>
      );
    case "closure_notice":
      return (
        <>
          <p>
            {t(
              `Our kitchen is closed on ${fmtLong(email.date!)} (${email.reason}). Your ${email.portions} portions for that day will not be delivered, and you will not be invoiced for them.`,
              `Kjøkkenet vårt er stengt ${fmtLong(email.date!)} (${email.reason}). De ${email.portions} porsjonene dine den dagen blir ikke levert, og du blir ikke fakturert for dem.`,
            )}
          </p>
          <p>
            {t(
              "Your standing order continues as normal from the next delivery day. You don't need to do anything.",
              "Den faste bestillingen fortsetter som vanlig fra neste leveringsdag. Du trenger ikke gjøre noe.",
            )}
          </p>
        </>
      );
  }
}
