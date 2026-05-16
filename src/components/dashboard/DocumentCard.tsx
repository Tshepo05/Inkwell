"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Trash2, Download } from "lucide-react";

type DocumentCardProps = {
  id: Id<"documents">;
  title: string;
  updatedAt: number;
};

export function DocumentCard({ id, title, updatedAt }: DocumentCardProps) {
  const removeDocument = useMutation(api.documents.remove);
  const convex = useConvex();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this document?")) {
      await removeDocument({ documentId: id });
    }
  };

  const handleExportPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const doc = await convex.query(api.documents.get, { documentId: id });
      if (!doc) return;
      
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      
      // Basic parsing of the Tiptap JSON content into HTML
      // Since it's complex JSON, we'll just put a placeholder or convert basic text.
      // A better approach is to render the Editor read-only in the new window, 
      // but for simplicity, we'll try to extract plain text or HTML if available.
      // Wait, we have an extractPlainText function in aiNode.ts, let's use a simple version:
      const contentStr = doc.content;
      let textContent = "No content";
      try {
        const json = JSON.parse(contentStr);
        if (json.content) {
          textContent = json.content
            .flatMap((node: any) => node.content ?? [])
            .map((c: any) => c.text ?? "")
            .join("<br/>");
        }
      } catch {
        textContent = contentStr;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${doc.title || "Document"}</title>
            <style>
              body { font-family: serif; padding: 2rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }
              h1 { font-size: 2rem; margin-bottom: 1rem; }
            </style>
          </head>
          <body>
            <h1>${doc.title || "Untitled Document"}</h1>
            <div>${textContent}</div>
            <script>
              window.onload = () => { window.print(); window.close(); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Failed to export PDF");
    }
  };

  return (
    <Link href={`/documents/${id}`}>
      <article className="group relative rounded-xl border border-border bg-surface p-5 shadow-md transition hover:border-accent/30 hover:shadow-lg">
        <h2 className="font-serif text-lg font-semibold text-ink group-hover:text-accent pr-20">
          {title || "Untitled document"}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
        </p>
        <div className="absolute right-4 top-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleExportPDF}
            className="rounded-md p-2 text-ink-muted transition-colors hover:bg-paper-muted hover:text-ink"
            aria-label="Export PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-md p-2 text-ink-muted transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
            aria-label="Delete document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </article>
    </Link>
  );
}
