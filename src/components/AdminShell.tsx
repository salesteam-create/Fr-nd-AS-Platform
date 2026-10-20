"use client";

import {
  BarChart3,
  CalendarDays,
  ChefHat,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Settings,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { cx } from "./ui";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/production", label: "Production & packing", icon: ChefHat },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menus", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers & prices", icon: Users },
  { href: "/admin/invoicing", label: "Invoicing & Tripletex", icon: FileText },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  return (
    <div className="min-h-screen bg-krem lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-sort-900 px-4 py-6 lg:flex print:hidden">
        <div className="px-2">
          <Logo href="/admin" light sub="Admin" />
        </div>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                isActive(href) ? "bg-white/10 text-white" : "text-gra-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <p className="mt-auto px-3 text-xs text-gra-300">Signed in as Frænd admin (demo)</p>
      </aside>

      <header className="bg-sort-900 lg:hidden print:hidden">
        <div className="px-4 py-3">
          <Logo href="/admin" light sub="Admin" />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cx("whitespace-nowrap rounded-md px-3 py-1.5 text-sm", isActive(href) ? "bg-white/15 text-white" : "text-gra-300")}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 pb-24 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
