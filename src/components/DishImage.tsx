import { asset } from "@/lib/asset";
import { dishName, useT } from "@/lib/i18n";
import type { Dish } from "@/lib/types";
import { cx } from "./ui";

// One illustrative photo per library dish, in public/dishes/<dish id>.jpg.
// Dishes edited in admin keep their library id before the "~" suffix.
export function DishImage({ dish, className }: { dish: Dish; className?: string }) {
  const { t, lang } = useT();
  const id = dish.id.split("~")[0];
  return (
    <div className={cx("relative overflow-hidden bg-gra-100", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(`/dishes/${id}.jpg`)} alt={dishName(dish, lang)} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <span className="absolute bottom-1 right-1 bg-white/85 px-1.5 text-[9px] font-medium uppercase tracking-caps text-gra-500">{t("Sample photo", "Eksempelbilde")}</span>
    </div>
  );
}
