import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
  }).index("email", ["email"]),
  documents: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    systemInstructions: v.optional(v.string()),
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
