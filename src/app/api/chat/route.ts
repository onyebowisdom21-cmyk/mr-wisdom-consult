import { google } from "@ai-sdk/google";
import { createTextStreamResponse, stepCountIs, streamText, tool } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { buildKnowledgeContext } from "@/lib/rag";
import { createAdminClient } from "@/lib/supabase/server";
import { requiredEnv } from "@/lib/env";

const requestSchema = z.object({
  sessionId: z.string().uuid(),
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(1200),
  })).min(1).max(10),
});

function isGoogleAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const detail = error as Record<string, unknown>;
  return detail.statusCode === 401
    || detail.type === "authentication_error"
    || (typeof detail.message === "string" && /unauthenticated|invalid api key|api key not valid|api_key_invalid|authentication failed/i.test(detail.message));
}

function isGoogleQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const detail = error as Record<string, unknown>;
  return detail.statusCode === 429
    || detail.type === "RESOURCE_EXHAUSTED"
    || (typeof detail.message === "string" && /resource_exhausted|quota|rate limit|too many requests/i.test(detail.message));
}

function failureMessage(authenticationFailed: boolean, quotaExceeded: boolean): string {
  if (authenticationFailed) {
    return "The AI advisor’s Google API key was rejected. The site owner must set a valid GOOGLE_GENERATIVE_AI_API_KEY in the server environment. You can still browse [services](/services) and [opportunities](/opportunities), or [contact us](/contact).";
  }
  if (quotaExceeded) {
    return "The Gemini API free-tier quota or rate limit was reached. Please try again later, or the site owner can check the project’s Google AI Studio limits. You can still browse [services](/services) and [opportunities](/opportunities), or [contact us](/contact).";
  }
  return "I’m unable to connect to the AI advisor right now. Please try again later, browse [services](/services) or [opportunities](/opportunities), or [contact us](/contact).";
}

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Send a valid question to the advisor." }, { status: 400 });
  }
  if (!parsed.data.messages.some((message) => message.role === "user")) {
    return NextResponse.json({ error: "A question is required." }, { status: 400 });
  }

  try {
    requiredEnv("GOOGLE_GENERATIVE_AI_API_KEY");
  } catch {
    return NextResponse.json(
      { error: "The AI advisor is not configured. Ask the site owner to add a Google Gemini API key in the server environment." },
      { status: 503 },
    );
  }
  let context: string;
  try {
    context = await buildKnowledgeContext(parsed.data.messages.at(-1)?.content ?? "");
  } catch (error) {
    console.error("Unable to load current catalog for AI chat:", error);
    return NextResponse.json(
      { error: "The advisor could not load current information. Please try again later." },
      { status: 503 },
    );
  }

  const question = [...parsed.data.messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const result = streamText({
    model: google(process.env.GOOGLE_CHAT_MODEL || "gemini-3.1-flash-lite"),
    system: [
      "You are Wisdom AI Advisor for Mr Wisdom Tech Media and Business Consult.",
      "Answer politely and accurately using only the supplied current catalog when describing the consultancy's offerings, prices, availability, or opportunities.",
      "If the supplied catalog does not answer a question, say so plainly and invite the visitor to use /contact. Never invent prices, deadlines, eligibility, or links.",
      "When recommending an item, include its exact internal URL from the catalog context as a markdown link, for example [View the service](/services/example).",
      "Render any external application portal as a markdown link with the exact catalog URL.",
      "Use the search_catalog tool when a visitor asks for specific current offerings or opportunity details.",
      "Keep responses clear, concise, and useful.",
      "",
      "Current catalog and opportunity information:",
      context,
    ].join("\n"),
    messages: parsed.data.messages,
    maxOutputTokens: 700,
    abortSignal: request.signal,
    tools: {
      search_catalog: tool({
        description: "Search the current published services, products, news and opportunities.",
        inputSchema: z.object({ query: z.string().trim().min(2).max(200) }),
        execute: ({ query }) => buildKnowledgeContext(query),
      }),
    },
    stopWhen: stepCountIs(3),
    onFinish: async ({ text }) => {
      const { error } = await createAdminClient().from("chat_logs").insert({
        session_id: parsed.data.sessionId,
        question,
        answer: text,
      });
      if (error) {
        console.error("Unable to store AI chat log:", error.message);
      }
    },
  });

  const stream = new ReadableStream<string>({
    async start(controller) {
      let receivedText = false;
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            receivedText = true;
            controller.enqueue(part.text);
          } else if (part.type === "error") {
            console.error("Gemini stream failed:", part.error);
            if (!receivedText) {
              controller.enqueue(failureMessage(isGoogleAuthError(part.error), isGoogleQuotaError(part.error)));
            }
          }
        }
      } catch (error) {
        console.error("Gemini response stream failed:", error);
        if (!receivedText) {
          controller.enqueue(failureMessage(isGoogleAuthError(error), isGoogleQuotaError(error)));
        }
      } finally {
        controller.close();
      }
    },
  });

  return createTextStreamResponse({
    headers: {
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
    stream,
  });
}
