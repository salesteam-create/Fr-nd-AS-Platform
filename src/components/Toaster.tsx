"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useDemo } from "@/lib/store";

export function Toaster() {
  const toasts = useDemo((s) => s.toasts);
  const dismiss = useDemo((s) => s.dismiss);
  const openEmail = useDemo((s) => s.openEmail);
  const { t: tr } = useT();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      {toasts.map((t) => {
        const Icon = t.kind === "error" ? XCircle : t.kind === "info" ? Info : CheckCircle2;
        return (
          <div
            key={t.id}
            role="status"
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex w-full max-w-sm cursor-pointer items-start gap-3 bg-white p-4 text-left shadow-card ring-1 ring-gra-300"
          >
            <Icon className={t.kind === "error" ? "h-5 w-5 text-red-600" : t.kind === "info" ? "h-5 w-5 text-sky-600" : "h-5 w-5 text-sort-700"} />
            <div>
              <p className="text-sm font-medium text-sort-900">{t.title}</p>
              {t.body && <p className="mt-0.5 text-sm text-gra-500">{t.body}</p>}
              {t.emailId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEmail(t.emailId!);
                    dismiss(t.id);
                  }}
                  className="mt-1.5 text-xs font-medium uppercase tracking-caps text-sort-900 underline underline-offset-4 hover:text-rosa-700"
                >
                  {tr("View email", "Se e-post")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
