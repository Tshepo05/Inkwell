"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";

type DocumentCardProps = {
  id: Id<"documents">;
  title: string;
  updatedAt: number;
};

export function DocumentCard({ id, title, updatedAt }: DocumentCardProps) {
  return (
    <Link href={`/documents/${id}`}>
      <article className="group rounded-xl border border-border bg-surface p-5 shadow-md transition hover:border-accent/30 hover:shadow-lg">
        <h2 className="font-serif text-lg font-semibold text-ink group-hover:text-accent">
          {title || "Untitled document"}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}
        </p>
      </article>
    </Link>
  );
}
