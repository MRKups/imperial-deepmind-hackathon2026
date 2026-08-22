import healthData from "../../data/health-data.json";
import calendar from "../../data/calendar.json";
import emails from "../../data/emails.json";
import spending from "../../data/spending.json";

export type Brief = {
  action: string;
  reasoning: string;
  sources: string[];
};

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.7-flash";

export async function getMorningBrief(): Promise<Brief | null> {
  const apiKey = process.env.GEMINI_KEY;
  if (!apiKey) return null;

  const today = new Date().toISOString().slice(0, 10);

  const prompt = [
    `You are a morning brief assistant. Today is ${today}.`,
    "Below is the user's raw data from four sources: health tracking, calendar, email, and spending.",
    "Cross-reference the sources and find the ONE most important thing the user has probably not thought about yet —",
    "something actionable that only becomes visible when you connect information across sources (dates, supplies, deadlines, bookings, renewals).",
    "Do NOT state the obvious (not 'you slept badly' or 'you spent a lot on takeaway').",
    "Return:",
    "- action: a single imperative instruction, UNDER 30 WORDS, with the concrete numbers that make it urgent.",
    "- reasoning: one or two sentences explaining the connection you found.",
    "- sources: which of [health, calendar, email, spending] you used.",
    "",
    `HEALTH: ${JSON.stringify(healthData)}`,
    `CALENDAR: ${JSON.stringify(calendar)}`,
    `EMAIL: ${JSON.stringify(emails)}`,
    `SPENDING: ${JSON.stringify(spending)}`,
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
                action: { type: "STRING" },
                reasoning: { type: "STRING" },
                sources: { type: "ARRAY", items: { type: "STRING" } },
              },
              required: ["action", "reasoning", "sources"],
            },
          },
        }),
      }
    );

    if (!res.ok) {
      console.error(`Gemini request failed: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    const text: unknown = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") return null;

    const parsed: unknown = JSON.parse(text);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Brief).action !== "string" ||
      typeof (parsed as Brief).reasoning !== "string"
    ) {
      return null;
    }

    const brief = parsed as Brief;
    return {
      action: brief.action,
      reasoning: brief.reasoning,
      sources: Array.isArray(brief.sources)
        ? brief.sources.filter((s): s is string => typeof s === "string")
        : [],
    };
  } catch (error) {
    console.error("Morning brief unavailable:", error);
    return null;
  }
}
