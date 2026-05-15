import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { requireDocumentOwner } from "./lib/auth";

export const listByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, { documentId }) => {
    await requireDocumentOwner(ctx, documentId);
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .order("asc")
      .collect();
  },
});

export const appendPair = internalMutation({
  args: {
    documentId: v.id("documents"),
    userMessage: v.string(),
    assistantMessage: v.string(),
  },
  handler: async (ctx, { documentId, userMessage, assistantMessage }) => {
    const now = Date.now();
    await ctx.db.insert("chatMessages", {
      documentId,
      role: "user",
      content: userMessage,
      createdAt: now,
    });
    await ctx.db.insert("chatMessages", {
      documentId,
      role: "assistant",
      content: assistantMessage,
      createdAt: now + 1,
    });
  },
});
