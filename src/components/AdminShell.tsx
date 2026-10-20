"use client";

import {
  BarChart3,
  CalendarDays,
  ChefHat,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Smartphone,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";
import { Logo } from "./Logo";
import { cx } from "./ui";

const NAV = [
  { href: "/admin", en: "Dashboard", no: "Dashbord", icon: LayoutDashboard },
  { href: "/admin/production", en: "Production & packing", no: "Produksjon og pakking", icon: ChefHat },
  { href: "/admin/delivery", en: "Delivery", no: "Levering", icon: Truck },
  { href: "/driver", en: "Driver view", no: "Sjåførvisning", icon: Smartphone },
  { href: "/admin/orders", en: "Orders", no: "Bestillinger", icon: ClipboardList },
  { href: "/admin/menu", en: "Menus", no: "Menyer", icon: CalendarDays },
  { href: "/admin/customers", en: "Customers & prices", no: "Kunder og priser", icon: Users },
  { href: "/admin/invoicing", en: "Invoicing & Tripletex", no: "Fakturering og Tripletex", icon: FileText },
  { href: "/admin/reports", en: "Reports", no: "Rapporter", icon: BarChart3 },
  { href: "/admin/settings", en: "Settings", no: "Innstillinger", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { t } = useT();
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <div className="min-h-screen bg-krem lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sort-900 px-4 py-6 lg:flex print:hidden">
        <div className="px-2">
          <Logo href="/admin" light sub="Admin" />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, en, no, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                isActive(href) ? "bg-white/10 text-white" : "text-gra-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" /> {t(en, no)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3 pb-16">
          <LangToggle dark />
          <p className="mt-3 text-xs text-gra-300">{t("Signed in as Frænd admin (demo)", "Logget inn som Frænd-admin (demo)")}</p>
        </div>
      </aside>

      <header className="bg-sort-900 lg:hidden print:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo href="/admin" light sub="Admin" />
          <LangToggle dark />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map(({ href, en, no }) => (
            <Link
              key={href}
              href={href}
              className={cx("whitespace-nowrap rounded-md px-3 py-1.5 text-sm", isActive(href) ? "bg-white/15 text-white" : "text-gra-300")}
            >
              {t(en, no)}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
