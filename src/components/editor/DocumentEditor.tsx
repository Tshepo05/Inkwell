"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useImperativeHandle, forwardRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { EditorToolbar } from "./EditorToolbar";
import type { DocumentEdit } from "@/types/ai";

export type DocumentEditorHandle = {
  applyEdit: (edit: DocumentEdit) => void;
  getContent: () => string;
};

type DocumentEditorProps = {
  initialContent: string;
  onContentChange: (content: string) => void;
};

export const DocumentEditor = forwardRef<
  DocumentEditorHandle,
  DocumentEditorProps
>(function DocumentEditor({ initialContent, onContentChange }, ref) {
  const debouncedChange = useDebouncedCallback((json: string) => {
    onContentChange(json);
  }, 800);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
    ],
    content: parseContent(initialContent),
    editorProps: {
      attributes: {
        class: "font-editor max-w-none px-8 py-6 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      debouncedChange(JSON.stringify(ed.getJSON()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    const parsed = parseContent(initialContent);
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(parsed);
    if (current !== incoming) {
      editor.commands.setContent(parsed, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  const applyEdit = useCallback(
    (edit: DocumentEdit) => {
      if (!editor) return;
      switch (edit.mode) {
        case "replace_all":
          editor.commands.setContent(edit.html);
          break;
        case "append":
          editor.commands.insertContentAt(editor.state.doc.content.size, edit.html);
          break;
        case "insert_at_cursor":
          editor.commands.insertContent(edit.html);
          break;
      }
      onContentChange(JSON.stringify(editor.getJSON()));
    },
    [editor, onContentChange],
  );

  useImperativeHandle(
    ref,
    () => ({
      applyEdit,
      getContent: () =>
        editor ? JSON.stringify(editor.getJSON()) : initialContent,
    }),
    [applyEdit, editor, initialContent],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      <EditorToolbar editor={editor} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

function parseContent(content: string): object {
  try {
    return JSON.parse(content) as object;
  } catch {
    return { type: "doc", content: [{ type: "paragraph" }] };
  }
}
