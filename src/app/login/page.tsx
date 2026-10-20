"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LangToggle } from "@/components/LangToggle";
import { Logo } from "@/components/Logo";
import { Badge, Button, Card, Field, inputCls } from "@/components/ui";
import { segmentLabel, useT } from "@/lib/i18n";
import { useDemo } from "@/lib/store";

export default function LoginPage() {
  const customers = useDemo((s) => s.customers.filter((c) => c.active));
  const login = useDemo((s) => s.login);
  const notify = useDemo((s) => s.notify);
  const router = useRouter();
  const { t, lang } = useT();
  const [email, setEmail] = useState(customers[0]?.email ?? "");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = customers.find((x) => x.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()));
    if (!c || !password) {
      setError(t("We couldn't find an account with that email. Pick a demo account below.", "Vi fant ingen konto med den e-postadressen. Velg en demokonto nedenfor."));
      return;
    }
    login(c.id);
    router.push("/portal");
  };

  const sso = (provider: string) =>
    notify({
      kind: "info",
      title: t(`${provider} sign-in`, `Innlogging med ${provider}`),
      body: t("Single sign-on is planned for a later phase (FR-04).", "Innlogging med Microsoft eller Google kommer i en senere fase (FR-04)."),
    });

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-krem px-4 py-12">
      <div className="absolute right-4 top-4">
        <LangToggle />
      </div>
      <Logo />
      <Card className="mt-8 w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-medium text-sort-900">{t("Log in", "Logg inn")}</h1>
        <p className="mt-1 text-sm text-gra-500">{t("Order and manage lunch for your company.", "Bestill og administrer lunsj for bedriften din.")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label={t("Email", "E-post")}>
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label={t("Password", "Passord")}>
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" size="lg">
            {t("Log in", "Logg inn")}
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-gra-500">
          <span className="h-px flex-1 bg-gra-300" /> {t("or", "eller")} <span className="h-px flex-1 bg-gra-300" />
        </div>
        <div className="grid gap-2">
          <Button variant="secondary" onClick={() => sso("Microsoft 365")}>
            {t("Continue with Microsoft 365", "Fortsett med Microsoft 365")} <Badge>{t("Later", "Senere")}</Badge>
          </Button>
          <Button variant="secondary" onClick={() => sso("Google Workspace")}>
            {t("Continue with Google Workspace", "Fortsett med Google Workspace")} <Badge>{t("Later", "Senere")}</Badge>
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-gra-500">
          {t("New customer?", "Ny kunde?")}{" "}
          <Link href="/register" className="font-medium text-rosa-700 hover:underline">
            {t("Register your company", "Registrer bedriften")}
          </Link>
        </p>
      </Card>

      <Card className="mt-6 w-full max-w-md p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-gra-500">{t("Demo accounts", "Demokontoer")}</p>
        <div className="mt-3 grid gap-1">
          {customers.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                login(c.id);
                router.push("/portal");
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-gra-100"
            >
              <span className="font-medium text-sort-900">{c.name}</span>
              <span className="text-xs text-gra-500">{segmentLabel(c.segment, lang)}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
