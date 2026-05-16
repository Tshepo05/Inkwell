"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (isAuthenticated === false) {
    router.push("/auth");
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // In a full implementation, you would call your backend update mutation here.
      // For now, we simulate the update.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Account details updated successfully.");
      setPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage("Failed to update account details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          Account Settings
        </h1>
        <p className="mt-2 text-ink-muted">
          Update your email address and password.
        </p>

        <form onSubmit={handleUpdate} className="mt-8 space-y-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
          {message && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your new email"
              className="mt-1 block w-full rounded-md border border-border bg-paper px-3 py-2 text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              Current Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter current password to confirm changes"
              className="mt-1 block w-full rounded-md border border-border bg-paper px-3 py-2 text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="mt-1 block w-full rounded-md border border-border bg-paper px-3 py-2 text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
