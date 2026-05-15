"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type KnowledgeSidebarProps = {
  documentId: Id<"documents">;
};

export function KnowledgeSidebar({ documentId }: KnowledgeSidebarProps) {
  const items = useQuery(api.knowledge.listByDocument, { documentId });
  const addItem = useMutation(api.knowledge.add);
  const updateItem = useMutation(api.knowledge.update);
  const removeItem = useMutation(api.knowledge.remove);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<Id<"knowledgeItems"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) return;
    await addItem({ documentId, title: title.trim(), content: content.trim() });
    setTitle("");
    setContent("");
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      <header className="border-b border-border px-4 py-3">
        <h2 className="font-serif text-sm font-semibold text-ink">Knowledge</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Plain-text references for the AI
        </p>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {items === undefined ? (
          <p className="text-xs text-ink-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-xs text-ink-muted">
            Add notes, excerpts, or facts to ground the assistant.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border border-border bg-paper p-3 shadow-sm"
            >
              {editingId === item._id ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Title"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 text-xs"
                      onClick={() =>
                        void updateItem({
                          knowledgeId: item._id,
                          title: editTitle,
                          content: editContent,
                        }).then(() => setEditingId(null))
                      }
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-sm font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-ink-muted">
                    {item.content}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-accent hover:underline"
                      onClick={() => {
                        setEditingId(item._id);
                        setEditTitle(item.title);
                        setEditContent(item.content);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-700 hover:underline"
                      onClick={() => void removeItem({ knowledgeId: item._id })}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 border-t border-border p-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Paste or type reference text…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-border bg-paper px-3 py-2 text-xs text-ink shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <Button className="w-full text-sm" onClick={() => void handleAdd()}>
          Add knowledge
        </Button>
      </div>
    </aside>
  );
}
