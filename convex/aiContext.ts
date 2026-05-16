import { v } from "convex/values";
import { internalQuery } from "./_generated/server";
import { requireDocumentOwner } from "./lib/auth";

const MAX_HISTORY = 20;

export const load = internalQuery({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, { documentId }) => {
    const doc = await requireDocumentOwner(ctx, documentId);

    const knowledge = await ctx.db
      .query("knowledgeItems")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .order("asc")
      .collect();

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_document", (q) => q.eq("documentId", documentId))
      .order("asc")
      .collect();

    const recentHistory = messages.slice(-MAX_HISTORY);

    return {
      title: doc.title,
      content: doc.content,
      systemInstructions: doc.systemInstructions,
      knowledge: knowledge.map((k) => ({
        title: k.title,
        content: k.content,
      })),
      history: recentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };
  },
});
