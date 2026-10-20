"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Badge, Button, Card, Field, inputCls } from "@/components/ui";
import { useDemo } from "@/lib/store";

export default function LoginPage() {
  const customers = useDemo((s) => s.customers.filter((c) => c.active));
  const login = useDemo((s) => s.login);
  const notify = useDemo((s) => s.notify);
  const router = useRouter();
  const [email, setEmail] = useState(customers[0]?.email ?? "");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = customers.find((x) => x.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase()));
    if (!c || !password) {
      setError("We couldn't find an account with that email. Pick a demo account below.");
      return;
    }
    login(c.id);
    router.push("/portal");
  };

  const sso = (provider: string) =>
    notify({ kind: "info", title: `${provider} sign-in`, body: "Single sign-on is planned for a later phase (FR-04)." });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-100 px-4 py-12">
      <Logo />
      <Card className="mt-8 w-full max-w-md p-6 sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-brand-900">Log in</h1>
        <p className="mt-1 text-sm text-gray-600">Order and manage lunch for your company.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email">
            <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <input className={inputCls} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" size="lg">
            Log in
          </Button>
        </form>
        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" /> or <span className="h-px flex-1 bg-gray-200" />
        </div>
        <div className="grid gap-2">
          <Button variant="secondary" onClick={() => sso("Microsoft 365")}>
            Continue with Microsoft 365 <Badge>Later</Badge>
          </Button>
          <Button variant="secondary" onClick={() => sso("Google Workspace")}>
            Continue with Google Workspace <Badge>Later</Badge>
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">
          New customer?{" "}
          <Link href="/register" className="font-medium text-accent-600 hover:underline">
            Register your company
          </Link>
        </p>
      </Card>

      <Card className="mt-6 w-full max-w-md p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Demo accounts</p>
        <div className="mt-3 grid gap-1">
          {customers.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                login(c.id);
                router.push("/portal");
              }}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50"
            >
              <span className="font-medium text-gray-800">{c.name}</span>
              <span className="text-xs text-gray-500">{c.segment}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
