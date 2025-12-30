import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// ✅ Validate API key (ENV ONLY)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY is missing from environment variables.");
}

// ✅ Init AI client
const ai = new GoogleGenAI({ apiKey });

/* -------------------- Helpers -------------------- */

const normalizeText = (input) => {
  if (!input) return "";
  if (typeof input === "string") return input.trim();
  if (typeof input === "object") {
    if (input.content) return String(input.content).trim();
    if (input.text) return String(input.text).trim();
    return JSON.stringify(input).trim();
  }
  return String(input).trim();
};

const truncate = (text, max = 2000) => {
  const clean = normalizeText(text);
  return clean.length > max
    ? clean.slice(0, max) + "... [truncated]"
    : clean;
};

/* -------------------- Main Function -------------------- */

export const rewriteWithLLM = async ({
  originalArticle,
  refArticle1,
  refArticle2,
} = {}) => {

  if (!originalArticle) {
    throw new Error("❌ originalArticle is required");
  }

  const original = truncate(originalArticle, 2200);
  const ref1 = truncate(refArticle1, 1200);
  const ref2 = truncate(refArticle2, 1200);

  const userPrompt = `
ORIGINAL ARTICLE:
${original}

REFERENCE ARTICLE 1:
${ref1 || "(Not provided)"}

REFERENCE ARTICLE 2:
${ref2 || "(Not provided)"}

Rewrite ONLY the ORIGINAL ARTICLE.
`.trim();

  try {
    console.log("📝 Sending request to Gemini...");

    const responseStream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      config: {
        temperature: 0.7,
        maxOutputTokens: 3500,
        thinkingConfig: { thinkingLevel: "HIGH" },
        systemInstruction: [
          {
            text: `
You are a professional content editor and SEO writer.

TASK:
Rewrite the ORIGINAL ARTICLE.

RULES:
- Improve clarity, structure, and readability
- Match reference quality (no copying)
- Keep facts intact
- Use HTML only: <h2>, <h3>, <p>, <ul>, <li>
- No markdown
- No <html>, <body>, <head>
- Output ONLY clean HTML
            `.trim(),
          },
        ],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    let finalText = "";

    for await (const chunk of responseStream) {
      if (chunk.text) finalText += chunk.text;
    }
    console.log("✅ Received response from Gemini." , finalText.slice(0, 100));

    if (!finalText.trim()) {
      throw new Error("Empty Gemini response");
    }

    return cleanHTMLOutput(finalText);

  } catch (error) {
    console.error("❌ Gemini error:", error.message);
    return generateFallbackHTML(original);
  }
};

/* -------------------- Output Utilities -------------------- */

const cleanHTMLOutput = (html) => {
  return html
    .replace(/```(html)?/gi, "")
    .replace(/<\/?(html|body|head|!DOCTYPE)[^>]*>/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const generateFallbackHTML = (original) => {
  return `
<div class="article-content">
  <p><strong>Note:</strong> AI rewrite failed. Showing original content.</p>
  ${original
    .split("\n")
    .filter(Boolean)
    .map(p => `<p>${p}</p>`)
    .join("\n")}
</div>
  `.trim();
};
