import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const isApiKeyConfigured = Boolean(apiKey && !apiKey.includes("your-openai") && apiKey.startsWith("sk-"));

    const body = await req.json().catch(() => ({}));
    const { text, voice = "onyx", model = "tts-1", speed = 1.0 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ message: "Text is required for TTS synthesis" }, { status: 400 });
    }

    // If OpenAI API key is configured, synthesize high quality neural speech
    if (isApiKeyConfigured) {
      try {
        const openai = new OpenAI({ apiKey });
        const response = await openai.audio.speech.create({
          model: model || "tts-1",
          voice: voice || "onyx",
          input: text.slice(0, 4096),
          speed: typeof speed === "number" ? Math.min(1.25, Math.max(0.75, speed)) : 1.0,
        });

        const arrayBuffer = await response.arrayBuffer();
        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch (err: any) {
        console.warn("OpenAI TTS API call error, falling back to client speech synthesis:", err?.message || err);
        // Fallback to client-side Web Speech
      }
    }

    // Default response: Indicates client should use standard native Web Speech API
    return NextResponse.json(
      {
        available: false,
        useWebSpeech: true,
        message: "Studio OpenAI key not configured or failed; client will use native natural neural speech synthesis.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "TTS synthesis failed", error: error?.message || String(error) },
      { status: 500 }
    );
  }
}
