"use client";

import { ArrowRight, CalendarCheck, Clock, FileText, Leaf, Repeat, Truck } from "lucide-react";
import Link from "next/link";
import { DishImage } from "@/components/DishImage";
import { Logo } from "@/components/Logo";
import { fmtDay, weekDates, weekStart } from "@/lib/dates";
import { firstOpenDate, nok } from "@/lib/logic";
import { useDemo, useMenu, useNow } from "@/lib/store";
import { WEEKDAYS, WEEKDAY_LABEL } from "@/lib/types";

export default function Landing() {
  const now = useNow();
  const settings = useDemo((s) => s.settings);
  // Show the menu for the first week customers can still order for.
  const ws = weekStart(firstOpenDate(now, settings.deadlineHour));
  const menu = useMenu(ws);
  const dates = weekDates(ws);

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <Logo />
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/login" className="rounded-lg px-3 py-2 font-medium text-brand-800 hover:bg-white">
            Log in
          </Link>
          <Link href="/register" className="rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-800">
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 lg:grid-cols-2 lg:pt-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent-500">Corporate lunch in the Stavanger region</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight text-brand-900 sm:text-5xl">
            Good lunch for your workplace, without the admin.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-gray-700">
            Order for your team in under two minutes. Set up a standing weekly order, adjust numbers until {settings.deadlineHour}:00 the day before, and get one invoice
            straight into your accounting system.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-6 py-3 font-medium text-white hover:bg-accent-600">
              Register your company <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-medium text-brand-800 ring-1 ring-brand-200 hover:bg-brand-50">
              Log in to order
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">From {nok(settings.standardPrice)} per person, excl. VAT. Delivered Monday to Friday.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {WEEKDAYS.slice(0, 4).map((wd, i) => (
            <div key={wd} className={i % 2 === 1 ? "translate-y-6" : ""}>
              <DishImage dish={i % 2 === 0 ? menu.days[wd].main : menu.days[wd].vegetarian} className="aspect-[4/3] rounded-2xl shadow-md" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-3xl font-semibold text-brand-900">How it works</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: CalendarCheck, title: "1. Register your company", body: "Org. number, delivery address and invoice details. Takes a couple of minutes." },
              { icon: Repeat, title: "2. Order or set a standing order", body: "Choose days and portions, add special diets. Standing orders repeat every week." },
              { icon: Truck, title: "3. We cook and deliver", body: "Fresh lunch at your door. One invoice weekly or monthly, by PDF or EHF." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-cream-50 p-6 ring-1 ring-cream-200">
                <Icon className="h-6 w-6 text-accent-500" />
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-brand-900">Menu, week of {fmtDay(ws)}</h2>
              <p className="mt-1 text-gray-600">A main dish and a vegetarian option every day. Allergens are listed on every dish.</p>
            </div>
            <Link href="/register" className="text-sm font-medium text-accent-600 hover:underline">
              Order this week →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <DishImage dish={menu.days[wd].main} className="aspect-[16/9]" />
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-500">
                    {WEEKDAY_LABEL[wd]} · {fmtDay(dates[wd]).split(" ").slice(1).join(" ")}
                  </p>
                  <p className="mt-1 font-medium text-gray-900">{menu.days[wd].main.name}</p>
                  <p className="mt-2 flex items-start gap-1 text-sm text-gray-600">
                    <Leaf className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" /> {menu.days[wd].vegetarian.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-900 py-16 text-cream-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          {[
            { icon: Leaf, title: "Every diet covered", body: "Vegetarian, vegan, gluten-free, lactose-free and halal, counted per day." },
            { icon: Clock, title: `Change until ${settings.deadlineHour}:00`, body: "Adjust numbers until midday the working day before delivery. Less waste, fair for everyone." },
            { icon: FileText, title: "Invoicing that fits", body: "Weekly or monthly invoices by PDF or EHF, straight into your accounting." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-accent-400" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-brand-100">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-gray-500">
        <span>Frænd AS · Social enterprise, Stavanger · Demo prototype</span>
        <Link href="/admin" className="font-medium text-brand-700 hover:underline">
          Frænd staff: open admin →
        </Link>
      </footer>
    </div>
  );
}
