"use client";

import { Building2, LayoutDashboard, Smartphone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { cx } from "./ui";

/** Demo-only bar at the top of every page for switching between the three apps. */
export function ViewSwitcher() {
  const path = usePathname();
  const { t } = useT();
  const active = path.startsWith("/admin") ? "admin" : path.startsWith("/driver") ? "driver" : "customer";

  const views = [
    { key: "customer", href: "/portal", icon: Building2, label: t("Customer portal", "Kundeportal"), short: t("Customer", "Kunde") },
    { key: "admin", href: "/admin", icon: LayoutDashboard, label: t("Frænd admin", "Frænd-admin"), short: "Admin" },
    { key: "driver", href: "/driver", icon: Smartphone, label: t("Driver", "Sjåfør"), short: t("Driver", "Sjåfør") },
  ] as const;

  return (
    <div className="sticky top-0 z-40 bg-sort-900 text-white print:hidden">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-1.5 sm:px-6">
        <span className="hidden text-[11px] font-medium uppercase tracking-caps text-rosa-500 sm:inline">{t("Demo · View as", "Demo · Vis som")}</span>
        <span className="text-[11px] font-medium uppercase tracking-caps text-rosa-500 sm:hidden">Demo</span>
        <nav className="ml-auto flex sm:ml-0" aria-label={t("Switch view", "Bytt visning")}>
          {views.map(({ key, href, icon: Icon, label, short }) => (
            <Link
              key={key}
              href={href}
              aria-current={active === key ? "page" : undefined}
              className={cx(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] ring-1 ring-inset ring-gra-500 -ml-px first:ml-0",
                active === key ? "z-10 bg-rosa-500 text-sort-900 ring-rosa-500" : "text-white hover:bg-white/10",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
