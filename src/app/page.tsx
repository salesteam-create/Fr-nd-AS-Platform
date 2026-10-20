"use client";

import Link from "next/link";
import { DishImage } from "@/components/DishImage";
import { Logo } from "@/components/Logo";
import { asset } from "@/lib/asset";
import { fmtDay, weekDates, weekStart } from "@/lib/dates";
import { dishName, useT, weekdayLabel } from "@/lib/i18n";
import { firstOpenDate, nok } from "@/lib/logic";
import { useDemo, useMenu, useNow } from "@/lib/store";
import { WEEKDAYS } from "@/lib/types";
import { LangToggle } from "@/components/LangToggle";

const btnDark = "inline-flex items-center justify-center bg-sort-900 px-8 py-3.5 text-sm font-medium uppercase tracking-caps text-white hover:bg-sort-700";
const btnLine = "inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium uppercase tracking-caps text-sort-900 ring-1 ring-inset ring-sort-900 hover:bg-gra-100";

export default function Landing() {
  const now = useNow();
  const { t, lang } = useT();
  const settings = useDemo((s) => s.settings);
  // Show the menu for the first week customers can still order for.
  const ws = weekStart(firstOpenDate(now, settings.deadlineHour));
  const menu = useMenu(ws);
  const dates = weekDates(ws);

  return (
    <div className="min-h-screen bg-krem">
      <header className="border-b border-gra-300 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6">
          <Logo width={104} sub={t("Corporate lunch", "Bedriftslunsj")} />
          <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-caps">
            <LangToggle />
            <Link href="/login" className="px-3 py-2 text-sort-900 hover:bg-gra-100">
              {t("Log in", "Logg inn")}
            </Link>
            <Link href="/register" className="bg-sort-900 px-4 py-2 text-white hover:bg-sort-700">
              {t("Get started", "Kom i gang")}
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <p className="text-xs font-medium uppercase tracking-caps text-rosa-700">{t("Corporate lunch · Stavanger region", "Bedriftslunsj · Stavanger-regionen")}</p>
          <h1 className="mt-4 text-[44px] font-medium leading-[1.1] text-sort-900 sm:text-[56px]">
            {t("Good", "God")} <span className="font-script text-[64px] font-normal leading-none text-gull-700 sm:text-[80px]">{t("lunch", "lunsj")}</span>{" "}
            {t("for your workplace, without the admin.", "på jobben, uten administrasjon.")}
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-sort-700">
            {t(
              `Order for your team in under two minutes. Set up a standing weekly order, adjust numbers until ${settings.deadlineHour}:00 the day before, and get one invoice straight into your accounting system.`,
              `Bestill til hele teamet på under to minutter. Sett opp en fast ukentlig bestilling, juster antallet frem til kl. ${settings.deadlineHour}.00 dagen før, og få én faktura rett inn i regnskapet.`,
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className={btnDark}>
              {t("Register your company →", "Registrer bedriften →")}
            </Link>
            <Link href="/login" className={btnLine}>
              {t("Log in to order", "Logg inn for å bestille")}
            </Link>
          </div>
          <p className="mt-5 text-sm text-gra-500">
            {t(`From ${nok(settings.standardPrice)} per person, excl. VAT. Delivered Monday to Friday.`, `Fra ${nok(settings.standardPrice)} per person, eks. mva. Levering mandag til fredag.`)}
          </p>
        </div>
        {/* Frame motif from the logo: a thin offset gold frame behind the photo. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -right-3 -top-3 bottom-3 left-3 border-2 border-gull-500" aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/brand/photo-01.jpg")} alt={t("Frænd staff serving a lunch plate", "Frænd-ansatt serverer en lunsjtallerken")} className="relative aspect-[4/5] w-full object-cover" />
        </div>
      </section>

      <section className="border-y border-gra-300 bg-white py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <h2 className="text-[32px] font-medium text-sort-900">{t("How it works", "Slik fungerer det")}</h2>
          <div className="mt-8 grid gap-px bg-gra-300 sm:grid-cols-3">
            {[
              { n: "01", title: t("Register your company", "Registrer bedriften"), body: t("Org. number, delivery address and invoice details. Takes a couple of minutes.", "Organisasjonsnummer, leveringsadresse og fakturainformasjon. Tar et par minutter.") },
              { n: "02", title: t("Order or set a standing order", "Bestill, eller sett opp fast bestilling"), body: t("Choose days and portions, add special diets. Standing orders repeat every week.", "Velg dager og antall porsjoner, og legg til spesialkost. Faste bestillinger gjentas hver uke.") },
              { n: "03", title: t("We cook and deliver", "Vi lager og leverer"), body: t("Fresh lunch at your door. One invoice weekly or monthly, by PDF or EHF.", "Fersk lunsj levert på døren. Én faktura i uken eller måneden, som PDF eller EHF.") },
            ].map(({ n, title, body }) => (
              <div key={n} className="bg-white p-6 sm:p-8">
                <p className="text-xs font-medium tracking-caps text-rosa-700">{n}</p>
                <h3 className="mt-3 text-[22px] font-medium text-sort-900">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-gra-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-caps text-rosa-700">{t("Weekly menu", "Ukemeny")}</p>
              <h2 className="mt-2 text-[32px] font-medium text-sort-900">{t("Week of", "Uken fra")} {fmtDay(ws)}</h2>
              <p className="mt-1 text-gra-500">{t("A main dish and a vegetarian option every day. Allergens are listed on every dish.", "En hovedrett og et vegetaralternativ hver dag. Allergener står på hver rett.")}</p>
            </div>
            <Link href="/register" className="text-xs font-medium uppercase tracking-caps text-sort-900 underline underline-offset-4 hover:text-rosa-700">
              {t("Order this week →", "Bestill denne uken →")}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="bg-white ring-1 ring-gra-300">
                <DishImage dish={menu.days[wd].main} className="aspect-[4/3]" />
                <div className="p-4">
                  <p className="text-[11px] font-medium uppercase tracking-caps text-rosa-700">
                    {weekdayLabel(wd, lang)} · {fmtDay(dates[wd]).split(" ").slice(1).join(" ")}
                  </p>
                  <p className="mt-2 font-medium leading-snug text-sort-900">{dishName(menu.days[wd].main, lang)}</p>
                  <p className="mt-2 border-t border-gra-300 pt-2 text-sm text-gra-500">
                    <span className="mr-1 text-[10px] font-medium uppercase tracking-caps text-gull-700">{t("Veg", "Vegetar")}</span> {dishName(menu.days[wd].vegetarian, lang)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-sort-900 py-16 text-white">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_2fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset("/brand/fraend-tagline.png")} alt="Vi deler smaken av inkludering" className="mx-auto w-56 lg:w-64" />
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { title: t("Every diet covered", "All spesialkost dekket"), body: t("Vegetarian, vegan, gluten-free, lactose-free and halal, counted per day.", "Vegetar, vegansk, glutenfri, laktosefri og halal, telt opp per dag.") },
              { title: t(`Change until ${settings.deadlineHour}:00`, `Endre frem til kl. ${settings.deadlineHour}.00`), body: t("Adjust numbers until midday the working day before delivery. Less waste, fair for everyone.", "Juster antallet frem til midt på dagen virkedagen før levering. Mindre matsvinn, rettferdig for alle.") },
              { title: t("Invoicing that fits", "Fakturering som passer"), body: t("Weekly or monthly invoices by PDF or EHF, straight into your accounting.", "Ukentlig eller månedlig faktura som PDF eller EHF, rett inn i regnskapet.") },
            ].map(({ title, body }) => (
              <div key={title} className="border-t-2 border-rosa-500 pt-4">
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gra-300">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-gra-500 sm:px-6">
        <span>{t("Frænd AS · Social enterprise, Stavanger · Demo prototype", "Frænd AS · Sosialt entreprenørskap, Stavanger · Demoprototype")}</span>
        <Link href="/admin" className="text-xs font-medium uppercase tracking-caps text-sort-900 hover:text-rosa-700">
          {t("Frænd staff: open admin →", "For Frænd-ansatte: åpne admin →")}
        </Link>
      </footer>
    </div>
  );
}
