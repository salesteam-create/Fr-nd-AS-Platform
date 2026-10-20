"use client";

import { MapPin, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CardHeader, Field, PageHeader, inputCls } from "@/components/ui";
import { areaFor } from "@/lib/logic";
import { useCurrentCustomer, useDemo } from "@/lib/store";
import type { InvoiceChannel, InvoiceFrequency } from "@/lib/types";
import { frequencyLabel, useT } from "@/lib/i18n";

export default function CompanyPage() {
  const customer = useCurrentCustomer()!;
  const update = useDemo((s) => s.updateCustomer);
  const notify = useDemo((s) => s.notify);
  const areas = useDemo((s) => s.settings.deliveryAreas);
  const { t, lang } = useT();

  const [contact, setContact] = useState({ contactName: customer.contactName, phone: customer.phone, billingAddress: customer.billingAddress });
  const [addr, setAddr] = useState({ label: "", street: "", postcode: "", city: "Stavanger" });
  const [invite, setInvite] = useState({ name: "", email: "" });

  const saveContact = () => {
    update(customer.id, contact);
    notify({ title: t("Company details saved", "Firmaopplysningene er lagret"), body: t("Changes synchronised to Tripletex (simulated).", "Endringene er synkronisert til Tripletex (simulert).") });
  };

  const addAddress = () => {
    if (!addr.street || !areaFor(addr.postcode, areas)) {
      notify({ kind: "error", title: t("Address outside delivery area", "Adressen er utenfor leveringsområdet"), body: t("Check the postcode.", "Sjekk postnummeret.") });
      return;
    }
    update(customer.id, { deliveryAddresses: [...customer.deliveryAddresses, { id: `a-${Date.now()}`, ...addr, label: addr.label || t("Other location", "Annen lokasjon") }] });
    setAddr({ label: "", street: "", postcode: "", city: "Stavanger" });
    notify({ title: t("Delivery address added", "Leveringsadressen er lagt til") });
  };

  const inviteUser = () => {
    if (!invite.name || !/^\S+@\S+\.\S+$/.test(invite.email)) return;
    update(customer.id, { users: [...customer.users, { id: `u-${Date.now()}`, ...invite, role: "user" }] });
    notify({
      title: t("Invitation sent", "Invitasjonen er sendt"),
      body: t(`${invite.email} can now log in and order for ${customer.name} (simulated).`, `${invite.email} kan nå logge inn og bestille for ${customer.name} (simulert).`),
    });
    setInvite({ name: "", email: "" });
  };

  return (
    <div>
      <PageHeader title={t("Company", "Firma")} subtitle={`${customer.name} · ${t("Org. no.", "Org.nr.")} ${customer.orgNumber}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={t("Contact and billing", "Kontakt og fakturering")} />
          <div className="space-y-4 p-5">
            <Field label={t("Contact person", "Kontaktperson")}>
              <input className={inputCls} value={contact.contactName} onChange={(e) => setContact({ ...contact, contactName: e.target.value })} />
            </Field>
            <Field label={t("Phone", "Telefon")}>
              <input className={inputCls} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            </Field>
            <Field label={t("Billing address", "Fakturaadresse")}>
              <input className={inputCls} value={contact.billingAddress} onChange={(e) => setContact({ ...contact, billingAddress: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Invoice format", "Fakturaformat")}>
                <select className={inputCls} value={customer.invoiceChannel} onChange={(e) => update(customer.id, { invoiceChannel: e.target.value as InvoiceChannel, ehfEnabled: e.target.value === "EHF" })}>
                  <option value="EHF">EHF</option>
                  <option value="PDF">{t("PDF by email", "PDF på e-post")}</option>
                </select>
              </Field>
              <Field label={t("Invoice frequency", "Fakturafrekvens")}>
                <select className={inputCls} value={customer.invoiceFrequency} onChange={(e) => update(customer.id, { invoiceFrequency: e.target.value as InvoiceFrequency })}>
                  <option value="monthly">{frequencyLabel("monthly", lang)}</option>
                  <option value="weekly">{frequencyLabel("weekly", lang)}</option>
                  <option value="agreement">{frequencyLabel("agreement", lang)}</option>
                </select>
              </Field>
            </div>
            <Button onClick={saveContact}>{t("Save", "Lagre")}</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title={t("Delivery addresses", "Leveringsadresser")} subtitle={t("Add more locations if you have several offices", "Legg til flere lokasjoner hvis dere har flere kontorer")} />
          <div className="divide-y divide-gra-100">
            {customer.deliveryAddresses.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                <MapPin className="mt-0.5 h-4 w-4 text-sort-700" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-sort-900">{a.label}</p>
                  <p className="text-sm text-gra-500">
                    {a.street}, {a.postcode} {a.city}
                  </p>
                </div>
                <Badge tone="green">{areaFor(a.postcode, areas)?.name ?? t("Outside area", "Utenfor området")}</Badge>
              </div>
            ))}
          </div>
          <div className="grid gap-2 border-t border-gra-300 p-5 sm:grid-cols-2">
            <input className={inputCls} placeholder={t("Label (e.g. Warehouse)", "Navn (f.eks. Lager)")} value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
            <input className={inputCls} placeholder={t("Street address", "Gateadresse")} value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} />
            <input className={inputCls} placeholder={t("Postcode", "Postnummer")} maxLength={4} value={addr.postcode} onChange={(e) => setAddr({ ...addr, postcode: e.target.value.replace(/\D/g, "") })} />
            <Button variant="secondary" onClick={addAddress}>
              <Plus className="h-4 w-4" /> {t("Add address", "Legg til adresse")}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={t("Users", "Brukere")} subtitle={t("People who can order on behalf of the company", "Personer som kan bestille på vegne av bedriften")} />
          <div className="divide-y divide-gra-100">
            {customer.users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-sort-900">{u.name}</p>
                  <p className="text-sm text-gra-500">{u.email}</p>
                </div>
                <Badge tone={u.role === "admin" ? "blue" : "gray"}>{u.role === "admin" ? t("Company admin", "Firmaadministrator") : t("User", "Bruker")}</Badge>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-gra-300 p-5">
            <input className={`${inputCls} sm:max-w-xs`} placeholder={t("Name", "Navn")} value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
            <input className={`${inputCls} sm:max-w-xs`} placeholder={t("Email", "E-post")} value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            <Button variant="secondary" onClick={inviteUser}>
              <UserPlus className="h-4 w-4" /> {t("Invite user", "Inviter bruker")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
