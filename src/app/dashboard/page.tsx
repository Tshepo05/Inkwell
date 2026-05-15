"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { AppHeader } from "@/components/layout/AppHeader";
import { DocumentCard } from "@/components/dashboard/DocumentCard";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const documents = useQuery(api.documents.list);
  const createDocument = useMutation(api.documents.create);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const id = await createDocument();
      router.push(`/documents/${id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-ink">
              Your documents
            </h1>
            <p className="mt-2 text-ink-muted">
              Create a new draft or continue where you left off.
            </p>
          </div>
          <Button onClick={() => void handleCreate()} disabled={creating}>
            {creating ? "Creating…" : "New document"}
          </Button>
        </div>

        {documents === undefined ? (
          <p className="mt-12 text-center text-ink-muted">Loading…</p>
        ) : documents.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border bg-surface p-12 text-center shadow-sm">
            <p className="font-serif text-xl text-ink">No documents yet</p>
            <p className="mt-2 text-sm text-ink-muted">
              Your writing desk is empty. Start your first document.
            </p>
            <Button className="mt-6" onClick={() => void handleCreate()}>
              Create your first document
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                id={doc._id}
                title={doc.title}
                updatedAt={doc.updatedAt}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
