import Link from "next/link";
import { asset } from "@/lib/asset";
import { cx } from "./ui";

export function Logo({ href = "/", light, sub, width = 110 }: { href?: string; light?: boolean; sub?: string; width?: number }) {
  return (
    <Link href={href} className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset("/brand/fraend-logo.png")} alt="Frænd" style={{ width }} className="h-auto" />
      {sub && <span className={cx("text-[11px] font-medium uppercase tracking-caps", light ? "text-gra-300" : "text-gra-500")}>{sub}</span>}
    </Link>
  );
}
