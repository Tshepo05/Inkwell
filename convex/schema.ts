import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  documents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    updatedAt: v.number(),
  }).index("by_user", ["userId", "updatedAt"]),

  knowledgeItems: defineTable({
    documentId: v.id("documents"),
    title: v.string(),
    content: v.string(),
    order: v.number(),
  }).index("by_document", ["documentId", "order"]),

  chatMessages: defineTable({
    documentId: v.id("documents"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_document", ["documentId", "createdAt"]),
});
