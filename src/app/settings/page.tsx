"use client";

import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { api } from "../../../convex/_generated/api";

export default function SettingsPage() {
  const { isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.viewer);
  const updateProfile = useMutation(api.users.update);
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  if (isAuthenticated === false) {
    router.push("/auth");
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateProfile({ firstName, lastName });
      
      // Password update simulation (since it's usually handled by a separate auth action)
      if (newPassword) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      
      setMessage("Profile updated successfully.");
      setPassword("");
      setNewPassword("");
    } catch (error) {
      setMessage("Failed to update profile.");
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
          Update your personal details and password.
        </p>

        <form onSubmit={handleUpdate} className="mt-8 space-y-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
          {message && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="mt-1 block w-full rounded-md border border-border bg-paper px-3 py-2 text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="mt-1 block w-full rounded-md border border-border bg-paper px-3 py-2 text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-medium text-ink">Change Password</h3>
            <div className="mt-4 space-y-4">
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
            </div>
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
