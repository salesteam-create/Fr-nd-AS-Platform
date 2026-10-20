"use client";

import { Minus, Plus } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent";

const variants: Record<Variant, string> = {
  primary: "bg-sort-900 text-white ring-1 ring-inset ring-sort-900 hover:bg-sort-700",
  accent: "bg-rosa-500 text-sort-900 ring-1 ring-inset ring-rosa-500 hover:bg-rosa-300",
  secondary: "bg-transparent text-sort-900 ring-1 ring-inset ring-sort-900 hover:bg-gra-100",
  ghost: "text-sort-900 hover:bg-gra-100",
  danger: "bg-transparent text-rod-600 ring-1 ring-inset ring-rod-600 hover:bg-rod-600/5",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-none font-medium uppercase tracking-caps transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rosa-500/50 disabled:cursor-not-allowed disabled:opacity-40",
        size === "sm" && "px-3 py-1.5 text-xs tracking-[0.08em]",
        size === "md" && "px-5 py-2.5 text-[13px]",
        size === "lg" && "px-8 py-3.5 text-sm",
        variants[variant],
        className,
      )}
    />
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("bg-white ring-1 ring-gra-300", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gra-300 px-5 py-4">
      <div>
        <h2 className="text-lg font-medium text-sort-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-gra-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-medium leading-tight text-sort-900 sm:text-[40px]">{title}</h1>
        {subtitle && <p className="mt-1 text-gra-500">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

type Tone = "green" | "gray" | "amber" | "red" | "blue" | "accent";

const tones: Record<Tone, string> = {
  green: "bg-gull-100 text-gull-700 ring-transparent",
  gray: "bg-gra-100 text-gra-500 ring-transparent",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  red: "bg-rod-600/10 text-rod-600 ring-transparent",
  blue: "bg-rosa-100 text-sort-900 ring-transparent",
  accent: "bg-transparent text-sort-900 ring-sort-900",
};

export function Badge({ tone = "gray", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-none px-2 py-0.5 text-[11px] font-medium uppercase tracking-caps ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  disabled,
  size = "md",
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn = cx(
    "flex items-center justify-center text-sort-900 hover:bg-gra-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
    size === "md" ? "h-10 w-10" : "h-8 w-8",
  );
  return (
    <div className={cx("inline-flex items-center divide-x divide-sort-900 bg-white ring-1 ring-sort-900", disabled && "opacity-40")}>
      <button type="button" aria-label={`Decrease ${label ?? ""}`} className={btn} disabled={disabled || value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="h-4 w-4" />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        className={cx(
          "border-0 bg-transparent p-0 text-center font-medium tabular-nums text-sort-900 focus:outline-none focus:ring-0",
          size === "md" ? "h-10 w-12 text-base" : "h-8 w-10 text-sm",
        )}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
          onChange(Math.min(max, Math.max(min, n)));
        }}
      />
      <button type="button" aria-label={`Increase ${label ?? ""}`} className={btn} disabled={disabled || value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Stat({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-caps text-gra-500">{label}</p>
        {icon && <span className="text-gra-500">{icon}</span>}
      </div>
      <p className="mt-2 text-3xl font-medium tabular-nums text-sort-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gra-500">{hint}</p>}
    </Card>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cx("block", className)}>
      <span className="text-xs font-medium uppercase tracking-caps text-sort-900">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-gra-500">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "block w-full rounded-none border border-gra-300 bg-white px-3.5 py-2.5 text-[15px] text-sort-900 placeholder:text-gra-500 focus:border-sort-900 focus:outline-none focus:ring-4 focus:ring-rosa-500/40 disabled:bg-gra-100 disabled:text-gra-500";

export function Table({ head, children, className }: { head: ReactNode[]; children: ReactNode; className?: string }) {
  return (
    <div className={cx("overflow-x-auto", className)}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gra-300 text-left text-[11px] uppercase tracking-caps text-gra-500">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gra-100">{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cx("px-4 py-3 align-top text-sort-700", className)}>{children}</td>;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sort-900/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className={cx("max-h-[92vh] w-full overflow-y-auto bg-white shadow-card", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-gra-300 bg-white px-5 py-4">
          <h3 className="text-lg font-medium text-sort-900">{title}</h3>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-gra-500 hover:bg-gra-100" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="inline-flex ring-1 ring-sort-900">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cx("px-3 py-2 text-xs font-medium uppercase tracking-caps", value === o.value ? "bg-sort-900 text-white" : "bg-white text-sort-900 hover:bg-gra-100")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
