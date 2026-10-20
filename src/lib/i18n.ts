"use client";

import { useDemo } from "./store";
import type { Allergen, DietKey, Dish, InvoiceFrequency, SyncLogEntry, Weekday } from "./types";

export type Lang = "en" | "no";

/** Inline translation: t("Order lunch", "Bestill lunsj"). Keeps both languages next to each other. */
export function useT() {
  const lang = useDemo((s) => s.lang);
  const t = (en: string, no: string) => (lang === "no" ? no : en);
  return { t, lang };
}

const WEEKDAY: Record<Lang, Record<Weekday, string>> = {
  en: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday" },
  no: { mon: "Mandag", tue: "Tirsdag", wed: "Onsdag", thu: "Torsdag", fri: "Fredag" },
};
const WEEKDAY_SHORT: Record<Lang, Record<Weekday, string>> = {
  en: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri" },
  no: { mon: "Man", tue: "Tir", wed: "Ons", thu: "Tor", fri: "Fre" },
};
export const weekdayLabel = (wd: Weekday, lang: Lang) => WEEKDAY[lang][wd];
export const weekdayShort = (wd: Weekday, lang: Lang) => WEEKDAY_SHORT[lang][wd];

const DIET: Record<Lang, Record<DietKey, string>> = {
  en: { vegetarian: "Vegetarian", vegan: "Vegan", glutenFree: "Gluten-free", lactoseFree: "Lactose-free", halal: "Halal", other: "Other" },
  no: { vegetarian: "Vegetar", vegan: "Vegansk", glutenFree: "Glutenfri", lactoseFree: "Laktosefri", halal: "Halal", other: "Annet" },
};
export const dietLabel = (k: DietKey, lang: Lang) => DIET[lang][k];

const ALLERGEN_NO: Record<Allergen, string> = {
  gluten: "gluten",
  crustaceans: "skalldyr",
  eggs: "egg",
  fish: "fisk",
  peanuts: "peanøtter",
  soy: "soya",
  milk: "melk",
  nuts: "nøtter",
  celery: "selleri",
  mustard: "sennep",
  sesame: "sesamfrø",
  sulphites: "sulfitter",
  lupin: "lupin",
  molluscs: "bløtdyr",
};
export const allergenLabel = (a: Allergen, lang: Lang) => (lang === "no" ? ALLERGEN_NO[a] : a);
export const allergenList = (list: Allergen[], lang: Lang) => list.map((a) => allergenLabel(a, lang)).join(", ");

export const dishName = (d: Dish, lang: Lang) => (lang === "no" && d.no ? d.no.name : d.name);
export const dishDescription = (d: Dish, lang: Lang) => (lang === "no" && d.no ? d.no.description : d.description);

const SEGMENT_NO: Record<string, string> = {
  "Shared office space": "Kontorfellesskap",
  "Commercial building": "Næringsbygg",
  "Public sector": "Offentlig virksomhet",
  "Private company": "Privat bedrift",
  "Industrial company": "Industribedrift",
};
export const segmentLabel = (s: string, lang: Lang) => (lang === "no" ? SEGMENT_NO[s] ?? s : s);

export const frequencyLabel = (f: InvoiceFrequency, lang: Lang) =>
  ({
    en: { weekly: "Weekly", monthly: "Monthly", agreement: "By agreement" },
    no: { weekly: "Ukentlig", monthly: "Månedlig", agreement: "Etter avtale" },
  })[lang][f];

export const logMessage = (l: SyncLogEntry, lang: Lang) => (lang === "no" && l.messageNo ? l.messageNo : l.message);
