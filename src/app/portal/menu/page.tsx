"use client";

import { useState } from "react";
import { DishCard } from "@/components/DishCard";
import { Card, PageHeader, Tabs } from "@/components/ui";
import { addDays, fmtDay, holidayName, toISO, weekDates, weekNumber, weekStart } from "@/lib/dates";
import { useMenu, useNow } from "@/lib/store";
import { WEEKDAYS } from "@/lib/types";
import { useT } from "@/lib/i18n";

export default function MenuPage() {
  const now = useNow();
  const { t } = useT();
  const thisWeek = weekStart(toISO(now));
  const [ws, setWs] = useState(thisWeek);
  const menu = useMenu(ws);
  const dates = weekDates(ws);
  const weeks = [0, 1, 2].map((i) => addDays(thisWeek, 7 * i));

  return (
    <div>
      <PageHeader
        title={t(`Menu · week ${weekNumber(ws)}`, `Meny · uke ${weekNumber(ws)}`)}
        subtitle={t(
          "A main dish and a vegetarian option every day. Special diets are prepared as variants of these dishes.",
          "En hovedrett og et vegetaralternativ hver dag. Spesialkost lages som varianter av disse rettene.",
        )}
        action={<Tabs value={ws} onChange={setWs} options={weeks.map((w, i) => ({ value: w, label: i === 0 ? t("This week", "Denne uken") : i === 1 ? t("Next week", "Neste uke") : t(`Week ${weekNumber(w)}`, `Uke ${weekNumber(w)}`) }))} />}
      />
      {!menu.published ? (
        <Card className="p-8 text-center text-gra-500">{t("The menu for this week is not published yet. Check back soon.", "Menyen for denne uken er ikke publisert ennå. Se innom igjen snart.")}</Card>
      ) : (
        <div className="grid gap-4">
          {WEEKDAYS.map((wd) => (
            <Card key={wd} className="p-5">
              <p className="mb-4 text-lg font-medium text-sort-900">{fmtDay(dates[wd])}</p>
              {holidayName(dates[wd]) ? (
                <p className="text-sm text-gra-500">{t("Closed", "Stengt")} · {holidayName(dates[wd])}</p>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  <DishCard dish={menu.days[wd].main} kind="Main" />
                  <DishCard dish={menu.days[wd].vegetarian} kind="Vegetarian" />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
