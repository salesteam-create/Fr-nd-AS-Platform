import { allergenList, dietLabel, dishDescription, dishName, useT } from "@/lib/i18n";
import type { Dish } from "@/lib/types";
import { DishImage } from "./DishImage";
import { Badge } from "./ui";

export function DishCard({ dish, kind }: { dish: Dish; kind: "Main" | "Vegetarian" }) {
  const { t, lang } = useT();
  return (
    <div className="flex gap-4">
      <DishImage dish={dish} className="h-20 w-24 shrink-0 rounded-lg sm:h-24 sm:w-32" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gra-500">{kind === "Main" ? t("Main", "Hovedrett") : t("Vegetarian", "Vegetar")}</p>
        <p className="font-medium text-sort-900">{dishName(dish, lang)}</p>
        <p className="mt-0.5 text-sm text-gra-500">{dishDescription(dish, lang)}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {dish.labels.map((l) => (
            <Badge key={l} tone="green">
              {dietLabel(l, lang)}
            </Badge>
          ))}
          {dish.allergens.length > 0 && (
            <span className="text-xs text-gra-500">
              {t("Allergens", "Allergener")}: <span className="font-medium text-sort-700">{allergenList(dish.allergens, lang)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
