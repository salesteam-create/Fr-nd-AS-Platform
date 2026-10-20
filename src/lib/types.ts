export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri"];

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

export type DietKey = "vegetarian" | "vegan" | "glutenFree" | "lactoseFree" | "halal" | "other";

export const DIET_KEYS: DietKey[] = ["vegetarian", "vegan", "glutenFree", "lactoseFree", "halal", "other"];

export const DIET_LABEL: Record<DietKey, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  glutenFree: "Gluten-free",
  lactoseFree: "Lactose-free",
  halal: "Halal",
  other: "Other",
};

export type Diets = Record<DietKey, number>;

/** One company's order for one delivery day. Diet portions are part of `total` (BR-3). */
export interface DayOrder {
  total: number;
  diets: Diets;
  otherNote?: string;
  comment?: string;
}

export type WeekPattern = Record<Weekday, DayOrder>;

/**
 * A standing order is a list of versions. Each version applies from its `from`
 * date until the next version. `days: null` means paused or cancelled.
 * Keeping versions preserves order history when the pattern changes.
 */
export interface StandingOrderVersion {
  from: string;
  days: WeekPattern | null;
}

export type InvoiceFrequency = "weekly" | "monthly" | "agreement";
export type InvoiceChannel = "PDF" | "EHF";

export interface Address {
  id: string;
  label: string;
  street: string;
  postcode: string;
  city: string;
}

export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface Customer {
  id: string;
  name: string;
  orgNumber: string;
  segment: string;
  contactName: string;
  email: string;
  phone: string;
  deliveryAddresses: Address[];
  billingAddress: string;
  ehfEnabled: boolean;
  invoiceFrequency: InvoiceFrequency;
  invoiceChannel: InvoiceChannel;
  pricePerPortion: number | null; // null = standard price
  active: boolean;
  createdAt: string;
  tripletexId: number | null;
  users: CompanyUser[];
}

export type Allergen =
  | "gluten"
  | "crustaceans"
  | "eggs"
  | "fish"
  | "peanuts"
  | "soy"
  | "milk"
  | "nuts"
  | "celery"
  | "mustard"
  | "sesame"
  | "sulphites"
  | "lupin"
  | "molluscs";

export const ALLERGENS: Allergen[] = [
  "gluten",
  "crustaceans",
  "eggs",
  "fish",
  "peanuts",
  "soy",
  "milk",
  "nuts",
  "celery",
  "mustard",
  "sesame",
  "sulphites",
  "lupin",
  "molluscs",
];

export type DishLabel = "vegetarian" | "vegan" | "halal" | "glutenFree" | "lactoseFree";

export const DISH_LABELS: DishLabel[] = ["vegetarian", "vegan", "halal", "glutenFree", "lactoseFree"];

export interface Dish {
  id: string;
  name: string;
  description: string;
  allergens: Allergen[];
  labels: DishLabel[];
  hue: number; // placeholder image colour
}

export interface DayMenu {
  main: Dish;
  vegetarian: Dish;
}

export interface WeekMenu {
  weekStart: string;
  published: boolean;
  days: Record<Weekday, DayMenu>;
}

export type SyncStatus = "not_synced" | "syncing" | "synced" | "error";

export interface InvoiceLine {
  date: string;
  portions: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: number;
  customerId: string;
  periodStart: string;
  periodEnd: string;
  lines: InvoiceLine[];
  amountExVat: number;
  vat: number;
  total: number;
  createdAt: string;
  dueDate: string;
  status: "draft" | "sent" | "paid";
  channel: InvoiceChannel;
  tripletexStatus: SyncStatus;
  tripletexId: number | null;
}

export interface SyncLogEntry {
  id: string;
  at: string;
  kind: "customer" | "invoice" | "ledger";
  message: string;
  ok: boolean;
}

export interface DeliveryArea {
  id: string;
  name: string;
  postcodeFrom: string;
  postcodeTo: string;
}

export interface Settings {
  deadlineHour: number; // hour on the working day before delivery
  standardPrice: number; // NOK ex VAT per portion
  vatRate: number;
  deliveryAreas: DeliveryArea[];
}

export interface DemoData {
  customers: Customer[];
  standing: Record<string, StandingOrderVersion[]>;
  overrides: Record<string, Record<string, DayOrder | null>>;
  menus: Record<string, WeekMenu>;
  invoices: Invoice[];
  syncLog: SyncLogEntry[];
  settings: Settings;
  nextInvoiceNumber: number;
  nextTripletexCustomerId: number;
  nextTripletexInvoiceId: number;
}
