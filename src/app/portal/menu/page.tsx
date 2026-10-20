"use client";

import { useState } from "react";
import { DishCard } from "@/components/DishCard";
import { Card, PageHeader, Tabs } from "@/components/ui";
import { addDays, fmtDay, holidayName, toISO, weekDates, weekNumber, weekStart } from "@/lib/dates";
import { useMenu, useNow } from "@/lib/store";
import { WEEKDAYS } from "@/lib/types";

export default function MenuPage() {
  const now = useNow();
  const thisWeek = weekStart(toISO(now));
  const [ws, setWs] = useState(thisWeek);
  const menu = useMenu(ws);
  const dates = weekDates(ws);
  const weeks = [0, 1, 2].map((i) => addDays(thisWeek, 7 * i));

  return (
    <div>
      <PageHeader
        title={`Menu · week ${weekNumber(ws)}`}
        subtitle="A main dish and a vegetarian option every day. Special diets are prepared as variants of these dishes."
        action={<Tabs value={ws} onChange={setWs} options={weeks.map((w, i) => ({ value: w, label: i === 0 ? "This week" : i === 1 ? "Next week" : `Week ${weekNumber(w)}` }))} />}
      />
      {!menu.published ? (
        <Card className="p-8 text-center text-gra-500">The menu for this week is not published yet. Check back soon.</Card>
      ) : (
        <div className="grid gap-4">
          {WEEKDAYS.map((wd) => (
            <Card key={wd} className="p-5">
              <p className="mb-4 text-lg font-medium text-sort-900">{fmtDay(dates[wd])}</p>
              {holidayName(dates[wd]) ? (
                <p className="text-sm text-gra-500">Closed · {holidayName(dates[wd])}</p>
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
