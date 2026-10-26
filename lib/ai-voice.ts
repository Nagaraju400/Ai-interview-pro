"use client";

/**
 * AI Voice Engine for AI Interviewer
 * Provides natural speech synthesis with cross-browser safeguards (Chrome/Edge/Safari),
 * persistent reference protection against V8 garbage collection, long-text chunking,
 * neural voice selection (Male/Female/Natural), and autoplay recovery.
 */

export type VoicePersona = "male" | "female" | "natural";

export interface VoiceSettings {
  persona: VoicePersona;
  rate: number; // 0.8 to 1.2
  pitch: number; // 0.8 to 1.2
  autoSpeak: boolean; // Auto-read incoming questions
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  persona: "male",
  rate: 1.0,
  pitch: 0.95,
  autoSpeak: true,
};

const STORAGE_KEY = "ai_interview_voice_settings";

export function loadVoiceSettings(): VoiceSettings {
  if (typeof window === "undefined") return DEFAULT_VOICE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VOICE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      persona: parsed.persona === "female" || parsed.persona === "natural" ? parsed.persona : "male",
      rate: typeof parsed.rate === "number" ? Math.min(1.4, Math.max(0.7, parsed.rate)) : 1.0,
      pitch: typeof parsed.pitch === "number" ? Math.min(1.3, Math.max(0.7, parsed.pitch)) : 0.95,
      autoSpeak: parsed.autoSpeak !== false,
    };
  } catch {
    return DEFAULT_VOICE_SETTINGS;
  }
}

export function saveVoiceSettings(settings: VoiceSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clean interview questions into conversational speech text.
 * Strips code blocks, markdown asterisks, tags, and formatting that sounds awkward when spoken.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return "";

  return text
    // Remove code blocks entirely from spoken audio (code is read on screen)
    .replace(/```[\s\S]*?```/g, " Please refer to the code example on your screen. ")
    .replace(/`([^`]+)`/g, "$1")
    // Remove assessment headers & tags
    .replace(/PART\s*\d+:?/gi, "")
    .replace(/Accuracy Check:?/gi, "")
    .replace(/Evaluation:?/gi, "")
    .replace(/Round\s*\d+:?/gi, "")
    .replace(/Question\s*\d+:?/gi, "")
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\[.*?\]/g, "")
    // Remove URL links
    .replace(/https?:\/\/\S+/g, "")
    // Clean multiple spaces and line breaks
    .replace(/\s+/g, " ")
    .trim();
}

// Persistent reference to prevent Chrome/Safari V8 garbage collection
let globalActiveUtterances: SpeechSynthesisUtterance[] = [];
let globalKeepAliveTimer: NodeJS.Timeout | null = null;
let globalSpeakingTimeout: NodeJS.Timeout | null = null;
let globalAutoplayTimer: NodeJS.Timeout | null = null;

function clearKeepAlive() {
  if (globalKeepAliveTimer) {
    clearInterval(globalKeepAliveTimer);
    globalKeepAliveTimer = null;
  }
  if (globalSpeakingTimeout) {
    clearTimeout(globalSpeakingTimeout);
    globalSpeakingTimeout = null;
  }
  if (globalAutoplayTimer) {
    clearTimeout(globalAutoplayTimer);
    globalAutoplayTimer = null;
  }
}

/**
 * Get voices asynchronously with browser fallback.
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const onVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
      window.speechSynthesis.onvoiceschanged = null;
    };

    window.speechSynthesis.onvoiceschanged = onVoicesChanged;

    // Timeout fallback if onvoiceschanged doesn't fire
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 400);
  });
}

/**
 * Select the most natural voice based on user preference persona.
 */
export function selectVoice(voices: SpeechSynthesisVoice[], persona: VoicePersona): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const enVoices = voices.filter((v) => v.lang.startsWith("en"));
  const pool = enVoices.length > 0 ? enVoices : voices;

  if (persona === "male") {
    const maleVoice =
      // 1. Edge / Windows Natural Male
      pool.find((v) => v.name.includes("Natural") && (v.name.includes("Guy") || v.name.includes("Christopher") || v.name.includes("Eric") || v.name.includes("Ryan") || v.name.includes("Andrew") || v.name.includes("Brian"))) ||
      // 2. Google / Microsoft High Quality Male
      pool.find((v) => (v.name.includes("Microsoft") || v.name.includes("Google")) && (v.name.includes("Guy") || v.name.includes("David") || v.name.includes("Mark") || v.name.includes("George") || v.name.includes("Male") || v.name.includes("UK English Male"))) ||
      // 3. Apple / OS Male
      pool.find((v) => v.name.includes("Male") || v.name.includes("David") || v.name.includes("Alex") || v.name.includes("Daniel") || v.name.includes("Arthur") || v.name.includes("Oliver")) ||
      // 4. Default English voice
      pool.find((v) => v.lang === "en-US" || v.lang === "en-GB") ||
      pool[0];

    return maleVoice || null;
  }

  if (persona === "female") {
    const femaleVoice =
      // 1. Edge / Windows Natural Female
      pool.find((v) => v.name.includes("Natural") && (v.name.includes("Jenny") || v.name.includes("Aria") || v.name.includes("Ava") || v.name.includes("Michelle") || v.name.includes("Emma") || v.name.includes("Ana"))) ||
      // 2. Google / Microsoft High Quality Female
      pool.find((v) => (v.name.includes("Microsoft") || v.name.includes("Google")) && (v.name.includes("Jenny") || v.name.includes("Zira") || v.name.includes("Aria") || v.name.includes("Female") || v.name.includes("UK English Female") || v.name.includes("US English"))) ||
      // 3. Apple / OS Female
      pool.find((v) => v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Victoria") || v.name.includes("Karen") || v.name.includes("Fiona")) ||
      // 4. Default English voice
      pool.find((v) => v.lang === "en-US" || v.lang === "en-GB") ||
      pool[0];

    return femaleVoice || null;
  }

  // "natural" - Best overall neural/natural voice
  const naturalVoice =
    pool.find((v) => v.name.includes("Natural")) ||
    pool.find((v) => v.name.includes("Neural")) ||
    pool.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
    pool.find((v) => v.lang === "en-US") ||
    pool[0];

  return naturalVoice || null;
}

/**
 * Split long text into conversational chunks (by sentence)
 * to prevent Chrome's SpeechSynthesis timeout bug on long questions.
 */
function chunkSpeechText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if ((currentChunk + " " + trimmed).length < 220) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) chunks.push(currentChunk);
      currentChunk = trimmed;
    }
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks.length > 0 ? chunks : [text];
}

export interface PlayAIVoiceOptions {
  text: string;
  settings?: VoiceSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Speaks text using the browser's speech synthesis engine with full error recovery.
 */
export async function speakAIText({
  text,
  settings = DEFAULT_VOICE_SETTINGS,
  onStart,
  onEnd,
  onError,
}: PlayAIVoiceOptions): Promise<boolean> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onError?.("Speech synthesis not supported on this browser.");
    return false;
  }

  stopAIVoice();

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    onEnd?.();
    return false;
  }

  try {
    // Unpause in case previous speech paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const voices = await getAvailableVoices();
    let chosenVoice = selectVoice(voices, settings.persona);
    const chunks = chunkSpeechText(cleanText);

    globalActiveUtterances = [];
    let chunkIndex = 0;
    let hasStarted = false;

    // Autoplay detection timer: If onstart hasn't fired within 1500ms, browser blocked audio
    globalAutoplayTimer = setTimeout(() => {
      if (!hasStarted) {
        console.warn("SpeechSynthesis did not start within 1500ms — likely blocked by browser autoplay policy.");
        clearKeepAlive();
        onError?.("not-allowed: autoplay blocked by browser");
        onEnd?.();
      }
    }, 1500);

    // Safety timeout in case speech engine stalls
    const estimatedDurationMs = Math.min(30000, Math.max(5000, cleanText.length * 100));
    globalSpeakingTimeout = setTimeout(() => {
      stopAIVoice();
      onEnd?.();
    }, estimatedDurationMs);

    // Safe keepalive for Chromium: resume only if paused without forcibly pulsing pause()
    globalKeepAliveTimer = setInterval(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 3000);

    const speakNextChunk = () => {
      if (chunkIndex >= chunks.length) {
        clearKeepAlive();
        globalActiveUtterances = [];
        onEnd?.();
        return;
      }

      const chunkText = chunks[chunkIndex];
      chunkIndex++;

      const utterance = new SpeechSynthesisUtterance(chunkText);
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      utterance.onstart = () => {
        if (globalAutoplayTimer) {
          clearTimeout(globalAutoplayTimer);
          globalAutoplayTimer = null;
        }
        if (!hasStarted) {
          hasStarted = true;
          onStart?.();
        }
      };

      utterance.onend = () => {
        speakNextChunk();
      };

      utterance.onerror = (e) => {
        // If canceled intentionally by user, finish gracefully
        if (e.error === "canceled" || e.error === "interrupted") {
          clearKeepAlive();
          onEnd?.();
          return;
        }
        if (e.error === "not-allowed") {
          clearKeepAlive();
          onError?.("not-allowed: browser blocked audio");
          onEnd?.();
          return;
        }
        console.warn("SpeechSynthesis chunk note:", e.error);
        // If chosen voice failed with network/synthesis error, clear voice and retry once
        if (chosenVoice && (e.error === "network" || e.error === "synthesis-failed")) {
          chosenVoice = null;
        }
        speakNextChunk();
      };

      // Keep reference to prevent GC in Chrome/Safari V8
      globalActiveUtterances.push(utterance);
      (window as any).__aiUtterance = utterance;

      window.speechSynthesis.speak(utterance);
    };

    // Small delay to ensure browser speech engine reset after cancel
    setTimeout(() => {
      speakNextChunk();
    }, 60);

    return true;
  } catch (err) {
    console.error("AI speech synthesis error:", err);
    clearKeepAlive();
    onError?.(err);
    onEnd?.();
    return false;
  }
}

/**
 * Immediately stop and cancel any active AI speech.
 */
export function stopAIVoice(): void {
  clearKeepAlive();
  globalActiveUtterances = [];
  if (typeof window !== "undefined" && (window as any).__aiUtterance) {
    delete (window as any).__aiUtterance;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Preview / test the AI voice with a natural test phrase.
 */
export async function testAIVoicePreview(
  settings: VoiceSettings,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  const sampleText =
    settings.persona === "female"
      ? "Hello! I am your AI interviewer. My audio is configured and ready for your interview session."
      : "Hello! I am your AI interviewer. My voice is working clearly and ready for your interview session.";

  await speakAIText({
    text: sampleText,
    settings,
    onStart,
    onEnd,
  });
}
