"use client";

import { Eye, EyeOff, ImagePlus, Pencil } from "lucide-react";
import { useState } from "react";
import { DateNav } from "@/components/DateNav";
import { DishImage } from "@/components/DishImage";
import { Badge, Button, Card, Field, Modal, PageHeader, inputCls } from "@/components/ui";
import { addDays, fmtDay, holidayName, toISO, weekDates, weekStart } from "@/lib/dates";
import { MAIN_DISHES, VEG_DISHES } from "@/lib/dishes";
import { useDemo, useMenu, useNow } from "@/lib/store";
import { allergenLabel, allergenList, dietLabel, dishDescription, dishName, useT, type Lang } from "@/lib/i18n";
import { ALLERGENS, DISH_LABELS, WEEKDAYS, type Dish, type WeekMenu, type Weekday } from "@/lib/types";

// The edit form changes the text for the current language only.
const withText = (d: Dish, lang: Lang, field: "name" | "description", value: string): Dish =>
  lang === "no" ? { ...d, no: { name: d.no?.name ?? d.name, description: d.no?.description ?? d.description, [field]: value } } : { ...d, [field]: value };

export default function AdminMenuPage() {
  const today = toISO(useNow());
  const { t } = useT();
  const [ws, setWs] = useState(addDays(weekStart(today), 7));
  return (
    <div>
      <PageHeader
        title={t("Menus", "Menyer")}
        subtitle={t("Plan and publish the weekly menu. Customers see published weeks only.", "Planlegg og publiser ukemenyen. Kundene ser bare publiserte uker.")}
      />
      <div className="mb-6">
        <DateNav value={ws} onChange={setWs} step={7} mode="week" />
      </div>
      <MenuEditor key={ws} ws={ws} />
    </div>
  );
}

function MenuEditor({ ws }: { ws: string }) {
  const saved = useMenu(ws);
  const saveMenu = useDemo((s) => s.saveMenu);
  const notify = useDemo((s) => s.notify);
  const { t, lang } = useT();
  const [draft, setDraft] = useState<WeekMenu>(() => structuredClone(saved));
  const [editing, setEditing] = useState<{ wd: Weekday; slot: "main" | "vegetarian"; dish: Dish } | null>(null);
  const dates = weekDates(ws);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const setDish = (wd: Weekday, slot: "main" | "vegetarian", dish: Dish) =>
    setDraft((m) => ({ ...m, days: { ...m.days, [wd]: { ...m.days[wd], [slot]: dish } } }));

  const save = (published = draft.published) => {
    const m = { ...draft, published };
    saveMenu(m);
    setDraft(m);
    notify({
      title: published ? t("Menu published", "Menyen er publisert") : t("Menu saved as draft", "Menyen er lagret som utkast"),
      body: published ? t("Customers can now see this week's menu.", "Kundene kan nå se menyen for denne uken.") : undefined,
    });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {draft.published ? <Badge tone="green"><Eye className="h-3 w-3" /> {t("Published", "Publisert")}</Badge> : <Badge tone="amber"><EyeOff className="h-3 w-3" /> {t("Draft, not visible to customers", "Utkast, ikke synlig for kunder")}</Badge>}
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={() => save(draft.published)} disabled={!dirty}>
            {t("Save changes", "Lagre endringer")}
          </Button>
          {draft.published ? (
            <Button variant="danger" onClick={() => save(false)}>
              {t("Unpublish", "Avpubliser")}
            </Button>
          ) : (
            <Button variant="accent" onClick={() => save(true)}>
              {t("Publish week", "Publiser uke")}
            </Button>
          )}
        </div>
      </div>
      <div className="grid gap-4">
        {WEEKDAYS.map((wd) => (
          <Card key={wd} className="p-5">
            <p className="mb-4 font-medium text-sort-900">
              {fmtDay(dates[wd])} {holidayName(dates[wd]) && <Badge className="ml-2">{t("Closed", "Stengt")} · {holidayName(dates[wd])}</Badge>}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {(["main", "vegetarian"] as const).map((slot) => {
                const dish = draft.days[wd][slot];
                const options = slot === "main" ? MAIN_DISHES : VEG_DISHES;
                return (
                  <div key={slot} className="flex gap-4">
                    <DishImage dish={dish} className="h-24 w-28 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-gra-500">{slot === "main" ? t("Main dish", "Hovedrett") : t("Vegetarian", "Vegetar")}</p>
                      <select
                        className={`${inputCls} mt-1`}
                        value={options.some((o) => o.id === dish.id) ? dish.id : "custom"}
                        onChange={(e) => {
                          const d = options.find((o) => o.id === e.target.value);
                          if (d) setDish(wd, slot, d);
                        }}
                      >
                        {options.map((o) => (
                          <option key={o.id} value={o.id}>
                            {dishName(o, lang)}
                          </option>
                        ))}
                        {!options.some((o) => o.id === dish.id) && <option value="custom">
                            {dishName(dish, lang)} ({t("edited", "endret")})
                          </option>}
                      </select>
                      <p className="mt-1 line-clamp-2 text-xs text-gra-500">{t("Allergens", "Allergener")}: {allergenList(dish.allergens, lang) || t("none", "ingen")}</p>
                      <Button variant="ghost" size="sm" className="mt-1 -ml-2" onClick={() => setEditing({ wd, slot, dish: structuredClone(dish) })}>
                        <Pencil className="h-3.5 w-3.5" /> Edit details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={t("Edit dish", "Rediger rett")} wide>
        {editing && (
          <div className="space-y-4">
            <Field label={t("Name", "Navn")}>
              <input className={inputCls} value={dishName(editing.dish, lang)} onChange={(e) => setEditing({ ...editing, dish: withText(editing.dish, lang, "name", e.target.value) })} />
            </Field>
            <Field label={t("Description", "Beskrivelse")}>
              <textarea
                rows={2}
                className={inputCls}
                value={dishDescription(editing.dish, lang)}
                onChange={(e) => setEditing({ ...editing, dish: withText(editing.dish, lang, "description", e.target.value) })}
              />
            </Field>
            <div>
              <p className="text-sm font-medium text-sort-700">{t("Allergens (the 14 regulated allergens)", "Allergener (de 14 lovpålagte allergenene)")}</p>
              <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
                {ALLERGENS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm capitalize text-sort-700">
                    <input
                      type="checkbox"
                      className="rounded text-sort-700"
                      checked={editing.dish.allergens.includes(a)}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          dish: { ...editing.dish, allergens: e.target.checked ? [...editing.dish.allergens, a] : editing.dish.allergens.filter((x) => x !== a) },
                        })
                      }
                    />
                    {allergenLabel(a, lang)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-sort-700">{t("Labels", "Merking")}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {DISH_LABELS.map((l) => (
                  <label key={l} className="flex items-center gap-2 text-sm text-sort-700">
                    <input
                      type="checkbox"
                      className="rounded text-sort-700"
                      checked={editing.dish.labels.includes(l)}
                      onChange={(e) =>
                        setEditing({ ...editing, dish: { ...editing.dish, labels: e.target.checked ? [...editing.dish.labels, l] : editing.dish.labels.filter((x) => x !== l) } })
                      }
                    />
                    {dietLabel(l, lang)}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DishImage dish={editing.dish} className="h-16 w-20 rounded-lg" />
              <Button variant="secondary" size="sm" onClick={() =>
                  notify({ kind: "info", title: t("Photo upload", "Bildeopplasting"), body: t("Uploading photos is part of the production build.", "Bildeopplasting kommer i produksjonsversjonen.") })
                }>
                <ImagePlus className="h-4 w-4" /> {t("Upload photo", "Last opp bilde")}
              </Button>
            </div>
            <div className="flex justify-end gap-2 border-t border-gra-300 pt-4">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                {t("Cancel", "Avbryt")}
              </Button>
              <Button
                onClick={() => {
                  // Edited dishes get their own id so the library dish stays unchanged.
                  const base = editing.dish.id.replace(/~.*$/, "");
                  setDish(editing.wd, editing.slot, { ...editing.dish, id: `${base}~${Date.now()}` });
                  setEditing(null);
                }}
              >
                {t("Apply", "Bruk")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
