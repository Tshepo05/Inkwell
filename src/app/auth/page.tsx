"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function formatAuthError(err: unknown): string {
  const raw = err instanceof Error ? err.message : "Authentication failed";
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    if (parsed.message) {
      return formatAuthError(new Error(parsed.message));
    }
  } catch {
    // not JSON
  }
  if (raw.includes("AuthProviderDiscoveryFailed")) {
    return "Convex auth is offline. Run `npx convex dev` (or `npm run dev:all`) and wait until it says “Convex functions ready”, then try again.";
  }
  return raw;
}

function goToApp() {
  // Full navigation so middleware and server layout read auth cookies reliably.
  window.location.assign("/dashboard");
}

function goToOAuth(url: URL) {
  window.location.assign(url.toString());
}

export default function AuthPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [step, setStep] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      goToApp();
    }
  }, [authLoading, isAuthenticated]);

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
              const form = event.currentTarget;
              const email = (form.elements.namedItem("email") as HTMLInputElement)
                .value;
              const password = (
                form.elements.namedItem("password") as HTMLInputElement
              ).value;

              const extras: Record<string, string> = {};
              if (step === "signUp") {
                extras.firstName = (
                  form.elements.namedItem("firstName") as HTMLInputElement
                ).value;
                extras.lastName = (
                  form.elements.namedItem("lastName") as HTMLInputElement
                ).value;
              }

              void signIn("password", { email, password, flow: step, ...extras })
                .then((result) => {
                  if (result.redirect) {
                    // OAuth provider flow — navigate to external provider.
                    goToOAuth(result.redirect);
                    return;
                  }
                  if (result.signingIn) {
                    // Session is being established — keep loading spinner on.
                    // The useEffect above will redirect to /dashboard once
                    // isAuthenticated flips to true (after cookie is written).
                    return;
                  }
                  // signingIn === false with no redirect is an unexpected state.
                  setError(
                    step === "signUp"
                      ? "Account created but sign-in did not complete. Please sign in with your new credentials."
                      : "Sign-in did not complete. Please try again.",
                  );
                  setLoading(false);
                })
                .catch((err: unknown) => {
                  setError(formatAuthError(err));
                  setLoading(false);
                });
            }}
          >
            {step === "signUp" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-ink-muted">
                    First Name
                  </label>
                  <Input name="firstName" type="text" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-ink-muted">
                    Last Name
                  </label>
                  <Input name="lastName" type="text" required />
                </div>
              </div>
            )}
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
