"use node";

import { v } from "convex/values";
import OpenAI from "openai";
import { z } from "zod";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";

const documentEditSchema = z.object({
  mode: z.enum(["replace_all", "insert_at_cursor", "append"]),
  html: z.string(),
});

const aiResponseSchema = z.object({
  reply: z.string(),
  documentEdit: documentEditSchema.optional(),
});

const SYSTEM_PROMPT = `You are Inkwell, a writing assistant helping users draft and edit documents.

Rules:
- Ground answers in the provided reference knowledge when relevant. If knowledge is insufficient, say so.
- Match the user's requested tone and style.
- When the user asks you to write or edit the document, include a documentEdit object.
- For chat-only responses (questions, explanations without doc changes), omit documentEdit.
- documentEdit.html should be valid simple HTML (p, h1-h3, ul, ol, li, strong, em, blockquote).
- Prefer append or insert_at_cursor for additions; use replace_all only when explicitly rewriting the whole document.

Always respond with JSON matching this shape:
{
  "reply": "Human-readable message for the chat",
  "documentEdit": { "mode": "append" | "insert_at_cursor" | "replace_all", "html": "<p>...</p>" }
}`;

function extractPlainText(content: string): string {
  try {
    const json = JSON.parse(content) as {
      content?: Array<{ content?: Array<{ text?: string }> }>;
    };
    if (json.content) {
      return json.content
        .flatMap((node) => node.content ?? [])
        .map((c) => c.text ?? "")
        .join("\n")
        .slice(0, 12000);
    }
  } catch {
    // not JSON
  }
  return content.slice(0, 12000);
}

export const chat = action({
  args: {
    documentId: v.id("documents"),
    message: v.string(),
  },
  handler: async (ctx, { documentId, message }): Promise<{
    reply: string;
    documentEdit?: { mode: "replace_all" | "insert_at_cursor" | "append"; html: string };
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const context = await ctx.runQuery(internal.aiContext.load, { documentId });

    const knowledgeBlock =
      context.knowledge.length > 0
        ? context.knowledge
            .map(
              (k: { title: string; content: string }, i: number) =>
                `### ${i + 1}. ${k.title}\n${k.content}`,
            )
            .join("\n\n")
        : "(No reference knowledge added yet)";

    const documentText = extractPlainText(context.content);

    const userContext = `## Document title
${context.title}

## Document content
${documentText || "(Empty document)"}

## Reference knowledge
${knowledgeBlock}`;

    const historyMessages = context.history.map(
      (m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }),
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContext },
        ...historyMessages,
        { role: "user", content: message },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: z.infer<typeof aiResponseSchema>;
    try {
      parsed = aiResponseSchema.parse(JSON.parse(raw));
    } catch {
      parsed = { reply: raw || "I could not process that request. Please try again." };
    }

    await ctx.runMutation(internal.chat.appendPair, {
      documentId,
      userMessage: message,
      assistantMessage: parsed.reply,
    });

    return {
      reply: parsed.reply,
      documentEdit: parsed.documentEdit,
    };
  },
});
