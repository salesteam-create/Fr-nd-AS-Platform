import {
  addDays,
  isDeliveryDay,
  isLocked,
  toISO,
  weekStart,
  weekdayOf,
} from "./dates";
import { rotationMenu } from "./dishes";
import {
  DIET_KEYS,
  type Customer,
  type DayOrder,
  type DeliveryArea,
  type DemoData,
  type Diets,
  type Dish,
  type Invoice,
  type InvoiceLine,
  type WeekMenu,
  type WeekPattern,
} from "./types";

export const emptyDiets = (): Diets => ({
  vegetarian: 0,
  vegan: 0,
  glutenFree: 0,
  lactoseFree: 0,
  halal: 0,
  other: 0,
});

export const emptyDay = (total = 0): DayOrder => ({ total, diets: emptyDiets() });

export const dietSum = (o: DayOrder) => DIET_KEYS.reduce((s, k) => s + (o.diets[k] || 0), 0);

export function getMenu(data: DemoData, ws: string, todayIso: string): WeekMenu {
  const edited = data.menus[ws];
  if (edited) return edited;
  // Unedited weeks up to next week count as published; later weeks are drafts.
  return rotationMenu(ws, ws <= addDays(weekStart(todayIso), 7));
}

export function standingPatternOn(data: DemoData, customerId: string, iso: string): WeekPattern | null {
  const versions = data.standing[customerId] ?? [];
  let current: WeekPattern | null = null;
  for (const v of versions) {
    if (v.from <= iso) current = v.days;
  }
  return current;
}

export type OrderSource = "standing" | "override" | "none";

export function effectiveOrder(
  data: DemoData,
  customerId: string,
  iso: string,
): { order: DayOrder | null; source: OrderSource } {
  if (!isDeliveryDay(iso)) return { order: null, source: "none" };
  const ov = data.overrides[customerId];
  if (ov && iso in ov) {
    const o = ov[iso];
    return { order: o && o.total > 0 ? o : null, source: "override" };
  }
  const pattern = standingPatternOn(data, customerId, iso);
  const wd = weekdayOf(iso);
  if (pattern && wd) {
    const o = pattern[wd];
    return { order: o.total > 0 ? o : null, source: "standing" };
  }
  return { order: null, source: "none" };
}

export function priceFor(c: Customer, data: DemoData): number {
  return c.pricePerPortion ?? data.settings.standardPrice;
}

export function areaFor(postcode: string, areas: DeliveryArea[]): DeliveryArea | null {
  return areas.find((a) => postcode >= a.postcodeFrom && postcode <= a.postcodeTo) ?? null;
}

export interface DeliveryRow {
  customer: Customer;
  order: DayOrder;
  area: string;
}

export function deliveriesOn(data: DemoData, iso: string): DeliveryRow[] {
  const rows: DeliveryRow[] = [];
  for (const c of data.customers) {
    const { order } = effectiveOrder(data, c.id, iso);
    if (!order) continue;
    const addr = c.deliveryAddresses[0];
    rows.push({
      customer: c,
      order,
      area: areaFor(addr?.postcode ?? "", data.settings.deliveryAreas)?.name ?? "Outside areas",
    });
  }
  return rows;
}

export interface ProductionLine {
  key: string;
  label: string;
  dish: Dish | null;
  portions: number;
  notes?: string[];
}

/** Production list for a day (FR-50). Special diets are variants made on top of the two daily dishes. */
export function productionFor(data: DemoData, iso: string, todayIso: string): ProductionLine[] {
  const wd = weekdayOf(iso);
  if (!wd) return [];
  const menu = getMenu(data, weekStart(iso), todayIso).days[wd];
  const rows = deliveriesOn(data, iso);
  const sum = (fn: (o: DayOrder) => number) => rows.reduce((s, r) => s + fn(r.order), 0);
  const otherNotes = rows
    .filter((r) => r.order.diets.other > 0)
    .map((r) => `${r.customer.name}: ${r.order.diets.other} × ${r.order.otherNote || "unspecified"}`);
  return [
    { key: "main", label: menu.main.name, dish: menu.main, portions: sum((o) => o.total - dietSum(o)) },
    { key: "vegetarian", label: menu.vegetarian.name, dish: menu.vegetarian, portions: sum((o) => o.diets.vegetarian) },
    { key: "vegan", label: `Vegan: ${menu.vegetarian.name}`, dish: null, portions: sum((o) => o.diets.vegan) },
    { key: "glutenFree", label: `Gluten-free: ${menu.main.name}`, dish: null, portions: sum((o) => o.diets.glutenFree) },
    { key: "lactoseFree", label: `Lactose-free: ${menu.main.name}`, dish: null, portions: sum((o) => o.diets.lactoseFree) },
    { key: "halal", label: `Halal: ${menu.main.name}`, dish: null, portions: sum((o) => o.diets.halal) },
    { key: "other", label: "Other dietary needs", dish: null, portions: sum((o) => o.diets.other), notes: otherNotes },
  ];
}

export function portionsOn(data: DemoData, iso: string): number {
  return deliveriesOn(data, iso).reduce((s, r) => s + r.order.total, 0);
}

export function revenueOn(data: DemoData, iso: string): number {
  return deliveriesOn(data, iso).reduce((s, r) => s + r.order.total * priceFor(r.customer, data), 0);
}

export function eachDay(from: string, to: string, fn: (iso: string) => void) {
  for (let d = from; d <= to; d = addDays(d, 1)) fn(d);
}

/** One line per delivery day in the period. Callers only invoice periods that have been delivered. */
export function invoiceLines(data: DemoData, customer: Customer, from: string, to: string): InvoiceLine[] {
  const lines: InvoiceLine[] = [];
  eachDay(from, to, (d) => {
    const { order } = effectiveOrder(data, customer.id, d);
    if (order) lines.push({ date: d, portions: order.total, unitPrice: priceFor(customer, data) });
  });
  return lines;
}

export function buildInvoice(
  data: DemoData,
  customer: Customer,
  from: string,
  to: string,
  createdAt: string,
  number: number,
): Invoice | null {
  const lines = invoiceLines(data, customer, from, to);
  if (lines.length === 0) return null;
  const amountExVat = lines.reduce((s, l) => s + l.portions * l.unitPrice, 0);
  const vat = Math.round(amountExVat * data.settings.vatRate);
  return {
    id: `inv-${number}`,
    number,
    customerId: customer.id,
    periodStart: from,
    periodEnd: to,
    lines,
    amountExVat,
    vat,
    total: amountExVat + vat,
    createdAt,
    dueDate: addDays(createdAt, 14),
    status: "draft",
    channel: customer.invoiceChannel,
    tripletexStatus: "not_synced",
    tripletexId: null,
  };
}

/** First delivery date a customer can still change. */
export function firstOpenDate(now: Date, hour: number): string {
  let d = toISO(now);
  while (!isDeliveryDay(d) || isLocked(d, now, hour)) d = addDays(d, 1);
  return d;
}

export const nok = (n: number) =>
  new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n);

export const num = (n: number) => new Intl.NumberFormat("nb-NO").format(n);

export function toCSV(rows: (string | number)[][]): string {
  return rows
    .map((r) =>
      r
        .map((v) => {
          const s = String(v);
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(","),
    )
    .join("\n");
}

export function downloadFile(filename: string, content: string, type = "text/csv") {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
