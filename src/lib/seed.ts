import { addDays, fromISO, toISO, weekStart } from "./dates";
import { buildInvoice, emptyDiets } from "./logic";
import {
  WEEKDAYS,
  type Customer,
  type DayOrder,
  type DemoData,
  type Diets,
  type InvoiceFrequency,
  type InvoiceChannel,
  type StandingOrderVersion,
  type WeekPattern,
} from "./types";

// All companies, people and numbers below are fictional demo data.

interface CustomerSeed {
  id: string;
  name: string;
  segment: string;
  contactName: string;
  street: string;
  postcode: string;
  city: string;
  frequency: InvoiceFrequency;
  channel: InvoiceChannel;
  price: number | null;
  daily: number[] | null; // Mon..Fri portions, null = no standing order
  diets: Partial<Diets>;
  otherNote?: string;
  startWeeksAgo: number;
  active?: boolean;
}

const SEEDS: CustomerSeed[] = [
  { id: "c-nordlys", name: "Nordlys Kontorfellesskap", segment: "Shared office space", contactName: "Ingrid Haugland", street: "Breigata 12", postcode: "4006", city: "Stavanger", frequency: "monthly", channel: "EHF", price: null, daily: [20, 20, 20, 20, 20], diets: { vegetarian: 3, vegan: 1, glutenFree: 1, lactoseFree: 1 }, startWeeksAgo: 24 },
  { id: "c-havnelageret", name: "Havnelageret Næringsbygg AS", segment: "Commercial building", contactName: "Lars Eide", street: "Strandkaien 30", postcode: "4005", city: "Stavanger", frequency: "monthly", channel: "EHF", price: 139, daily: [35, 32, 35, 30, 25], diets: { vegetarian: 5, glutenFree: 2, halal: 3, lactoseFree: 1 }, startWeeksAgo: 22 },
  { id: "c-fjordkant", name: "Fjordkant Kommunale Tjenester", segment: "Public sector", contactName: "Kari Tveit", street: "Lagårdsveien 46", postcode: "4010", city: "Stavanger", frequency: "monthly", channel: "EHF", price: 135, daily: [28, 28, 28, 28, 22], diets: { vegetarian: 4, vegan: 2, glutenFree: 2, halal: 2 }, startWeeksAgo: 20 },
  { id: "c-tidevann", name: "Tidevann Consulting AS", segment: "Private company", contactName: "Martin Sola", street: "Kirkegata 5", postcode: "4006", city: "Stavanger", frequency: "weekly", channel: "PDF", price: null, daily: [12, 12, 14, 12, 8], diets: { vegetarian: 2, lactoseFree: 1 }, startWeeksAgo: 16 },
  { id: "c-bryggen", name: "Bryggen Tech AS", segment: "Private company", contactName: "Sofie Larsen", street: "Verksgata 2", postcode: "4013", city: "Stavanger", frequency: "monthly", channel: "EHF", price: null, daily: [18, 18, 18, 18, 0], diets: { vegetarian: 3, vegan: 2, glutenFree: 1 }, startWeeksAgo: 18 },
  { id: "c-saltstein", name: "Saltstein Industri AS", segment: "Industrial company", contactName: "Erik Bakke", street: "Forusbeen 78", postcode: "4033", city: "Stavanger", frequency: "monthly", channel: "EHF", price: 129, daily: [40, 40, 40, 40, 30], diets: { vegetarian: 3, glutenFree: 2, halal: 5, other: 1 }, otherNote: "No pork", startWeeksAgo: 26 },
  { id: "c-kvarteret", name: "Kvarteret Coworking", segment: "Shared office space", contactName: "Nora Hansen", street: "Pedersgata 41", postcode: "4013", city: "Stavanger", frequency: "weekly", channel: "PDF", price: null, daily: [15, 12, 15, 12, 10], diets: { vegetarian: 3, vegan: 2 }, startWeeksAgo: 12 },
  { id: "c-lysfjord", name: "Lysfjord Arkitekter AS", segment: "Private company", contactName: "Jonas Vik", street: "Løkkeveien 9", postcode: "4008", city: "Stavanger", frequency: "agreement", channel: "PDF", price: null, daily: [8, 0, 8, 0, 8], diets: { vegetarian: 1 }, startWeeksAgo: 10 },
  { id: "c-vindkast", name: "Vindkast Energi AS", segment: "Private company", contactName: "Hilde Strand", street: "Hinnavågen 4", postcode: "4021", city: "Stavanger", frequency: "monthly", channel: "EHF", price: 142, daily: [25, 25, 25, 25, 20], diets: { vegetarian: 4, glutenFree: 1, lactoseFree: 2 }, startWeeksAgo: 14 },
  { id: "c-sandvika", name: "Sandvika Logistikk AS", segment: "Industrial company", contactName: "Ole Nygaard", street: "Lagerveien 21", postcode: "4307", city: "Sandnes", frequency: "monthly", channel: "EHF", price: 132, daily: [22, 22, 22, 22, 18], diets: { vegetarian: 2, halal: 3 }, startWeeksAgo: 8 },
  { id: "c-lilletorg", name: "Lille Torg Regnskap AS", segment: "Private company", contactName: "Anne Berg", street: "Torget 3", postcode: "4006", city: "Stavanger", frequency: "monthly", channel: "PDF", price: null, daily: null, diets: {}, startWeeksAgo: 6 },
  { id: "c-gamleverft", name: "Gamle Verft AS", segment: "Private company", contactName: "Per Aas", street: "Verftsgata 7", postcode: "4013", city: "Stavanger", frequency: "monthly", channel: "PDF", price: null, daily: null, diets: {}, startWeeksAgo: 30, active: false },
];

function dayOrder(total: number, diets: Partial<Diets>, otherNote?: string): DayOrder {
  if (total === 0) return { total: 0, diets: emptyDiets() };
  // Scale the diet split down for smaller days so it never exceeds the total.
  const base = { ...emptyDiets(), ...diets };
  const scaled = emptyDiets();
  let used = 0;
  for (const k of Object.keys(base) as (keyof Diets)[]) {
    const v = Math.min(base[k], Math.max(0, total - used));
    scaled[k] = v;
    used += v;
  }
  return { total, diets: scaled, otherNote: scaled.other ? otherNote : undefined };
}

function pattern(daily: number[], diets: Partial<Diets>, otherNote?: string): WeekPattern {
  const p = {} as WeekPattern;
  WEEKDAYS.forEach((wd, i) => (p[wd] = dayOrder(daily[i], diets, otherNote)));
  return p;
}

const slug = (s: string) => s.toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "a").replace(/[^a-z0-9]+/g, "");

export function createSeed(todayIso: string): DemoData {
  const thisWeek = weekStart(todayIso);
  const customers: Customer[] = [];
  const standing: Record<string, StandingOrderVersion[]> = {};
  const overrides: DemoData["overrides"] = {};

  SEEDS.forEach((s, i) => {
    const start = addDays(thisWeek, -7 * s.startWeeksAgo);
    const domain = `${slug(s.name.replace(/ AS$/, ""))}.demo`;
    const first = s.contactName.split(" ")[0].toLowerCase();
    customers.push({
      id: s.id,
      name: s.name,
      orgNumber: String(921000000 + i * 104729).slice(0, 9),
      segment: s.segment,
      contactName: s.contactName,
      email: `${first}@${domain}`,
      phone: `+47 400 10 ${String(10 + i).padStart(3, "0")}`,
      deliveryAddresses: [{ id: `${s.id}-a1`, label: "Main office", street: s.street, postcode: s.postcode, city: s.city }],
      billingAddress: `${s.street}, ${s.postcode} ${s.city}`,
      ehfEnabled: s.channel === "EHF",
      invoiceFrequency: s.frequency,
      invoiceChannel: s.channel,
      pricePerPortion: s.price,
      active: s.active ?? true,
      createdAt: start,
      tripletexId: 10450 + i,
      users: [{ id: `${s.id}-u1`, name: s.contactName, email: `${first}@${domain}`, role: "admin" }],
    });
    if (s.daily) standing[s.id] = [{ from: start, days: pattern(s.daily, s.diets, s.otherNote) }];
  });

  // Realistic history: one customer stepped up their standing order a few weeks ago.
  standing["c-kvarteret"].push({ from: addDays(thisWeek, -21), days: pattern([18, 15, 18, 15, 12], { vegetarian: 3, vegan: 2 }) });

  // One-off changes around the current and next week.
  const nextWeek = addDays(thisWeek, 7);
  overrides["c-nordlys"] = {
    [addDays(thisWeek, 4)]: { ...dayOrder(26, { vegetarian: 4, vegan: 1, glutenFree: 1, lactoseFree: 1 }), comment: "Friday social, a few guests joining" },
  };
  overrides["c-saltstein"] = { [addDays(nextWeek, 2)]: null };
  overrides["c-havnelageret"] = { [addDays(nextWeek, 1)]: { ...dayOrder(45, { vegetarian: 6, glutenFree: 2, halal: 4, lactoseFree: 1 }), comment: "Tenant meeting, deliver to 1st floor" } };
  // Ad-hoc customer without a standing order.
  const lilleTorg: Record<string, DayOrder | null> = {};
  for (let w = -6; w <= 1; w++) {
    const ws = addDays(thisWeek, 7 * w);
    lilleTorg[addDays(ws, 2)] = dayOrder(6, { vegetarian: 1 });
    if (w % 2 === 0) lilleTorg[addDays(ws, 4)] = dayOrder(8, { vegetarian: 1, glutenFree: 1 });
  }
  overrides["c-lilletorg"] = lilleTorg;
  // The inactive customer ordered in the past only.
  const gamle: Record<string, DayOrder | null> = {};
  for (let w = -30; w <= -12; w++) gamle[addDays(addDays(thisWeek, 7 * w), 1)] = dayOrder(10, { vegetarian: 2 });
  overrides["c-gamleverft"] = gamle;

  const data: DemoData = {
    customers,
    standing,
    overrides,
    menus: {},
    invoices: [],
    syncLog: [],
    settings: {
      deadlineHour: 12,
      standardPrice: 149,
      vatRate: 0.15,
      deliveryAreas: [
        { id: "area-sentrum", name: "Stavanger sentrum", postcodeFrom: "4001", postcodeTo: "4013" },
        { id: "area-ost", name: "Stavanger øst / Hinna", postcodeFrom: "4014", postcodeTo: "4030" },
        { id: "area-forus", name: "Forus / Sola", postcodeFrom: "4031", postcodeTo: "4056" },
        { id: "area-sandnes", name: "Sandnes", postcodeFrom: "4300", postcodeTo: "4329" },
      ],
    },
    nextInvoiceNumber: 10001,
    nextTripletexCustomerId: 10450 + SEEDS.length,
    nextTripletexInvoiceId: 88001,
    // One example closure day about three weeks out.
    closures: { [addDays(thisWeek, 7 * 3 + 4)]: "Staff day / Personaldag" },
    emails: [],
    delivered: {},
  };

  // Invoice history up to two periods back; the latest closed period is left for the demo.
  const today = fromISO(todayIso);
  const monthStart = (y: number, m: number) => toISO(new Date(y, m, 1));
  const monthEnd = (y: number, m: number) => toISO(new Date(y, m + 1, 0));
  for (const c of customers) {
    const periods: [string, string][] = [];
    if (c.invoiceFrequency === "weekly") {
      for (let w = 8; w >= 2; w--) {
        const ws = addDays(thisWeek, -7 * w);
        periods.push([ws, addDays(ws, 6)]);
      }
    } else {
      for (let m = 6; m >= 2; m--) {
        periods.push([monthStart(today.getFullYear(), today.getMonth() - m), monthEnd(today.getFullYear(), today.getMonth() - m)]);
      }
    }
    periods.forEach(([from, to], idx) => {
      const created = addDays(to, 1);
      const inv = buildInvoice(data, c, from, to, created, data.nextInvoiceNumber);
      if (!inv) return;
      data.nextInvoiceNumber++;
      inv.status = idx === periods.length - 1 ? "sent" : "paid";
      inv.tripletexStatus = "synced";
      inv.tripletexId = data.nextTripletexInvoiceId++;
      data.invoices.push(inv);
    });
  }

  const now = new Date();
  data.syncLog.push({
    id: "log-seed",
    at: new Date(now.getTime() - 3600_000 * 20).toISOString(),
    kind: "ledger",
    message: "Customer ledger synchronised from Tripletex (payments updated)",
    messageNo: "Kundereskontro synkronisert fra Tripletex (innbetalinger oppdatert)",
    ok: true,
  });
  return data;
}
