import { createServerFn } from "@tanstack/react-start";

const LANG_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  ja: "Japanese",
  zh: "Simplified Chinese",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  nl: "Dutch",
  ru: "Russian",
};

export const translateDocumentText = createServerFn({ method: "POST" })
  .validator((input: { text: string; targetLang: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "unavailable" };

    const text = data.text.slice(0, 12000);
    const target = LANG_NAMES[data.targetLang] ?? data.targetLang;
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 3500,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You translate documents. Return only the translation, preserving paragraph breaks. No preface.",
          },
          {
            role: "user",
            content: `Translate the following into ${target}:\n\n${text}`,
          },
        ],
      }),
    });
    if (!res.ok) {
      return { ok: false as const, error: `xAI API error ${res.status}` };
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const out = body.choices?.[0]?.message?.content ?? "";
    return { ok: true as const, text: out };
  });
