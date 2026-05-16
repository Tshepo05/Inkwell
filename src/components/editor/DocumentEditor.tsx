"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useImperativeHandle, forwardRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { EditorToolbar } from "./EditorToolbar";
import type { DocumentEdit } from "@/types/ai";

export type DocumentEditorHandle = {
  applyEdit: (edit: DocumentEdit) => void;
  getContent: () => string;
  getSelectedText: () => string;
};

type DocumentEditorProps = {
  initialContent: string;
  onContentChange: (content: string) => void;
};

export const DocumentEditor = forwardRef<
  DocumentEditorHandle,
  DocumentEditorProps
>(function DocumentEditor({ initialContent, onContentChange }, ref) {
  const [showScratchPad, setShowScratchPad] = useState(false);
  const [scratchPadText, setScratchPadText] = useState("");

  const debouncedChange = useDebouncedCallback((json: string) => {
    onContentChange(json);
  }, 800);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
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
      getSelectedText: () => {
        if (!editor) return "";
        const { from, to } = editor.state.selection;
        return editor.state.doc.textBetween(from, to, " ");
      },
    }),
    [applyEdit, editor, initialContent],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-md">
      <EditorToolbar 
        editor={editor} 
        onToggleScratchPad={() => setShowScratchPad(!showScratchPad)}
        scratchPadActive={showScratchPad}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
        {showScratchPad && (
          <div className="border-t border-border bg-paper-muted p-4">
            <h3 className="mb-2 text-xs font-medium text-ink-muted uppercase tracking-wider">Scratch Pad</h3>
            <textarea
              className="w-full resize-y rounded-lg border border-border bg-surface p-3 text-sm text-ink shadow-inner outline-none focus:border-accent"
              rows={4}
              placeholder="Jot down quick thoughts, notes, or ideas here..."
              value={scratchPadText}
              onChange={(e) => setScratchPadText(e.target.value)}
            />
          </div>
        )}
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
