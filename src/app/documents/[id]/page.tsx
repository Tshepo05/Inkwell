"use client";

import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  DocumentEditor,
  type DocumentEditorHandle,
} from "@/components/editor/DocumentEditor";
import { KnowledgeSidebar } from "@/components/editor/KnowledgeSidebar";
import { AiChatSidebar } from "@/components/editor/AiChatSidebar";
import type { DocumentEdit } from "@/types/ai";

export default function DocumentPage() {
  const params = useParams();
  const documentId = params.id as Id<"documents">;
  const document = useQuery(api.documents.get, { documentId });
  const updateDocument = useMutation(api.documents.update);
  const editorRef = useRef<DocumentEditorHandle>(null);

  const [title, setTitle] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const debouncedTitle = useDebouncedCallback(async (newTitle: string) => {
    setIsSaving(true);
    try {
      await updateDocument({ documentId, title: newTitle });
    } finally {
      setIsSaving(false);
    }
  }, 600);

  const handleContentChange = useDebouncedCallback(async (content: string) => {
    setIsSaving(true);
    try {
      await updateDocument({ documentId, content });
    } finally {
      setIsSaving(false);
    }
  }, 800);

  const handleDocumentEdit = useCallback((edit: DocumentEdit) => {
    editorRef.current?.applyEdit(edit);
    const content = editorRef.current?.getContent();
    if (content) {
      void updateDocument({ documentId, content });
    }
  }, [documentId, updateDocument]);

  if (document === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        Loading document…
      </div>
    );
  }

  if (document === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-ink-muted">Document not found.</p>
        <Link href="/dashboard" className="text-accent hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const displayTitle = title ?? document.title;

  return (
    <div className="flex h-screen flex-col bg-paper">
      <header className="flex shrink-0 items-center gap-4 border-b border-border bg-surface px-4 py-3 shadow-sm">
        <Link
          href="/dashboard"
          className="shrink-0 text-sm text-ink-muted hover:text-ink"
        >
          ← Dashboard
        </Link>
        <input
          type="text"
          value={displayTitle}
          onChange={(e) => {
            setTitle(e.target.value);
            debouncedTitle(e.target.value);
          }}
          className="min-w-0 flex-1 bg-transparent font-serif text-lg font-semibold text-ink outline-none placeholder:text-ink-muted"
          placeholder="Untitled document"
        />
        <span className="shrink-0 text-xs text-ink-muted">
          {isSaving
            ? "Saving…"
            : `Saved ${format(document.updatedAt, "h:mm a")}`}
        </span>
      </header>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden p-4">
        <KnowledgeSidebar documentId={documentId} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DocumentEditor
            ref={editorRef}
            initialContent={document.content}
            onContentChange={(content) => void handleContentChange(content)}
          />
        </div>
        <AiChatSidebar
          documentId={documentId}
          onDocumentEdit={handleDocumentEdit}
          onGetSelection={() => editorRef.current?.getSelectedText()}
          systemInstructions={document.systemInstructions}
        />
      </div>
    </div>
  );
}
