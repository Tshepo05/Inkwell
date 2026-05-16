"use client";

import { useAction, useQuery, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/Button";
import type { AiChatResult, DocumentEdit } from "@/types/ai";
import { Settings } from "lucide-react";

const QUICK_PROMPTS = [
  "Write an introduction based on my knowledge",
  "Improve the last paragraph",
  "Summarize my reference knowledge",
];

type AiChatSidebarProps = {
  documentId: Id<"documents">;
  onDocumentEdit: (edit: DocumentEdit) => void;
  onGetSelection?: () => string | undefined;
  systemInstructions?: string;
};

export function AiChatSidebar({
  documentId,
  onDocumentEdit,
  onGetSelection,
  systemInstructions,
}: AiChatSidebarProps) {
  const messages = useQuery(api.chat.listByDocument, { documentId });
  const chat = useAction(api.aiNode.chat);
  const updateDocument = useMutation(api.documents.update);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [instructionsText, setInstructionsText] = useState(systemInstructions || "");

  useEffect(() => {
    setInstructionsText(systemInstructions || "");
  }, [systemInstructions]);

  useEffect(() => {
    if (!showSettings) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showSettings]);

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

  const handleUseSelection = () => {
    if (onGetSelection) {
      const selected = onGetSelection();
      if (selected && selected.trim()) {
        setInput((prev) => (prev ? `${prev}\n\n"${selected.trim()}"` : `"${selected.trim()}"`));
      }
    }
  };

  const handleSaveInstructions = async () => {
    setLoading(true);
    try {
      await updateDocument({ documentId, systemInstructions: instructionsText });
      setShowSettings(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save instructions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="font-serif text-sm font-semibold text-ink">AI Assistant</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Uses your document and knowledge as context
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="rounded p-1 text-ink-muted hover:bg-paper-muted hover:text-ink transition"
          aria-label="AI Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </header>

      {showSettings ? (
        <div className="flex flex-1 flex-col p-4">
          <label className="mb-2 text-xs font-semibold text-ink uppercase tracking-wide">
            Tone & Style Instructions
          </label>
          <textarea
            className="flex-1 w-full resize-none rounded-lg border border-border bg-paper p-3 text-sm text-ink shadow-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="E.g., Write in a formal, academic tone without using jargon."
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            disabled={loading}
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowSettings(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={() => void handleSaveInstructions()} disabled={loading}>
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
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
            <div className="flex gap-2">
              {onGetSelection && (
                <Button
                  variant="secondary"
                  className="flex-1 text-xs"
                  disabled={loading}
                  onClick={handleUseSelection}
                >
                  Add Selection
                </Button>
              )}
              <Button
                className="flex-1 text-sm"
                disabled={loading || !input.trim()}
                onClick={() => void sendMessage(input)}
              >
                {loading ? "Thinking…" : "Send"}
              </Button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
