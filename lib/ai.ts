import { GoogleGenAI } from "@google/genai";
import { OpenAI } from "openai";

/**
 * List of valid active Google Gemini model aliases in order of preference.
 * Fallbacks ensure 100% continuous service even if a specific tier experiences high demand (503) or rate limits (429).
 */
const GEMINI_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-2.5-pro",
  "gemini-pro-latest",
];

const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
];

interface GenerateContentParams {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
}

/**
 * Executes a Gemini AI model request with automatic model fallback and exponential retry.
 */
export async function generateGeminiContent(
  apiKey: string,
  params: GenerateContentParams
): Promise<string> {
  const keyToUse = apiKey || process.env.GEMINI_API_KEY || "";
  const ai = new GoogleGenAI({ apiKey: keyToUse });

  let lastError: any = null;

  for (const modelName of GEMINI_MODELS) {
    let attempts = 0;
    const maxAttemptsPerModel = 2;

    while (attempts < maxAttemptsPerModel) {
      attempts++;
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            responseMimeType: params.responseMimeType,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code;
        console.warn(
          `Gemini API note: Model '${modelName}' attempt ${attempts} returned ${status || err?.message}. Retrying fallback...`
        );

        if (attempts < maxAttemptsPerModel && (status === 503 || status === 429 || err?.message?.includes("503") || err?.message?.includes("high demand"))) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
        } else {
          break; // Move to next model in fallback list
        }
      }
    }
  }

  throw lastError || new Error("All Gemini models failed to respond.");
}

interface OpenRouterContentParams {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  model?: string;
}

/**
 * Executes an OpenRouter AI model request using the standard OpenAI-compatible gateway endpoint.
 */
export async function generateOpenRouterContent(
  apiKey: string,
  params: OpenRouterContentParams
): Promise<string> {
  const keyToUse = apiKey || "sk-or-v1-placeholder";
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: keyToUse,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "AI Interview Simulator Platform",
    },
  });

  const modelName = params.model || "openai/gpt-4o-mini";

  const messages: any[] = [];
  if (params.systemInstruction) {
    messages.push({ role: "system", content: params.systemInstruction });
  }
  messages.push({ role: "user", content: params.contents });

  const extraConfig: any = {};
  if (params.responseMimeType === "application/json") {
    extraConfig.response_format = { type: "json_object" };
  }

  const response = await openai.chat.completions.create({
    model: modelName,
    max_tokens: 1024,
    messages,
    ...extraConfig,
  });

  return response.choices[0]?.message?.content || "";
}

interface GroqContentParams {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  model?: string;
}

/**
 * Executes an ultra-fast Groq AI model request (Llama 3.3 70B / Llama 3.1 8B) via OpenAI-compatible endpoint.
 */
export async function generateGroqContent(
  apiKey: string,
  params: GroqContentParams
): Promise<string> {
  const keyToUse = apiKey || process.env.GROQ_API_KEY || "";
  const openai = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: keyToUse,
  });

  const modelsToTry = params.model
    ? [params.model, ...GROQ_MODELS.filter((m) => m !== params.model)]
    : GROQ_MODELS;

  const messages: any[] = [];
  if (params.systemInstruction) {
    messages.push({ role: "system", content: params.systemInstruction });
  }
  messages.push({ role: "user", content: params.contents });

  const extraConfig: any = {};
  if (params.responseMimeType === "application/json") {
    extraConfig.response_format = { type: "json_object" };
  }

  let lastError: any = null;
  for (const modelName of modelsToTry) {
    try {
      const response = await openai.chat.completions.create({
        model: modelName,
        max_tokens: 2048,
        messages,
        ...extraConfig,
      });

      const content = response.choices[0]?.message?.content || "";
      if (content) return content;
    } catch (err: any) {
      lastError = err;
      console.warn(`Groq AI note: Model '${modelName}' failed (${err?.message || err}). Trying next model...`);
    }
  }

  throw lastError || new Error("All Groq models failed to respond.");
}

/**
 * Safely parses raw AI response string to JSON.
 */
export function parseAIJson<T = any>(rawText: string): T {
  if (!rawText || !rawText.trim()) {
    throw new Error("Empty AI response text");
  }

  let cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("No valid JSON object found in AI response");
  }
}

interface SmartAIParams {
  contents: string;
  systemInstruction?: string;
  responseMimeType?: string;
  preferredProvider?: "GROQ" | "GEMINI" | "AUTO";
}

/**
 * Unified AI generation function.
 * Tries Groq Llama 3.3 70B first for ultra-high speed & intelligence,
 * and automatically falls back to Google Gemini for 100% continuous uptime.
 */
export async function generateSmartAIContent(params: SmartAIParams): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";

  const isGroqValid = !!groqKey && !groqKey.includes("YOUR_GROQ_API_KEY_HERE");
  const isGeminiValid = !!geminiKey && !geminiKey.includes("YOUR_GEMINI_API_KEY_HERE");

  const providerOrder = params.preferredProvider === "GEMINI"
    ? ["GEMINI", "GROQ"]
    : ["GROQ", "GEMINI"];

  let lastError: any = null;

  for (const provider of providerOrder) {
    if (provider === "GROQ" && isGroqValid) {
      try {
        return await generateGroqContent(groqKey, {
          contents: params.contents,
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
        });
      } catch (err: any) {
        lastError = err;
        console.warn("Groq AI note: Groq request failed. Attempting fallback to Gemini...", err?.message || err);
      }
    }

    if (provider === "GEMINI" && isGeminiValid) {
      try {
        return await generateGeminiContent(geminiKey, {
          contents: params.contents,
          systemInstruction: params.systemInstruction,
          responseMimeType: params.responseMimeType,
        });
      } catch (err: any) {
        lastError = err;
        console.warn("Gemini AI note: Gemini request failed.", err?.message || err);
      }
    }
  }

  throw lastError || new Error("All AI providers (Groq & Gemini) failed to respond. Please check your API keys.");
}
