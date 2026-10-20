"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { dietSum } from "@/lib/logic";
import { dietLabel, useT } from "@/lib/i18n";
import { DIET_KEYS, type DayOrder, type DietKey } from "@/lib/types";
import { Stepper, cx, inputCls } from "./ui";

/** Portions + special diets for one day. Diet portions are part of the total (BR-3). */
export function DayEditor({
  value,
  onChange,
  disabled,
  showComment = true,
  label,
}: {
  value: DayOrder;
  onChange: (o: DayOrder) => void;
  disabled?: boolean;
  showComment?: boolean;
  label: string;
}) {
  const { t, lang } = useT();
  const special = dietSum(value);
  const [open, setOpen] = useState(false);
  const over = special > value.total;

  const setDiet = (k: DietKey, n: number) => onChange({ ...value, diets: { ...value.diets, [k]: n } });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Stepper label={`${label} ${t("portions", "porsjoner")}`} value={value.total} onChange={(n) => onChange({ ...value, total: n })} disabled={disabled} />
        <span className="text-sm text-gra-500">{t("portions", "porsjoner")}</span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cx(
            "ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium",
            over ? "text-red-600" : "text-sort-900 hover:bg-gra-100",
          )}
        >
          {t("Special diets", "Spesialkost")}{special > 0 && ` (${special})`}
          <ChevronDown className={cx("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {special > 0 && !open && (
        <p className="mt-2 text-xs text-gra-500">
          {DIET_KEYS.filter((k) => value.diets[k] > 0)
            .map((k) => `${value.diets[k]} ${dietLabel(k, lang).toLowerCase()}`)
            .join(" · ")}
          {value.total - special >= 0 && ` · ${value.total - special} ${t("regular", "vanlig")}`}
        </p>
      )}
      {open && (
        <div className="mt-3 rounded-lg bg-krem p-3">
          <p className="mb-2 text-xs text-gra-500">{t(`Of the ${value.total} portions, how many need a special diet?`, `Hvor mange av de ${value.total} porsjonene trenger spesialkost?`)}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DIET_KEYS.map((k) => (
              <div key={k} className="flex items-center justify-between gap-2">
                <span className="text-sm text-sort-700">{dietLabel(k, lang)}</span>
                <Stepper size="sm" label={`${label} ${dietLabel(k, lang)}`} value={value.diets[k]} onChange={(n) => setDiet(k, n)} disabled={disabled} />
              </div>
            ))}
          </div>
          {value.diets.other > 0 && (
            <input
              className={cx(inputCls, "mt-3")}
              placeholder={t("Describe other dietary needs (e.g. no pork, nut allergy)", "Beskriv andre kosthensyn (f.eks. uten svin, nøtteallergi)")}
              value={value.otherNote ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ ...value, otherNote: e.target.value })}
            />
          )}
          {over && <p className="mt-2 text-xs font-medium text-red-600">{t(`Special diets (${special}) exceed total portions (${value.total}).`, `Spesialkost (${special}) er flere enn totalt antall porsjoner (${value.total}).`)}</p>}
        </div>
      )}
      {showComment && (
        <input
          className={cx(inputCls, "mt-3")}
          placeholder={t("Delivery comment (optional)", "Kommentar til leveringen (valgfritt)")}
          value={value.comment ?? ""}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, comment: e.target.value })}
        />
      )}
    </div>
  );
}
