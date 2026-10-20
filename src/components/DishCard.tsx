import { DIET_LABEL, type Dish } from "@/lib/types";
import { DishImage } from "./DishImage";
import { Badge } from "./ui";

const LABEL_TEXT: Record<string, string> = { ...DIET_LABEL };

export function DishCard({ dish, kind }: { dish: Dish; kind: "Main" | "Vegetarian" }) {
  return (
    <div className="flex gap-4">
      <DishImage dish={dish} className="h-20 w-24 shrink-0 rounded-lg sm:h-24 sm:w-32" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-gra-500">{kind}</p>
        <p className="font-medium text-sort-900">{dish.name}</p>
        <p className="mt-0.5 text-sm text-gra-500">{dish.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {dish.labels.map((l) => (
            <Badge key={l} tone="green">
              {LABEL_TEXT[l]}
            </Badge>
          ))}
          {dish.allergens.length > 0 && (
            <span className="text-xs text-gra-500">
              Allergens: <span className="font-medium text-sort-700">{dish.allergens.join(", ")}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
