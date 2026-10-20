"use client";

import { CheckCircle2, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LangToggle } from "@/components/LangToggle";
import { Logo } from "@/components/Logo";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { frequencyLabel, segmentLabel, useT } from "@/lib/i18n";
import { areaFor } from "@/lib/logic";
import { useDemo } from "@/lib/store";
import type { InvoiceChannel, InvoiceFrequency } from "@/lib/types";

const SEGMENTS = ["Shared office space", "Commercial building", "Public sector", "Private company", "Industrial company"];

export default function RegisterPage() {
  const register = useDemo((s) => s.registerCustomer);
  const notify = useDemo((s) => s.notify);
  const areas = useDemo((s) => s.settings.deliveryAreas);
  const router = useRouter();
  const { t, lang } = useT();

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
      setErrors({ orgNumber: t("An organisation number has 9 digits.", "Et organisasjonsnummer har 9 sifre.") });
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
    if (orgDigits.length !== 9) err.orgNumber = t("An organisation number has 9 digits.", "Et organisasjonsnummer har 9 sifre.");
    if (!f.name.trim()) err.name = t("Required", "Må fylles ut");
    if (!f.contactName.trim()) err.contactName = t("Required", "Må fylles ut");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) err.email = t("Enter a valid email", "Skriv inn en gyldig e-postadresse");
    if (!f.phone.trim()) err.phone = t("Required", "Må fylles ut");
    if (!f.street.trim()) err.street = t("Required", "Må fylles ut");
    if (!area) err.postcode = t("We don't deliver to this postcode yet.", "Vi leverer ikke til dette postnummeret ennå.");
    if (f.password.length < 8) err.password = t("At least 8 characters", "Minst 8 tegn");
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
      deliveryAddresses: [{ id: `a-${Date.now()}`, label: t("Main office", "Hovedkontor"), street: f.street, postcode: f.postcode, city: f.city }],
      billingAddress: f.sameBilling ? addr : f.billingAddress,
      ehfEnabled: f.invoiceChannel === "EHF",
      invoiceChannel: f.invoiceChannel,
      invoiceFrequency: f.invoiceFrequency,
      pricePerPortion: null,
    });
    notify({
      title: t(`Welcome, ${f.name.trim()}!`, `Velkommen, ${f.name.trim()}!`),
      body: t(
        "Account created, customer added to Tripletex and confirmation email sent (simulated).",
        "Kontoen er opprettet, kunden er lagt inn i Tripletex og bekreftelse er sendt på e-post (simulert).",
      ),
    });
    router.push("/portal/standing?welcome=1");
  };

  const err = (k: string) => errors[k] && <span className="mt-1 block text-xs text-red-600">{errors[k]}</span>;

  return (
    <div className="relative min-h-screen bg-krem px-4 py-10">
      <div className="absolute right-4 top-4">
        <LangToggle />
      </div>
      <div className="mx-auto max-w-2xl">
        <Logo />
        <h1 className="mt-8 text-3xl font-medium text-sort-900">{t("Register your company", "Registrer bedriften")}</h1>
        <p className="mt-1 text-gra-500">{t("Takes about two minutes. You can place your first order straight after.", "Det tar omtrent to minutter. Du kan legge inn første bestilling rett etterpå.")}</p>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">{t("Company", "Bedrift")}</h2>
            <Field label={t("Organisation number", "Organisasjonsnummer")} hint={t("We look up your company in the Brønnøysund register.", "Vi slår opp bedriften i Brønnøysundregistrene.")}>
              <div className="flex gap-2">
                <input className={inputCls} inputMode="numeric" placeholder={t("9 digits", "9 sifre")} value={f.orgNumber} onChange={(e) => set("orgNumber", e.target.value)} />
                <Button type="button" variant="secondary" onClick={lookup}>
                  <Search className="h-4 w-4" /> {t("Look up", "Slå opp")}
                </Button>
              </div>
              {err("orgNumber")}
              {lookedUp && (
                <span className="mt-1 flex items-center gap-1 text-xs text-sort-900">
                  <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                  {t("Found in the Brønnøysund register (simulated). Details filled in below.", "Funnet i Brønnøysundregistrene (simulert). Opplysningene er fylt inn nedenfor.")}
                </span>
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Company name", "Firmanavn")}>
                <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} />
                {err("name")}
              </Field>
              <Field label={t("Type of business", "Type virksomhet")}>
                <select className={inputCls} value={f.segment} onChange={(e) => set("segment", e.target.value)}>
                  {SEGMENTS.map((s) => (
                    <option key={s} value={s}>
                      {segmentLabel(s, lang)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">{t("Contact person", "Kontaktperson")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Full name", "Fullt navn")}>
                <input className={inputCls} value={f.contactName} onChange={(e) => set("contactName", e.target.value)} />
                {err("contactName")}
              </Field>
              <Field label={t("Phone", "Telefon")}>
                <input className={inputCls} type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
                {err("phone")}
              </Field>
              <Field label={t("Email (used to log in)", "E-post (brukes til innlogging)")}>
                <input className={inputCls} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
                {err("email")}
              </Field>
              <Field label={t("Password", "Passord")}>
                <input className={inputCls} type="password" value={f.password} onChange={(e) => set("password", e.target.value)} />
                {err("password")}
              </Field>
            </div>
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">{t("Delivery address", "Leveringsadresse")}</h2>
            <Field label={t("Street address", "Gateadresse")}>
              <input className={inputCls} value={f.street} onChange={(e) => set("street", e.target.value)} />
              {err("street")}
            </Field>
            <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <Field label={t("Postcode", "Postnummer")}>
                <input className={inputCls} inputMode="numeric" maxLength={4} value={f.postcode} onChange={(e) => set("postcode", e.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label={t("City", "Poststed")}>
                <input className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)} />
              </Field>
            </div>
            {area && <p className="text-xs text-sort-900">✓ {t("Inside our delivery area:", "Innenfor leveringsområdet vårt:")} {area.name}</p>}
            {err("postcode")}
          </Card>

          <Card className="space-y-4 p-6">
            <h2 className="font-medium text-sort-900">{t("Invoicing", "Fakturering")}</h2>
            <label className="flex items-center gap-2 text-sm text-sort-700">
              <input type="checkbox" checked={f.sameBilling} onChange={(e) => set("sameBilling", e.target.checked)} className="rounded text-sort-700" />
              {t("Billing address is the same as the delivery address", "Fakturaadressen er den samme som leveringsadressen")}
            </label>
            {!f.sameBilling && (
              <Field label={t("Billing address", "Fakturaadresse")}>
                <input className={inputCls} value={f.billingAddress} onChange={(e) => set("billingAddress", e.target.value)} />
              </Field>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Invoice format", "Fakturaformat")}>
                <select className={inputCls} value={f.invoiceChannel} onChange={(e) => set("invoiceChannel", e.target.value)}>
                  <option value="EHF">{t("EHF (electronic invoice)", "EHF (elektronisk faktura)")}</option>
                  <option value="PDF">{t("PDF by email", "PDF på e-post")}</option>
                </select>
              </Field>
              <Field label={t("Invoice frequency", "Fakturafrekvens")}>
                <select className={inputCls} value={f.invoiceFrequency} onChange={(e) => set("invoiceFrequency", e.target.value)}>
                  <option value="monthly">{frequencyLabel("monthly", lang)}</option>
                  <option value="weekly">{frequencyLabel("weekly", lang)}</option>
                  <option value="agreement">{frequencyLabel("agreement", lang)}</option>
                </select>
              </Field>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gra-500">
              {t("Already a customer?", "Allerede kunde?")}{" "}
              <Link href="/login" className="font-medium text-rosa-700 hover:underline">
                {t("Log in", "Logg inn")}
              </Link>
            </p>
            <Button type="submit" size="lg">
              {t("Create account", "Opprett konto")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
