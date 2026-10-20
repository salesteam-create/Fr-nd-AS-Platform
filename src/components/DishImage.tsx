import { asset } from "@/lib/asset";
import { useT } from "@/lib/i18n";
import type { Dish } from "@/lib/types";
import { cx } from "./ui";

// Sample food photos from the design system until each dish has its own photo.
const PHOTOS = ["/brand/photo-01.jpg", "/brand/photo-02.jpg"];

export function DishImage({ dish, className }: { dish: Dish; className?: string }) {
  const { t } = useT();
  const n = [...dish.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return (
    <div className={cx("relative overflow-hidden bg-gra-100", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={asset(PHOTOS[n % PHOTOS.length])} alt="" className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: n % 2 ? "50% 40%" : "50% 60%" }} />
      <span className="absolute bottom-1 right-1 bg-white/85 px-1.5 text-[9px] font-medium uppercase tracking-caps text-gra-500">{t("Sample photo", "Eksempelbilde")}</span>
    </div>
  );
}
