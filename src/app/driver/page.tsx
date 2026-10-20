"use client";

import { Check, ChevronLeft, ChevronRight, MapPin, Navigation, Phone, RotateCcw, User } from "lucide-react";
import Link from "next/link";
import { LangToggle } from "@/components/LangToggle";
import { Logo } from "@/components/Logo";
import { Badge, cx } from "@/components/ui";
import { addDays, fmtLong, holidayName, nextDeliveryDay, toISO, weekdayOf } from "@/lib/dates";
import { dietLabel, useT } from "@/lib/i18n";
import { deliveriesOn } from "@/lib/logic";
import { useDemo, useNow } from "@/lib/store";
import { useDateParam } from "@/lib/useDateParam";
import { DIET_KEYS } from "@/lib/types";

/** Phone-first delivery run for drivers (FR-62): stops by area, call, map, tick off. */
export default function DriverPage() {
  const data = useDemo();
  const toggleDelivered = useDemo((s) => s.toggleDelivered);
  const { t, lang } = useT();
  const today = toISO(useNow());
  const [date, setDate] = useDateParam(nextDeliveryDay(today));

  const move = (dir: 1 | -1) => {
    let d = addDays(date, dir);
    while (!weekdayOf(d)) d = addDays(d, dir);
    setDate(d);
  };

  const rows = deliveriesOn(data, date).sort((a, b) => a.area.localeCompare(b.area) || a.customer.name.localeCompare(b.customer.name));
  const delivered = new Set(data.delivered[date] ?? []);
  const done = rows.filter((r) => delivered.has(r.customer.id)).length;
  const portions = rows.reduce((s, r) => s + r.order.total, 0);
  const areas = [...new Set(rows.map((r) => r.area))];
  const closed = holidayName(date);
  const areaLabel = (a: string) => (a === "Outside areas" ? t("Outside areas", "Utenfor områder") : a);

  return (
    <div className="min-h-screen bg-krem pb-28">
      <header className="sticky top-10 z-20 border-b border-gra-300 bg-white">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Logo href="/admin/delivery" width={84} sub={t("Driver", "Sjåfør")} />
          <LangToggle />
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-gra-100 px-2 py-1.5">
          <button onClick={() => move(-1)} aria-label={t("Previous day", "Forrige dag")} className="flex h-11 w-11 items-center justify-center text-sort-900 hover:bg-gra-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 text-center">
            <p className="truncate text-[15px] font-medium text-sort-900">{fmtLong(date)}</p>
            {date === today && <p className="text-[10px] font-medium uppercase tracking-caps text-rosa-700">{t("Today", "I dag")}</p>}
          </div>
          <button onClick={() => move(1)} aria-label={t("Next day", "Neste dag")} className="flex h-11 w-11 items-center justify-center text-sort-900 hover:bg-gra-100">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 pt-5">
        {rows.length > 0 && (
          <section className="bg-white p-4 ring-1 ring-gra-300">
            <div className="flex items-end justify-between gap-3">
              <p className="text-[15px] text-sort-900">
                <span className="text-2xl font-medium tabular-nums">{done}</span> {t(`of ${rows.length} stops delivered`, `av ${rows.length} stopp levert`)}
              </p>
              <p className="text-right text-sm text-gra-500">
                <span className="font-medium tabular-nums text-sort-900">{portions}</span> {t("portions", "porsjoner")}
              </p>
            </div>
            <div className="mt-3 h-1.5 bg-gra-100" role="progressbar" aria-valuemin={0} aria-valuemax={rows.length} aria-valuenow={done}>
              <div className="h-1.5 bg-rosa-500 transition-all" style={{ width: `${rows.length ? (done / rows.length) * 100 : 0}%` }} />
            </div>
          </section>
        )}

        {closed && (
          <div className="mt-5 bg-gull-100 p-4 text-sm text-sort-900 ring-1 ring-gull-300">
            {t("Closed", "Stengt")}: {closed}. {t("No deliveries today.", "Ingen leveringer denne dagen.")}
          </div>
        )}

        {!closed && rows.length === 0 && (
          <div className="mt-5 bg-white p-8 text-center text-gra-500 ring-1 ring-gra-300">{t("No deliveries on this day.", "Ingen leveringer denne dagen.")}</div>
        )}

        {areas.map((area) => (
          <section key={area} className="mt-6">
            <h2 className="mb-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-caps text-gra-500">
              <span>{areaLabel(area)}</span>
              <span>
                {rows.filter((r) => r.area === area && delivered.has(r.customer.id)).length}/{rows.filter((r) => r.area === area).length}
              </span>
            </h2>
            <div className="space-y-3">
              {rows
                .filter((r) => r.area === area)
                .map((r) => {
                  const a = r.customer.deliveryAddresses[0];
                  const address = `${a.street}, ${a.postcode} ${a.city}`;
                  const isDone = delivered.has(r.customer.id);
                  const diets = DIET_KEYS.filter((k) => r.order.diets[k] > 0);

                  if (isDone) {
                    return (
                      <div key={r.customer.id} className="flex items-center gap-3 bg-gra-100 px-4 py-3 ring-1 ring-gra-300">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-sort-900 text-white">
                          <Check className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gra-500 line-through">{r.customer.name}</p>
                          <p className="text-xs font-medium uppercase tracking-caps text-gronn-600">
                            {t("Delivered", "Levert")} · {r.order.total} {t("portions", "porsjoner")}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleDelivered(date, r.customer.id)}
                          className="flex h-11 shrink-0 items-center gap-1 px-3 text-xs font-medium uppercase tracking-caps text-sort-900 hover:bg-white"
                        >
                          <RotateCcw className="h-4 w-4" /> {t("Undo", "Angre")}
                        </button>
                      </div>
                    );
                  }

                  return (
                    <article key={r.customer.id} className="bg-white ring-1 ring-gra-300">
                      <div className="flex gap-3 p-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-medium leading-snug text-sort-900">{r.customer.name}</h3>
                          <p className="mt-1 flex items-start gap-1.5 text-[15px] text-sort-700">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {address}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gra-500">
                            <User className="h-4 w-4 shrink-0" /> {r.customer.contactName}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-4xl font-medium leading-none tabular-nums text-sort-900">{r.order.total}</p>
                          <p className="mt-1 text-[10px] font-medium uppercase tracking-caps text-gra-500">{t("portions", "porsjoner")}</p>
                        </div>
                      </div>
                      {(diets.length > 0 || r.order.comment) && (
                        <div className="space-y-2 px-4 pb-4">
                          {diets.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {diets.map((k) => (
                                <Badge key={k} tone="green">
                                  {r.order.diets[k]} {dietLabel(k, lang).toLowerCase()}
                                  {k === "other" && r.order.otherNote ? ` (${r.order.otherNote})` : ""}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {r.order.comment && <p className="border-l-2 border-rosa-500 bg-rosa-100 px-3 py-2 text-sm text-sort-900">“{r.order.comment}”</p>}
                        </div>
                      )}
                      <div className="grid grid-cols-2 border-t border-gra-300">
                        <a
                          href={`tel:${r.customer.phone.replace(/\s/g, "")}`}
                          className="flex h-12 items-center justify-center gap-2 border-r border-gra-300 text-xs font-medium uppercase tracking-caps text-sort-900 hover:bg-gra-100"
                        >
                          <Phone className="h-4 w-4" /> {t("Call", "Ring")}
                        </a>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-12 items-center justify-center gap-2 text-xs font-medium uppercase tracking-caps text-sort-900 hover:bg-gra-100"
                        >
                          <Navigation className="h-4 w-4" /> {t("Map", "Kart")}
                        </a>
                      </div>
                      <button
                        onClick={() => toggleDelivered(date, r.customer.id)}
                        className={cx("flex h-12 w-full items-center justify-center gap-2 bg-sort-900 text-[13px] font-medium uppercase tracking-caps text-white hover:bg-sort-700")}
                      >
                        <Check className="h-4 w-4" /> {t("Mark delivered", "Marker som levert")}
                      </button>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}

        <p className="mt-8 text-center text-xs text-gra-500">
          <Link href="/admin/delivery" className="underline underline-offset-4 hover:text-sort-900">
            {t("Back to admin delivery list", "Tilbake til leveringslisten i admin")}
          </Link>
        </p>
      </main>
    </div>
  );
}
