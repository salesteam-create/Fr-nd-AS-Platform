"use client";

import { Building2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { useCurrentCustomer, useDemo } from "@/lib/store";
import { LangToggle } from "./LangToggle";
import { Logo } from "./Logo";
import { cx } from "./ui";

const NAV = [
  { href: "/portal", en: "Overview", no: "Oversikt" },
  { href: "/portal/order", en: "Order lunch", no: "Bestill lunsj" },
  { href: "/portal/standing", en: "Standing order", no: "Fast bestilling" },
  { href: "/portal/menu", en: "Menu", no: "Meny" },
  { href: "/portal/history", en: "History & invoices", no: "Historikk og fakturaer" },
  { href: "/portal/company", en: "Company", no: "Firma" },
];

export function PortalShell({ children }: { children: ReactNode }) {
  const customer = useCurrentCustomer();
  const logout = useDemo((s) => s.logout);
  const router = useRouter();
  const path = usePathname();
  const { t } = useT();

  useEffect(() => {
    if (!customer) router.replace("/login");
  }, [customer, router]);

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-krem">
      <header className="border-b border-gra-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Logo href="/portal" sub={t("Corporate lunch", "Bedriftslunsj")} />
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-sm text-gra-500 sm:flex">
              <Building2 className="h-4 w-4 text-sort-700" /> {customer.name}
            </span>
            <LangToggle />
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gra-500 hover:bg-gra-100"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">{t("Log out", "Logg ut")}</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-4">
          {NAV.map((n) => {
            const active = n.href === "/portal" ? path === "/portal" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cx(
                  "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium",
                  active ? "border-rosa-500 text-sort-900" : "border-transparent text-gra-500 hover:text-sort-900",
                )}
              >
                {t(n.en, n.no)}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:py-8">{children}</main>
    </div>
  );
}
