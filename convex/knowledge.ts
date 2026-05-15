import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireDocumentOwner } from "./lib/auth";

export const listByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    await requireDocumentOwner(ctx, documentId);
    return await ctx.db
      .query("knowledgeItems")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, { documentId, title, content }) => {
    await requireDocumentOwner(ctx, documentId);
    const existing = await ctx.db
      .query("knowledgeItems")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .collect();
    return await ctx.db.insert("knowledgeItems", {
      documentId,
      title,
      content,
      order: existing.length,
    });
  },
});

export const update = mutation({
  args: {
    knowledgeId: v.id("knowledgeItems"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, { knowledgeId, title, content }) => {
    const item = await ctx.db.get(knowledgeId);
    if (!item) throw new Error("Not found");
    await requireDocumentOwner(ctx, item.documentId);
    const patch: { title?: string; content?: string } = {};
    if (title !== undefined) patch.title = title;
    if (content !== undefined) patch.content = content;
    await ctx.db.patch(knowledgeId, patch);
  },
});

export const remove = mutation({
  args: { knowledgeId: v.id("knowledgeItems") },
  handler: async (ctx, { knowledgeId }) => {
    const item = await ctx.db.get(knowledgeId);
    if (!item) throw new Error("Not found");
    await requireDocumentOwner(ctx, item.documentId);
    await ctx.db.delete(knowledgeId);
  },
});
