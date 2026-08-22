import { NextResponse } from "next/server";
import type { ResearchOutput } from "../../../lib/types";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.7-flash";

/**
 * Stage 3: Cloud Research — the real Gemini call.
 * Receives only the sanitized, zero-PII research question produced by Pass A.
 */
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_KEY not configured" },
      { status: 503 }
    );
  }

  let question: unknown;
  try {
    ({ question } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof question !== "string" || !question.trim() || question.length > 500) {
    return NextResponse.json(
      { error: "Expected { question: string } (non-empty, ≤500 chars)" },
      { status: 400 }
    );
  }

  const prompt = [
    "You are the cloud research stage of a privacy-preserving health agent.",
    "You receive ONE sanitized question containing zero personal data, and must answer it",
    "at the level of official public guidance (NHS, WHO, government travel advice).",
    "Return:",
    "- answer: the direct answer in 1-2 sentences.",
    "- key_facts: 2-4 short factual statements that support the answer.",
    "- lead_time_days: integer — how many days of lead time the guidance implies (0 if none).",
    "- source_name: the kind of authoritative source the answer is based on (e.g. 'NHS Travel Health Guidance').",
    "",
    `Question: ${question}`,
  ].join("\n");

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                answer: { type: "STRING" },
                key_facts: { type: "ARRAY", items: { type: "STRING" } },
                lead_time_days: { type: "INTEGER" },
                source_name: { type: "STRING" },
              },
              required: ["answer", "key_facts", "lead_time_days", "source_name"],
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.error(`Gemini request failed: ${res.status} ${await res.text()}`);
      return NextResponse.json({ error: "Gemini request failed" }, { status: 502 });
    }

    const data = await res.json();
    const text: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      return NextResponse.json({ error: "Empty Gemini response" }, { status: 502 });
    }

    const parsed = JSON.parse(text);
    const output: ResearchOutput = {
      answer: String(parsed.answer ?? ""),
      key_facts: Array.isArray(parsed.key_facts)
        ? parsed.key_facts.filter((f: unknown): f is string => typeof f === "string")
        : [],
      lead_time_days: Number.isFinite(parsed.lead_time_days)
        ? Number(parsed.lead_time_days)
        : 0,
      source_name: String(parsed.source_name ?? "Gemini"),
      source_url: "",
      status: "verified",
    };
    return NextResponse.json(output);
  } catch (error) {
    console.error("Gemini research stage failed:", error);
    return NextResponse.json({ error: "Research stage failed" }, { status: 502 });
  }
}
