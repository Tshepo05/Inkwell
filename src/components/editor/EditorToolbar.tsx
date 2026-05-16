"use client";

import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { 
  Undo, 
  Redo, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Quote,
  PenTool
} from "lucide-react";

type EditorToolbarProps = {
  editor: Editor | null;
  onToggleScratchPad?: () => void;
  scratchPadActive?: boolean;
};

function ToolButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg p-2 text-ink-muted transition hover:bg-paper-muted hover:text-ink disabled:opacity-50 disabled:hover:bg-transparent",
        active && "bg-paper-muted text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({ editor, onToggleScratchPad, scratchPadActive }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface px-3 py-2 shadow-sm">
      <ToolButton
        title="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      >
        <Undo className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      >
        <Redo className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </ToolButton>
      <span className="mx-1 h-5 w-px bg-border" />
      <ToolButton
        title="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter className="h-4 w-4" />
      </ToolButton>
      <ToolButton
        title="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight className="h-4 w-4" />
      </ToolButton>
      
      {onToggleScratchPad && (
        <>
          <span className="mx-1 h-5 w-px bg-border ml-auto" />
          <ToolButton
            title="Toggle Scratch Pad"
            active={scratchPadActive}
            onClick={onToggleScratchPad}
          >
            <PenTool className="h-4 w-4" />
          </ToolButton>
        </>
      )}
    </div>
  );
}
