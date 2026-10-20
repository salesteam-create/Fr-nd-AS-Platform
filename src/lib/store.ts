"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays, setDateLocale, toISO } from "./dates";
import { buildInvoice, firstOpenDate, getMenu } from "./logic";
import { createSeed } from "./seed";
import type { Customer, DayOrder, DemoData, Settings, WeekMenu, WeekPattern } from "./types";

export interface Toast {
  id: number;
  title: string;
  body?: string;
  kind?: "success" | "info" | "error";
}

interface DemoState extends DemoData {
  clockOffsetMs: number;
  currentCustomerId: string | null;
  toasts: Toast[];
  lang: "en" | "no";
  setLang: (lang: "en" | "no") => void;

  // demo controls
  setClockOffset: (ms: number) => void;
  resetDemo: () => void;
  notify: (t: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;

  // customer portal
  login: (customerId: string) => void;
  logout: () => void;
  registerCustomer: (c: Omit<Customer, "id" | "createdAt" | "tripletexId" | "active" | "users">) => string;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  setDayOrders: (customerId: string, orders: Record<string, DayOrder | null>) => void;
  setStandingOrder: (customerId: string, from: string, days: WeekPattern | null) => void;

  // admin
  setCustomerActive: (id: string, active: boolean) => void;
  saveMenu: (menu: WeekMenu) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  generateInvoices: (customerIds: string[], from: string, to: string) => number;
  sendInvoicesToTripletex: (invoiceIds: string[]) => void;
  syncLedger: () => void;
}

let toastSeq = 1;

export const nowFrom = (offset: number) => new Date(Date.now() + offset);

const seedState = (): DemoData => createSeed(toISO(new Date()));

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...seedState(),
      clockOffsetMs: 0,
      currentCustomerId: null,
      toasts: [],
      lang: "en",
      setLang: (lang) => {
        setDateLocale(lang);
        set({ lang });
      },

      setClockOffset: (ms) => set({ clockOffsetMs: ms }),
      resetDemo: () => set({ ...seedState(), clockOffsetMs: 0, currentCustomerId: null }), // keeps the chosen language
      notify: (t) => {
        const id = toastSeq++;
        set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
        setTimeout(() => get().dismiss(id), 4500);
      },
      dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      login: (customerId) => set({ currentCustomerId: customerId }),
      logout: () => set({ currentCustomerId: null }),

      registerCustomer: (input) => {
        const s = get();
        const id = `c-${Date.now().toString(36)}`;
        const tripletexId = s.nextTripletexCustomerId;
        const customer: Customer = {
          ...input,
          id,
          createdAt: toISO(nowFrom(s.clockOffsetMs)),
          tripletexId,
          active: true,
          users: [{ id: `${id}-u1`, name: input.contactName, email: input.email, role: "admin" }],
        };
        set({
          customers: [...s.customers, customer],
          currentCustomerId: id,
          nextTripletexCustomerId: tripletexId + 1,
          syncLog: [
            { id: `log-${Date.now()}`, at: nowFrom(s.clockOffsetMs).toISOString(), kind: "customer", message: `Customer "${customer.name}" created in Tripletex (#${tripletexId})`, messageNo: `Kunde «${customer.name}» opprettet i Tripletex (#${tripletexId})`, ok: true },
            ...s.syncLog,
          ],
        });
        return id;
      },

      updateCustomer: (id, patch) =>
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

      setDayOrders: (customerId, orders) =>
        set((s) => ({ overrides: { ...s.overrides, [customerId]: { ...(s.overrides[customerId] ?? {}), ...orders } } })),

      setStandingOrder: (customerId, from, days) =>
        set((s) => {
          const kept = (s.standing[customerId] ?? []).filter((v) => v.from < from);
          // A new standing pattern replaces one-off changes from its start date onwards.
          const ov = Object.fromEntries(Object.entries(s.overrides[customerId] ?? {}).filter(([d]) => d < from));
          return {
            standing: { ...s.standing, [customerId]: [...kept, { from, days }] },
            overrides: { ...s.overrides, [customerId]: ov },
          };
        }),

      setCustomerActive: (id, active) => {
        const s = get();
        const now = nowFrom(s.clockOffsetMs);
        if (!active) {
          // Stop future deliveries but keep history.
          const from = firstOpenDate(now, s.settings.deadlineHour);
          get().setStandingOrder(id, from, null);
        }
        get().updateCustomer(id, { active });
      },

      saveMenu: (menu) => set((s) => ({ menus: { ...s.menus, [menu.weekStart]: menu } })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      generateInvoices: (customerIds, from, to) => {
        const s = get();
        const created = toISO(nowFrom(s.clockOffsetMs));
        let number = s.nextInvoiceNumber;
        const fresh = [];
        for (const cid of customerIds) {
          const c = s.customers.find((x) => x.id === cid);
          if (!c) continue;
          const exists = s.invoices.some((i) => i.customerId === cid && i.periodStart === from && i.periodEnd === to);
          if (exists) continue;
          const inv = buildInvoice(s, c, from, to, created, number);
          if (inv) {
            fresh.push(inv);
            number++;
          }
        }
        set({ invoices: [...s.invoices, ...fresh], nextInvoiceNumber: number });
        return fresh.length;
      },

      sendInvoicesToTripletex: (invoiceIds) => {
        set((s) => ({
          invoices: s.invoices.map((i) => (invoiceIds.includes(i.id) ? { ...i, tripletexStatus: "syncing" } : i)),
        }));
        // Simulated API round trip.
        setTimeout(() => {
          const s = get();
          let txId = s.nextTripletexInvoiceId;
          const log = [...s.syncLog];
          const invoices = s.invoices.map((i) => {
            if (!invoiceIds.includes(i.id)) return i;
            const c = s.customers.find((x) => x.id === i.customerId);
            log.unshift({
              id: `log-${i.id}-${Date.now()}`,
              at: nowFrom(s.clockOffsetMs).toISOString(),
              kind: "invoice",
              message: `Invoice ${i.number} for ${c?.name ?? "customer"} created in Tripletex (#${txId}) and sent as ${i.channel}`,
              messageNo: `Faktura ${i.number} til ${c?.name ?? "kunde"} opprettet i Tripletex (#${txId}) og sendt som ${i.channel}`,
              ok: true,
            });
            return { ...i, tripletexStatus: "synced" as const, tripletexId: txId++, status: "sent" as const };
          });
          set({ invoices, syncLog: log, nextTripletexInvoiceId: txId });
          const no = get().lang === "no";
          get().notify({
            kind: "success",
            title: no ? `${invoiceIds.length} faktura(er) sendt til Tripletex` : `${invoiceIds.length} invoice(s) sent to Tripletex`,
            body: no ? "Simulert: fakturaene er opprettet og sendt som PDF eller EHF." : "Simulated: invoices created and sent by PDF or EHF.",
          });
        }, 1600);
      },

      syncLedger: () => {
        const s = get();
        const today = toISO(nowFrom(s.clockOffsetMs));
        let paid = 0;
        const invoices = s.invoices.map((i) => {
          if (i.status === "sent" && i.dueDate <= addDays(today, 7)) {
            paid++;
            return { ...i, status: "paid" as const };
          }
          return i;
        });
        set({
          invoices,
          syncLog: [
            { id: `log-ledger-${Date.now()}`, at: nowFrom(s.clockOffsetMs).toISOString(), kind: "ledger", message: `Customer ledger synchronised from Tripletex (${paid} payment(s) registered)`, messageNo: `Kundereskontro synkronisert fra Tripletex (${paid} innbetaling(er) registrert)`, ok: true },
            ...s.syncLog,
          ],
        });
        const no = get().lang === "no";
        get().notify({
          kind: "success",
          title: no ? "Reskontro synkronisert" : "Ledger synchronised",
          body: no ? `${paid} faktura(er) markert som betalt (simulert).` : `${paid} invoice(s) marked as paid (simulated).`,
        });
      },
    }),
    {
      name: "fraend-demo-v1",
      onRehydrateStorage: () => (state) => {
        if (state) setDateLocale(state.lang);
      },
      partialize: (s) => {
        const { toasts, ...rest } = s;
        void toasts;
        return rest;
      },
    },
  ),
);

/** Current demo time (real time plus the demo clock offset), refreshed every 15 seconds. */
export function useNow(): Date {
  const offset = useDemo((s) => s.clockOffsetMs);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);
  void tick;
  return nowFrom(offset);
}

export function useToday(): string {
  return toISO(useNow());
}

export function useMenu(ws: string): WeekMenu {
  const state = useDemo();
  return getMenu(state, ws, toISO(nowFrom(state.clockOffsetMs)));
}

export function useCurrentCustomer(): Customer | null {
  return useDemo((s) => s.customers.find((c) => c.id === s.currentCustomerId) ?? null);
}
