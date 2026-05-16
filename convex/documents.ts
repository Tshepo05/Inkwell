import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireDocumentOwner, requireUser } from "./lib/auth";

const EMPTY_CONTENT = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return docs;
  },
});

export const get = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const doc = await ctx.db.get(documentId);
    if (!doc || doc.userId !== userId) return null;
    return doc;
  },
});

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const now = Date.now();
    return await ctx.db.insert("documents", {
      userId,
      title: "Untitled document",
      content: EMPTY_CONTENT,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    systemInstructions: v.optional(v.string()),
  },
  handler: async (ctx, { documentId, title, content, systemInstructions }) => {
    await requireDocumentOwner(ctx, documentId);
    const patch: { title?: string; content?: string; systemInstructions?: string; updatedAt: number } = {
      updatedAt: Date.now(),
    };
    if (title !== undefined) patch.title = title;
    if (content !== undefined) patch.content = content;
    if (systemInstructions !== undefined) patch.systemInstructions = systemInstructions;
    await ctx.db.patch(documentId, patch);
  },
});

export const remove = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    await requireDocumentOwner(ctx, documentId);

    const knowledge = await ctx.db
      .query("knowledgeItems")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .collect();
    for (const item of knowledge) {
      await ctx.db.delete(item._id);
    }

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(documentId);
  },
});
