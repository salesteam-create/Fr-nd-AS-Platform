import Link from "next/link";
import { cx } from "./ui";

// Placeholder wordmark until Frænd's logo is supplied.
export function Logo({ href = "/", light, sub }: { href?: string; light?: boolean; sub?: string }) {
  return (
    <Link href={href} className="flex items-baseline gap-2">
      <span className={cx("font-serif text-2xl font-bold tracking-[0.18em]", light ? "text-cream-50" : "text-brand-800")}>FRÆND</span>
      {sub && <span className={cx("text-xs font-medium uppercase tracking-wider", light ? "text-brand-200" : "text-accent-500")}>{sub}</span>}
    </Link>
  );
}
