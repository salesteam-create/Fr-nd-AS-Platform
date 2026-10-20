"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, Card, CardHeader, Field, PageHeader, inputCls } from "@/components/ui";
import { useDemo } from "@/lib/store";
import type { DeliveryArea } from "@/lib/types";

export default function SettingsPage() {
  const settings = useDemo((s) => s.settings);
  const updateSettings = useDemo((s) => s.updateSettings);
  const notify = useDemo((s) => s.notify);
  const [hour, setHour] = useState(settings.deadlineHour);
  const [vat, setVat] = useState(String(Math.round(settings.vatRate * 100)));
  const [areas, setAreas] = useState<DeliveryArea[]>(settings.deliveryAreas);

  const save = () => {
    updateSettings({ deadlineHour: hour, vatRate: (Number(vat) || 0) / 100, deliveryAreas: areas.filter((a) => a.name && a.postcodeFrom && a.postcodeTo) });
    notify({ title: "Settings saved" });
  };

  return (
    <div>
      <PageHeader title="Settings" action={<Button onClick={save}>Save settings</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Order deadline" subtitle="When orders lock before delivery" />
          <div className="space-y-4 p-5">
            <Field label="Lock orders at (on the working day before delivery)">
              <select className={inputCls} value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </Field>
            <p className="text-sm text-gra-500">Monday deliveries lock on Friday. Weekends and public holidays are skipped.</p>
          </div>
        </Card>
        <Card>
          <CardHeader title="Pricing" />
          <div className="space-y-4 p-5">
            <Field label="VAT rate (%)" hint="Assumed 15% (food). To be confirmed with Frænd's accountant.">
              <input className={inputCls} inputMode="numeric" value={vat} onChange={(e) => setVat(e.target.value.replace(/\D/g, ""))} />
            </Field>
            <p className="text-sm text-gra-500">The standard price is managed under Customers & prices.</p>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Delivery areas" subtitle="Customers can only register addresses inside these postcode ranges" />
          <div className="space-y-2 p-5">
            {areas.map((a, i) => (
              <div key={a.id} className="grid grid-cols-[1fr_6rem_6rem_auto] gap-2">
                <input className={inputCls} value={a.name} onChange={(e) => setAreas(areas.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <input className={inputCls} value={a.postcodeFrom} maxLength={4} onChange={(e) => setAreas(areas.map((x, j) => (j === i ? { ...x, postcodeFrom: e.target.value } : x)))} />
                <input className={inputCls} value={a.postcodeTo} maxLength={4} onChange={(e) => setAreas(areas.map((x, j) => (j === i ? { ...x, postcodeTo: e.target.value } : x)))} />
                <Button variant="ghost" aria-label="Remove area" onClick={() => setAreas(areas.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setAreas([...areas, { id: `area-${Date.now()}`, name: "", postcodeFrom: "", postcodeTo: "" }])}>
              <Plus className="h-4 w-4" /> Add area
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
