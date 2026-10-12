import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { GoogleGenAI } from "@google/genai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Authenticate candidate session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let audioBuffer: Buffer | null = null;
    let mimeType = "audio/webm";

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") || formData.get("audio");
      if (!file || !(file instanceof File)) {
        return NextResponse.json({ message: "No audio file provided in form data" }, { status: 400 });
      }
      const arrayBuffer = await file.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuffer);
      mimeType = file.type || "audio/webm";
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (!body.audio) {
        return NextResponse.json({ message: "No base64 audio data provided" }, { status: 400 });
      }
      // Clean base64 string
      const base64Data = body.audio.replace(/^data:audio\/\w+;base64,/, "");
      audioBuffer = Buffer.from(base64Data, "base64");
      mimeType = body.mimeType || "audio/webm";
    } else {
      const arrayBuffer = await req.arrayBuffer();
      if (arrayBuffer.byteLength === 0) {
        return NextResponse.json({ message: "Empty audio payload" }, { status: 400 });
      }
      audioBuffer = Buffer.from(arrayBuffer);
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json({ message: "Invalid or empty audio payload" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY || "";
    const geminiKey = process.env.GEMINI_API_KEY || "";
    const isGroqValid = !!groqKey && !groqKey.includes("YOUR_GROQ_API_KEY_HERE");
    const isGeminiValid = !!geminiKey && !geminiKey.includes("YOUR_GEMINI_API_KEY_HERE");

    let transcript = "";

    // Strategy 1: Try Groq Whisper API for ultra-fast & accurate STT
    if (isGroqValid) {
      try {
        const openai = new OpenAI({
          baseURL: "https://api.groq.com/openai/v1",
          apiKey: groqKey,
        });

        // Convert Buffer to Uint8Array File object compatible with OpenAI SDK
        const file = new File([new Uint8Array(audioBuffer)], "recording.webm", { type: mimeType });

        const transcription = await openai.audio.transcriptions.create({
          file: file,
          model: "whisper-large-v3",
          response_format: "text",
          temperature: 0.0,
        });

        transcript = typeof transcription === "string" ? transcription : (transcription as any).text || "";
        if (transcript.trim()) {
          return NextResponse.json({ success: true, transcript: transcript.trim(), engine: "groq-whisper" });
        }
      } catch (err: any) {
        console.warn("Groq Whisper STT note: Request failed, attempting Gemini audio fallback...", err?.message || err);
      }
    }

    // Strategy 2: Fallback to Google Gemini Audio processing
    if (isGeminiValid) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const base64Audio = audioBuffer.toString("base64");

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                mimeType: mimeType.includes("mp4") ? "audio/mp4" : mimeType.includes("wav") ? "audio/wav" : "audio/webm",
                data: base64Audio,
              },
            },
            "Transcribe the spoken voice in this audio clip accurately. Output ONLY the raw transcribed text. Do NOT add any extra commentary, quotation marks, or markdown formatting.",
          ],
        });

        if (response.text) {
          transcript = response.text.trim();
          return NextResponse.json({ success: true, transcript, engine: "gemini-audio" });
        }
      } catch (err: any) {
        console.warn("Gemini Audio STT note: Request failed.", err?.message || err);
      }
    }

    // Fallback response if AI API keys are unconfigured or failed
    if (!transcript) {
      return NextResponse.json(
        {
          success: false,
          transcript: "",
          message: "Speech-to-text service unavailable. Please check your GROQ_API_KEY or GEMINI_API_KEY.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, transcript });
  } catch (err: any) {
    console.error("Transcribe API error:", err);
    return NextResponse.json({ message: err?.message || "Audio transcription failed" }, { status: 500 });
  }
}
