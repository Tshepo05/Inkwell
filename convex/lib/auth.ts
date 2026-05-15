import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireUser(ctx: Ctx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("Unauthorized");
  }
  return userId;
}

export async function requireDocumentOwner(
  ctx: Ctx,
  documentId: Id<"documents">,
) {
  const userId = await requireUser(ctx);
  const doc = await ctx.db.get(documentId);
  if (!doc || doc.userId !== userId) {
    throw new ConvexError("Not found");
  }
  return doc;
}
