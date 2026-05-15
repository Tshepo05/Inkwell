"use client";

import { useAction, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import type { AiChatResult, DocumentEdit } from "@/types/ai";

const QUICK_PROMPTS = [
  "Write an introduction based on my knowledge",
  "Improve the last paragraph",
  "Summarize my reference knowledge",
];

type AiChatSidebarProps = {
  documentId: Id<"documents">;
  onDocumentEdit: (edit: DocumentEdit) => void;
};

export function AiChatSidebar({
  documentId,
  onDocumentEdit,
}: AiChatSidebarProps) {
  const messages = useQuery(api.chat.listByDocument, { documentId });
  const chat = useAction(api.aiNode.chat);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const result: AiChatResult = await chat({
        documentId,
        message: trimmed,
      });
      if (result.documentEdit) {
        onDocumentEdit(result.documentEdit);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      <header className="border-b border-border px-4 py-3">
        <h2 className="font-serif text-sm font-semibold text-ink">AI Assistant</h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Uses your document and knowledge as context
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages === undefined ? (
          <p className="text-xs text-ink-muted">Loading chat…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-ink-muted">
            Ask the assistant to draft, edit, or explain using your references.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={
                msg.role === "user"
                  ? "ml-4 rounded-xl bg-paper-muted px-3 py-2 text-xs text-ink shadow-sm"
                  : "mr-2 rounded-xl border border-border bg-paper px-3 py-2 text-xs leading-relaxed text-ink shadow-sm"
              }
            >
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                {msg.role === "user" ? "You" : "Inkwell"}
              </span>
              {msg.content}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-2 border-t border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={loading}
              onClick={() => void sendMessage(prompt)}
              className="rounded-lg border border-border bg-paper px-2 py-1 text-[10px] text-ink-muted transition hover:border-accent/40 hover:text-ink disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
            {error}
          </p>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendMessage(input);
            }
          }}
          rows={3}
          placeholder="Ask Inkwell to write or edit…"
          disabled={loading}
          className="w-full resize-none rounded-xl border border-border bg-paper px-3 py-2 text-xs text-ink shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
        />
        <Button
          className="w-full text-sm"
          disabled={loading || !input.trim()}
          onClick={() => void sendMessage(input)}
        >
          {loading ? "Thinking…" : "Send"}
        </Button>
      </div>
    </aside>
  );
}
