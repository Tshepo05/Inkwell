"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader showAuth={false} />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-md">
          <h1 className="font-serif text-3xl font-semibold text-ink">
            {step === "signIn" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {step === "signIn"
              ? "Sign in to continue writing."
              : "Start drafting with Inkwell."}
          </p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setError(null);
              setLoading(true);
              const formData = new FormData(event.currentTarget);
              void signIn("password", formData)
                .catch((err: unknown) => {
                  setError(
                    err instanceof Error ? err.message : "Authentication failed",
                  );
                })
                .finally(() => setLoading(false));
            }}
          >
            <div>
              <label className="mb-1.5 block text-sm text-ink-muted">Email</label>
              <Input name="email" type="email" required autoComplete="email" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-ink-muted">
                Password
              </label>
              <Input
                name="password"
                type="password"
                required
                autoComplete={
                  step === "signIn" ? "current-password" : "new-password"
                }
                minLength={8}
              />
            </div>
            <input name="flow" type="hidden" value={step} />
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Please wait…"
                : step === "signIn"
                  ? "Sign in"
                  : "Sign up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {step === "signIn" ? "New to Inkwell?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-accent hover:underline"
              onClick={() => {
                setStep(step === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
            >
              {step === "signIn" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="text-sm text-ink-muted hover:text-ink">
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
