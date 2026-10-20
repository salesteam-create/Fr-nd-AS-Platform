import { addDays, fromISO, toISO, weekDates, weekdayOf, weekStart } from "./dates";
import { deliveriesOn, eachDay, getMenu, priceFor } from "./logic";
import { WEEKDAYS, type DemoData } from "./types";

export function revenueBetween(data: DemoData, from: string, to: string) {
  let revenue = 0;
  let portions = 0;
  let orders = 0;
  eachDay(from, to, (d) => {
    for (const r of deliveriesOn(data, d)) {
      revenue += r.order.total * priceFor(r.customer, data);
      portions += r.order.total;
      orders++;
    }
  });
  return { revenue, portions, orders };
}

export function monthlySeries(data: DemoData, todayIso: string, months: number) {
  const t = fromISO(todayIso);
  const out: { month: string; revenue: number; portions: number; partial: boolean }[] = [];
  for (let m = months - 1; m >= 0; m--) {
    const start = toISO(new Date(t.getFullYear(), t.getMonth() - m, 1));
    const end = toISO(new Date(t.getFullYear(), t.getMonth() - m + 1, 0));
    const to = m === 0 ? addDays(todayIso, -1) : end;
    const r = to >= start ? revenueBetween(data, start, to) : { revenue: 0, portions: 0 };
    out.push({ month: start, revenue: r.revenue, portions: r.portions, partial: m === 0 });
  }
  return out;
}

export function bestSellers(data: DemoData, from: string, to: string, todayIso: string, limit = 5) {
  const counts = new Map<string, { name: string; portions: number }>();
  eachDay(from, to, (d) => {
    const wd = weekdayOf(d);
    if (!wd) return;
    const rows = deliveriesOn(data, d);
    if (!rows.length) return;
    const menu = getMenu(data, weekStart(d), todayIso).days[wd];
    const veg = rows.reduce((s, r) => s + r.order.diets.vegetarian + r.order.diets.vegan, 0);
    const main = rows.reduce((s, r) => s + r.order.total, 0) - veg;
    for (const [dish, n] of [
      [menu.main, main],
      [menu.vegetarian, veg],
    ] as const) {
      const c = counts.get(dish.id) ?? { name: dish.name, portions: 0 };
      c.portions += n;
      counts.set(dish.id, c);
    }
  });
  return [...counts.values()].sort((a, b) => b.portions - a.portions).slice(0, limit);
}

export function weekTotals(data: DemoData, ws: string) {
  const dates = weekDates(ws);
  return WEEKDAYS.map((wd) => {
    const rows = deliveriesOn(data, dates[wd]);
    return {
      wd,
      date: dates[wd],
      portions: rows.reduce((s, r) => s + r.order.total, 0),
      revenue: rows.reduce((s, r) => s + r.order.total * priceFor(r.customer, data), 0),
      customers: rows.length,
    };
  });
}
