"use client";

import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { Button } from "@/components/ui/Button";
import { AccountDropdown } from "./AccountDropdown";
type AppHeaderProps = {
  showAuth?: boolean;
};

export function AppHeader({ showAuth = true }: AppHeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl font-semibold text-ink">
          Inkwell
        </Link>
        {showAuth && (
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                >
                  Dashboard
                </Link>
                <AccountDropdown />
              </>
            ) : (
              <Link href="/auth">
                <Button variant="secondary">Sign in</Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
