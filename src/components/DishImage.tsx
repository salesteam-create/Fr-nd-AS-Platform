import { Salad, UtensilsCrossed } from "lucide-react";
import type { Dish } from "@/lib/types";
import { cx } from "./ui";

// Placeholder food photo: a coloured tile derived from the dish. Replace with real photos later.
export function DishImage({ dish, className }: { dish: Dish; className?: string }) {
  const veg = dish.labels.includes("vegetarian");
  const Icon = veg ? Salad : UtensilsCrossed;
  return (
    <div
      className={cx("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${dish.hue} 55% 78%), hsl(${(dish.hue + 30) % 360} 45% 62%))`,
      }}
      aria-hidden
    >
      <Icon className="h-1/3 w-1/3 text-white/80" strokeWidth={1.5} />
      <span className="absolute bottom-1 right-2 text-[10px] font-medium uppercase tracking-wide text-white/70">Photo</span>
    </div>
  );
}
