"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User } from "lucide-react";

export default function ProfilePage() {
  const user = useQuery(api.users.viewer);
  const updateUser = useMutation(api.users.update);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      await updateUser({ firstName, lastName });
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-paper">
        <AppHeader />
        <main className="mx-auto max-w-2xl p-6">
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-ink-muted">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="min-h-screen bg-paper">
        <AppHeader />
        <main className="mx-auto max-w-2xl p-6">
          <div className="flex h-[200px] flex-col items-center justify-center gap-4">
            <p className="text-ink-muted">You must be signed in to view this page.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <AppHeader />
      <main className="mx-auto max-w-2xl p-6 md:p-12">
        <div className="mb-8 flex items-center gap-4 border-b border-border pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink">Profile</h1>
            <p className="text-ink-muted">Manage your personal information</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="w-full bg-paper-muted cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-ink-muted">Your email address cannot be changed here.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-ink mb-1">
                  First Name
                </label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Jane"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-ink mb-1">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <p className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
