"use client";

import { MapPin, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CardHeader, Field, PageHeader, inputCls } from "@/components/ui";
import { areaFor } from "@/lib/logic";
import { useCurrentCustomer, useDemo } from "@/lib/store";
import type { InvoiceChannel, InvoiceFrequency } from "@/lib/types";

export default function CompanyPage() {
  const customer = useCurrentCustomer()!;
  const update = useDemo((s) => s.updateCustomer);
  const notify = useDemo((s) => s.notify);
  const areas = useDemo((s) => s.settings.deliveryAreas);

  const [contact, setContact] = useState({ contactName: customer.contactName, phone: customer.phone, billingAddress: customer.billingAddress });
  const [addr, setAddr] = useState({ label: "", street: "", postcode: "", city: "Stavanger" });
  const [invite, setInvite] = useState({ name: "", email: "" });

  const saveContact = () => {
    update(customer.id, contact);
    notify({ title: "Company details saved", body: "Changes synchronised to Tripletex (simulated)." });
  };

  const addAddress = () => {
    if (!addr.street || !areaFor(addr.postcode, areas)) {
      notify({ kind: "error", title: "Address outside delivery area", body: "Check the postcode." });
      return;
    }
    update(customer.id, { deliveryAddresses: [...customer.deliveryAddresses, { id: `a-${Date.now()}`, ...addr, label: addr.label || "Other location" }] });
    setAddr({ label: "", street: "", postcode: "", city: "Stavanger" });
    notify({ title: "Delivery address added" });
  };

  const inviteUser = () => {
    if (!invite.name || !/^\S+@\S+\.\S+$/.test(invite.email)) return;
    update(customer.id, { users: [...customer.users, { id: `u-${Date.now()}`, ...invite, role: "user" }] });
    notify({ title: "Invitation sent", body: `${invite.email} can now log in and order for ${customer.name} (simulated).` });
    setInvite({ name: "", email: "" });
  };

  return (
    <div>
      <PageHeader title="Company" subtitle={`${customer.name} · Org. no. ${customer.orgNumber}`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Contact and billing" />
          <div className="space-y-4 p-5">
            <Field label="Contact person">
              <input className={inputCls} value={contact.contactName} onChange={(e) => setContact({ ...contact, contactName: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            </Field>
            <Field label="Billing address">
              <input className={inputCls} value={contact.billingAddress} onChange={(e) => setContact({ ...contact, billingAddress: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Invoice format">
                <select className={inputCls} value={customer.invoiceChannel} onChange={(e) => update(customer.id, { invoiceChannel: e.target.value as InvoiceChannel, ehfEnabled: e.target.value === "EHF" })}>
                  <option value="EHF">EHF</option>
                  <option value="PDF">PDF by email</option>
                </select>
              </Field>
              <Field label="Invoice frequency">
                <select className={inputCls} value={customer.invoiceFrequency} onChange={(e) => update(customer.id, { invoiceFrequency: e.target.value as InvoiceFrequency })}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="agreement">By agreement</option>
                </select>
              </Field>
            </div>
            <Button onClick={saveContact}>Save</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Delivery addresses" subtitle="Add more locations if you have several offices" />
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
                <Badge tone="green">{areaFor(a.postcode, areas)?.name ?? "Outside area"}</Badge>
              </div>
            ))}
          </div>
          <div className="grid gap-2 border-t border-gra-300 p-5 sm:grid-cols-2">
            <input className={inputCls} placeholder="Label (e.g. Warehouse)" value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
            <input className={inputCls} placeholder="Street address" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} />
            <input className={inputCls} placeholder="Postcode" maxLength={4} value={addr.postcode} onChange={(e) => setAddr({ ...addr, postcode: e.target.value.replace(/\D/g, "") })} />
            <Button variant="secondary" onClick={addAddress}>
              <Plus className="h-4 w-4" /> Add address
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Users" subtitle="People who can order on behalf of the company" />
          <div className="divide-y divide-gra-100">
            {customer.users.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-sort-900">{u.name}</p>
                  <p className="text-sm text-gra-500">{u.email}</p>
                </div>
                <Badge tone={u.role === "admin" ? "blue" : "gray"}>{u.role === "admin" ? "Company admin" : "User"}</Badge>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-gra-300 p-5">
            <input className={`${inputCls} sm:max-w-xs`} placeholder="Name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
            <input className={`${inputCls} sm:max-w-xs`} placeholder="Email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            <Button variant="secondary" onClick={inviteUser}>
              <UserPlus className="h-4 w-4" /> Invite user
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
