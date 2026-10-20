import { WEEKDAYS, type Weekday } from "./types";

// All dates are handled as local calendar dates in "YYYY-MM-DD" form.

export function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Monday of the week containing `iso`. */
export function weekStart(iso: string): string {
  const d = fromISO(iso);
  const dow = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - dow);
  return toISO(d);
}

export function weekDates(weekStartIso: string): Record<Weekday, string> {
  return {
    mon: weekStartIso,
    tue: addDays(weekStartIso, 1),
    wed: addDays(weekStartIso, 2),
    thu: addDays(weekStartIso, 3),
    fri: addDays(weekStartIso, 4),
  };
}

export function weekdayOf(iso: string): Weekday | null {
  const dow = (fromISO(iso).getDay() + 6) % 7;
  return dow < 5 ? WEEKDAYS[dow] : null;
}

/** ISO 8601 week number. */
export function weekNumber(iso: string): number {
  const d = fromISO(iso);
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target.valueOf() - firstThursday.valueOf();
  return 1 + Math.round((diff / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

// Norwegian public holidays (weekdays only matter here).
const HOLIDAYS: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-04-02": "Maundy Thursday",
  "2026-04-03": "Good Friday",
  "2026-04-06": "Easter Monday",
  "2026-05-01": "Labour Day",
  "2026-05-14": "Ascension Day",
  "2026-05-25": "Whit Monday",
  "2026-12-24": "Christmas Eve (closed)",
  "2026-12-25": "Christmas Day",
  "2026-12-31": "New Year's Eve (closed)",
  "2027-01-01": "New Year's Day",
  "2027-03-25": "Maundy Thursday",
  "2027-03-26": "Good Friday",
  "2027-03-29": "Easter Monday",
  "2027-05-06": "Ascension Day",
  "2027-05-17": "Constitution Day / Whit Monday",
};

const HOLIDAYS_NO: Record<string, string> = {
  "2026-01-01": "Første nyttårsdag",
  "2026-04-02": "Skjærtorsdag",
  "2026-04-03": "Langfredag",
  "2026-04-06": "Andre påskedag",
  "2026-05-01": "Arbeidernes dag",
  "2026-05-14": "Kristi himmelfartsdag",
  "2026-05-25": "Andre pinsedag",
  "2026-12-24": "Julaften (stengt)",
  "2026-12-25": "Første juledag",
  "2026-12-31": "Nyttårsaften (stengt)",
  "2027-01-01": "Første nyttårsdag",
  "2027-03-25": "Skjærtorsdag",
  "2027-03-26": "Langfredag",
  "2027-03-29": "Andre påskedag",
  "2027-05-06": "Kristi himmelfartsdag",
  "2027-05-17": "Grunnlovsdagen / andre pinsedag",
};

export function holidayName(iso: string): string | null {
  return (locale === "nb-NO" ? HOLIDAYS_NO[iso] : HOLIDAYS[iso]) ?? null;
}

export function isDeliveryDay(iso: string): boolean {
  return weekdayOf(iso) !== null && !holidayName(iso);
}

/** Previous working day (skips weekends and holidays). */
export function previousWorkingDay(iso: string): string {
  let d = addDays(iso, -1);
  while (!isDeliveryDay(d)) d = addDays(d, -1);
  return d;
}

/** Change deadline for a delivery date: `hour`:00 on the working day before (BR-1). */
export function deadlineFor(iso: string, hour: number): Date {
  const d = fromISO(previousWorkingDay(iso));
  d.setHours(hour, 0, 0, 0);
  return d;
}

export function isLocked(iso: string, now: Date, hour: number): boolean {
  return now.getTime() >= deadlineFor(iso, hour).getTime();
}

export function nextDeliveryDay(fromIso: string): string {
  let d = fromIso;
  while (!isDeliveryDay(d)) d = addDays(d, 1);
  return d;
}

// Date formatting follows the UI language (set from the store via setDateLocale).
let locale: "en-GB" | "nb-NO" = "en-GB";
export function setDateLocale(lang: "en" | "no") {
  locale = lang === "no" ? "nb-NO" : "en-GB";
}

const cache = new Map<string, Intl.DateTimeFormat>();
function fmt(opts: Intl.DateTimeFormatOptions) {
  const key = locale + JSON.stringify(opts);
  let f = cache.get(key);
  if (!f) cache.set(key, (f = new Intl.DateTimeFormat(locale, opts)));
  return f;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const fmtDay = (iso: string) => cap(fmt({ weekday: "short", day: "numeric", month: "short" }).format(fromISO(iso)));
export const fmtLong = (iso: string) => cap(fmt({ weekday: "long", day: "numeric", month: "long" }).format(fromISO(iso)));
export const fmtDate = (iso: string) => fmt({ day: "numeric", month: "short", year: "numeric" }).format(fromISO(iso));
export const fmtTime = (d: Date) => fmt({ hour: "2-digit", minute: "2-digit" }).format(d);
export const fmtMonth = (iso: string) => cap(fmt({ month: "short", year: "numeric" }).format(fromISO(iso)));
export const fmtWeekdayShort = (d: Date) => cap(fmt({ weekday: "short" }).format(d));
export const fmtDateTime = (d: Date) => `${fmtDate(toISO(d))}, ${fmtTime(d)}`;

export function fmtCountdown(ms: number): string {
  if (ms <= 0) return locale === "nb-NO" ? "passert" : "passed";
  const mins = Math.floor(ms / 60000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  const h = locale === "nb-NO" ? "t" : "h";
  if (days > 0) return `${days}d ${hours}${h}`;
  if (hours > 0) return `${hours}${h} ${m}m`;
  return `${m}m`;
}
