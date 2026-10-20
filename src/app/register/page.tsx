"use client";

import { CheckCircle2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { areaFor } from "@/lib/logic";
import { useDemo } from "@/lib/store";
import type { InvoiceChannel, InvoiceFrequency } from "@/lib/types";

const SEGMENTS = ["Shared office space", "Commercial building", "Public sector", "Private company", "Industrial company"];

export default function RegisterPage() {
  const register = useDemo((s) => s.registerCustomer);
  const notify = useDemo((s) => s.notify);
  const areas = useDemo((s) => s.settings.deliveryAreas);
  const router = useRouter();

  const [f, setF] = useState({
    orgNumber: "",
    name: "",
    segment: SEGMENTS[3],
    contactName: "",
    email: "",
    phone: "",
    street: "",
    postcode: "",
    city: "Stavanger",
    sameBilling: true,
    billingAddress: "",
    invoiceChannel: "EHF" as InvoiceChannel,
    invoiceFrequency: "monthly" as InvoiceFrequency,
    password: "",
  });
  const [lookedUp, setLookedUp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const orgDigits = f.orgNumber.replace(/\D/g, "");
  const area = f.postcode.length === 4 ? areaFor(f.postcode, areas) : null;

  // Simulated Brønnøysund register lookup (FR-02).
  const lookup = () => {
    if (orgDigits.length !== 9) {
      setErrors({ orgNumber: "An organisation number has 9 digits." });
      return;
    }
    setErrors({});
    setF((p) => ({
      ...p,
      name: p.name || "Solsiden Rådgivning AS",
      street: p.street || "Olav Vs gate 4",
      postcode: p.postcode || "4005",
      city: "Stavanger",
    }));
    setLookedUp(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (orgDigits.length !== 9) err.orgNumber = "An organisation number has 9 digits.";
    if (!f.name.trim()) err.name = "Required";
    if (!f.contactName.trim()) err.contactName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = "Enter a valid email";
    if (!f.phone.trim()) err.phone = "Required";
    if (!f.street.trim()) err.street = "Required";
    if (!area) err.postcode = "We don't deliver to this postcode yet.";
    if (f.password.length < 8) err.password = "At least 8 characters";
    setErrors(err);
    if (Object.keys(err).length) return;

    const addr = `${f.street}, ${f.postcode} ${f.city}`;
    register({
      name: f.name.trim(),
      orgNumber: orgDigits,
      segment: f.segment,
      contactName: f.contactName.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      deliveryAddresses: [{ id: `a-${Date.now()}`, label: "Main office", street: f.street, postcode: f.postcode, city: f.city }],
      billingAddress: f.sameBilling ? addr : f.billingAddress,
      ehfEnabled: f.invoiceChannel === "EHF",
      invoiceChannel: f.invoiceChannel,
      invoiceFrequency: f.invoiceFrequency,
      pricePerPortion: null,
    });
    notify({ title: `Welcome, ${f.name.trim()}!`, body: "Account created, customer added to Tripletex and confirmation email sent (simulated)." });
    router.push("/portal/standing?welcome=1");
  };

  const err = (k: string) => errors[k] && <span className="mt-1 block text-xs text-red-600">{errors[k]}</span>;

  return (
    <div className="min-h-screen bg-krem px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Logo />
        <h1 className="mt-8 text-3xl font-medium text-sort-900">Register your company</h1>
        <p className="mt-1 text-gra-500">Takes about two minutes. You can place your first order straight after.</p>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">Company</h2>
            <Field label="Organisation number" hint="We look up your company in the Brønnøysund register.">
              <div className="flex gap-2">
                <input className={inputCls} inputMode="numeric" placeholder="9 digits" value={f.orgNumber} onChange={(e) => set("orgNumber", e.target.value)} />
                <Button type="button" variant="secondary" onClick={lookup}>
                  <Search className="h-4 w-4" /> Look up
                </Button>
              </div>
              {err("orgNumber")}
              {lookedUp && (
                <span className="mt-1 flex items-center gap-1 text-xs text-sort-900">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Found in the Brønnøysund register (simulated). Details filled in below.
                </span>
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name">
                <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} />
                {err("name")}
              </Field>
              <Field label="Type of business">
                <select className={inputCls} value={f.segment} onChange={(e) => set("segment", e.target.value)}>
                  {SEGMENTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">Contact person</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input className={inputCls} value={f.contactName} onChange={(e) => set("contactName", e.target.value)} />
                {err("contactName")}
              </Field>
              <Field label="Phone">
                <input className={inputCls} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
                {err("phone")}
              </Field>
              <Field label="Email (used to log in)">
                <input className={inputCls} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
                {err("email")}
              </Field>
              <Field label="Password">
                <input className={inputCls} type="password" value={f.password} onChange={(e) => set("password", e.target.value)} />
                {err("password")}
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">Delivery address</h2>
            <Field label="Street address">
              <input className={inputCls} value={f.street} onChange={(e) => set("street", e.target.value)} />
              {err("street")}
            </Field>
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <Field label="Postcode">
                <input className={inputCls} inputMode="numeric" maxLength={4} value={f.postcode} onChange={(e) => set("postcode", e.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label="City">
                <input className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
            </div>
            {area && <p className="text-xs text-sort-900">✓ Inside our delivery area: {area.name}</p>}
            {err("postcode")}
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">Invoicing</h2>
            <label className="flex items-center gap-2 text-sm text-sort-700">
              <input type="checkbox" checked={f.sameBilling} onChange={(e) => set("sameBilling", e.target.checked)} className="rounded text-sort-700" />
              Billing address is the same as the delivery address
            </label>
            {!f.sameBilling && (
              <Field label="Billing address">
                <input className={inputCls} value={f.billingAddress} onChange={(e) => set("billingAddress", e.target.value)} />
              </Field>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Invoice format">
                <select className={inputCls} value={f.invoiceChannel} onChange={(e) => set("invoiceChannel", e.target.value)}>
                  <option value="EHF">EHF (electronic invoice)</option>
                  <option value="PDF">PDF by email</option>
                </select>
              </Field>
              <Field label="Invoice frequency">
                <select className={inputCls} value={f.invoiceFrequency} onChange={(e) => set("invoiceFrequency", e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="agreement">By agreement</option>
                </select>
              </Field>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gra-500">
              Already a customer?{" "}
              <Link href="/login" className="font-medium text-rosa-700 hover:underline">
                Log in
              </Link>
            </p>
            <Button type="submit" size="lg">
              Create account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
