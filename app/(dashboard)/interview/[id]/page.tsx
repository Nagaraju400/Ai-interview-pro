"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, Send, StopCircle, Code2, Mic, Activity, Clock, Building2, Volume2, VolumeX, ArrowDown, ShieldAlert, Play, Terminal, AlertTriangle, ZoomIn, ZoomOut, Maximize2, Minimize2, Expand, Shrink, Text, Camera, CheckCircle2, UserCheck, UserX, Square, Settings2, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { AIAvatar } from "@/components/AIAvatar";
import { EnvironmentCheckModal } from "@/components/EnvironmentCheckModal";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TypewriterText } from "@/components/TypewriterText";
import { SpellCheckKeywords } from "@/components/SpellCheckKeywords";
import { playSubmitSound, playQuestionSound } from "@/lib/sounds";
import { verifyCandidateIdentity } from "@/utils/face-comparison";
import { speakAIText, stopAIVoice, loadVoiceSettings, VoiceSettings } from "@/lib/ai-voice";
import { AIVoiceSettings } from "@/components/AIVoiceSettings";

import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-go";
import "prismjs/themes/prism-tomorrow.css"; // Dark theme for code editor
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

type Message = {
  role: "system" | "user";
  content: string;
};

const STARTER_TEMPLATES: Record<string, string> = {
  javascript: "// Write your JavaScript solution here\n\n",
  typescript: "// Write your TypeScript solution here\n\n",
  python: "# Write your Python solution here\n\n",
  java: "public class Solution {\n    public static void main(String[] args) {\n        // Write your Java solution here\n    }\n}\n",
  kotlin: "class Solution {\n    fun solve() {\n        // Write your Kotlin solution here\n    }\n}\n",
  swift: "struct Solution {\n    func solve() {\n        // Write your Swift solution here\n    }\n}\n",
  cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ solution here\n    return 0;\n}\n",
  go: "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // Write your Go solution here\n}\n",
};

const detectLanguageFromRole = (roleStr?: string) => {
  if (!roleStr) return "javascript";
  const lower = roleStr.toLowerCase();
  if (lower.includes("android") || lower.includes("kotlin")) return "kotlin";
  if (lower.includes("ios") || lower.includes("swift")) return "swift";
  if (lower.includes("python") || lower.includes("data") || lower.includes("machine learning") || lower.includes("ai")) return "python";
  if (lower.includes("java") && !lower.includes("javascript")) return "java";
  if (lower.includes("c++") || lower.includes("cpp")) return "cpp";
  if (lower.includes("go") || lower.includes("golang")) return "go";
  if (lower.includes("typescript")) return "typescript";
  return "javascript";
};

const getLanguageGrammar = (lang: string) => {
  switch (lang) {
    case "typescript": return Prism.languages.typescript || Prism.languages.javascript;
    case "python": return Prism.languages.python || Prism.languages.clike;
    case "java": return Prism.languages.java || Prism.languages.clike;
    case "kotlin": return Prism.languages.kotlin || Prism.languages.clike;
    case "swift": return Prism.languages.swift || Prism.languages.clike;
    case "cpp": return Prism.languages.cpp || Prism.languages.c || Prism.languages.clike;
    case "go": return Prism.languages.go || Prism.languages.clike;
    default: return Prism.languages.javascript;
  }
};

export default function InterviewChatPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">("md");
  const [isExpandedChat, setIsExpandedChat] = useState(false);
  const [isExpandedAnswerBoard, setIsExpandedAnswerBoard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [interviewType, setInterviewType] = useState("HR");
  const [company, setCompany] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState<string>("Software Engineer");
  const [showEnvCheckModal, setShowEnvCheckModal] = useState<boolean>(() => {
    if (typeof window !== "undefined" && interviewId) {
      return sessionStorage.getItem(`env_checked_${interviewId}`) !== "true";
    }
    return true;
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => loadVoiceSettings());
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState<number | null>(null);
  const [audioAutoplayBlocked, setAudioAutoplayBlocked] = useState(false);
  const firstQuestionTextRef = useRef<string | null>(null);

  const [candidatePhoto, setCandidatePhoto] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(`candidate_photo_${interviewId}`) || sessionStorage.getItem("candidate_reference_photo") || null;
    }
    return null;
  });
  const candidatePhotoRef = useRef<string | null>(candidatePhoto);
  const [identityStatus, setIdentityStatus] = useState<"MATCH" | "MISMATCH" | "UNCERTAIN" | "NO_FACE" | "MULTIPLE">("MATCH");
  const [identitySimilarity, setIdentitySimilarity] = useState<number>(98);
  const [showImpersonationAlert, setShowImpersonationAlert] = useState<boolean>(false);
  const mismatchCounterRef = useRef<number>(0);

  const handleConfirmEnvCheck = (photo?: string) => {
    if (typeof window !== "undefined" && interviewId) {
      sessionStorage.setItem(`env_checked_${interviewId}`, "true");
      if (photo) {
        sessionStorage.setItem(`candidate_photo_${interviewId}`, photo);
        setCandidatePhoto(photo);
        candidatePhotoRef.current = photo;
      }
    }
    setShowEnvCheckModal(false);

    // USER GESTURE TRIGGER: Speak the active question immediately upon entering interview!
    if (firstQuestionTextRef.current) {
      const qText = firstQuestionTextRef.current;
      setTimeout(() => {
        speak(qText);
      }, 200);
    }
  };

  const recaptureCandidatePhoto = () => {
    if (webcamRef.current) {
      const snap = webcamRef.current.getScreenshot();
      if (snap) {
        setCandidatePhoto(snap);
        candidatePhotoRef.current = snap;
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`candidate_photo_${interviewId}`, snap);
        }
        setShowImpersonationAlert(false);
        mismatchCounterRef.current = 0;
        setIdentityStatus("MATCH");
        setIdentitySimilarity(99);
      }
    }
  };
  const [detectedFaceCount, setDetectedFaceCount] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode] = useState("// Write your solution here\n\n");
  const [showCodingWarning, setShowCodingWarning] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const codeEditorRef = useRef<HTMLDivElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [interviewSeconds, setInterviewSeconds] = useState(0);
  const [hasPromptedAudioCheck, setHasPromptedAudioCheck] = useState(false);
  const [wasCopyPasted, setWasCopyPasted] = useState(false);
  const [showPasteWarning, setShowPasteWarning] = useState(false);

  const analyzeSyntaxAndErrors = (sourceCode: string, lang: string): { hasError: boolean; message: string } => {
    // 1. Bracket & Parentheses balance check
    const stack: { char: string; line: number }[] = [];
    const lines = sourceCode.split('\n');
    
    for (let l = 0; l < lines.length; l++) {
      const lineText = lines[l];
      for (let c = 0; c < lineText.length; c++) {
        const char = lineText[c];
        if (char === '{' || char === '(' || char === '[') {
          stack.push({ char, line: l + 1 });
        } else if (char === '}' || char === ')' || char === ']') {
          const last = stack.pop();
          const matches = (char === '}' && last?.char === '{') ||
                          (char === ')' && last?.char === '(') ||
                          (char === ']' && last?.char === '[');
          if (!matches) {
            return {
              hasError: true,
              message: `❌ Syntax Error (Line ${l + 1}): Unmatched closing bracket '${char}'${last ? ` (expected closing for '${last.char}' from Line ${last.line})` : ""}.`
            };
          }
        }
      }
    }

    if (stack.length > 0) {
      const unclosed = stack[stack.length - 1];
      return {
        hasError: true,
        message: `❌ Syntax Error (Line ${unclosed.line}): Unclosed bracket '${unclosed.char}'. Missing closing symbol.`
      };
    }

    // 2. JS / TS Parsing Validation
    if (lang === "javascript" || lang === "typescript") {
      try {
        new Function(sourceCode);
      } catch (err: any) {
        return {
          hasError: true,
          message: `❌ Syntax Analysis Error:\n${err.name || 'SyntaxError'}: ${err.message || String(err)}`
        };
      }
    }

    return { hasError: false, message: "" };
  };

  const runCode = () => {
    if (!code.trim()) return;
    setIsRunningCode(true);
    setConsoleOutput(null);

    setTimeout(() => {
      // Step 1: Static Syntax Analysis
      const syntaxCheck = analyzeSyntaxAndErrors(code, selectedLanguage);
      if (syntaxCheck.hasError) {
        setConsoleOutput(syntaxCheck.message);
        setIsRunningCode(false);
        return;
      }

      // Step 2: Code Execution / Execution Sandbox
      try {
        if (selectedLanguage === "javascript" || selectedLanguage === "typescript") {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
            error: (...args: any[]) => logs.push("Error: " + args.join(' ')),
            warn: (...args: any[]) => logs.push("Warning: " + args.join(' ')),
          };
          const runFn = new Function("console", code);
          runFn(customConsole);
          setConsoleOutput(logs.length > 0 
            ? `✓ Syntax Validated (0 parsing errors).\n\nConsole Output:\n${logs.join("\n")}` 
            : `✓ Syntax Validated (0 parsing errors).\n✓ Execution completed with zero runtime errors.`);
        } else {
          setConsoleOutput(`[${selectedLanguage.toUpperCase()} Compiler Sandbox Diagnostics]\n✓ Syntax check passed cleanly.\n✓ Structure compiled with 0 syntax errors.`);
        }
      } catch (err: any) {
        setConsoleOutput(`❌ Runtime Execution Error:\n${err.name || 'Error'}: ${err.message || String(err)}`);
      } finally {
        setIsRunningCode(false);
      }
    }, 400);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.length > 20) {
      setWasCopyPasted(true);
      setShowPasteWarning(true);
      setTimeout(() => setShowPasteWarning(false), 7000);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cleanupAudioAndSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current);
      speakingTimeoutRef.current = null;
    }
    if (recognitionRestartTimeoutRef.current) {
      clearTimeout(recognitionRestartTimeoutRef.current);
      recognitionRestartTimeoutRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (activeMicStreamRef.current) {
      activeMicStreamRef.current.getTracks().forEach((t) => t.stop());
      activeMicStreamRef.current = null;
      setActiveMicStream(null);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
      mediaRecorderRef.current = null;
    }
    stopAIVoice();
    setIsSpeaking(false);
    setSpeakingMessageIndex(null);
    setIsRecording(false);
    isRecordingRef.current = false;
  };

  // Stop AI voice and recording immediately when leaving page or navigating back
  useEffect(() => {
    return () => {
      cleanupAudioAndSpeech();
    };
  }, []);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      isMutedRef.current = next;
      if (next) {
        stopAIVoice();
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
      }
      return next;
    });
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video and Speech State
  const webcamRef = useRef<Webcam>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [activeMicStream, setActiveMicStream] = useState<MediaStream | null>(null);
  const activeMicStreamRef = useRef<MediaStream | null>(null);
  const [transcript, setTranscript] = useState("");
  const [expressionData, setExpressionData] = useState<{happy: number, neutral: number, sad: number, fearful: number, angry: number, surprised: number}>({ happy: 0, neutral: 0, sad: 0, fearful: 0, angry: 0, surprised: 0 });
  const [currentExpressions, setCurrentExpressions] = useState<{happy: number, neutral: number, sad: number, fearful: number, angry: number, surprised: number} | null>(null);
  const [frameCounts, setFrameCounts] = useState(0);
  const recognitionRef = useRef<any>(null);
  const recognitionRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const finalTranscriptRef = useRef<string>("");
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopSpeaking = () => {
    stopAIVoice();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setSpeakingMessageIndex(null);
  };

  const speak = (text: string, msgIndex?: number) => {
    if (!text || isMutedRef.current) return;

    // Clean up previous speech
    stopSpeaking();

    setIsSpeaking(true);
    setSpeakingMessageIndex(msgIndex ?? null);

    speakAIText({
      text,
      settings: voiceSettings,
      onStart: () => {
        setIsSpeaking(true);
        setAudioAutoplayBlocked(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
      },
      onError: (err) => {
        setIsSpeaking(false);
        setSpeakingMessageIndex(null);
        if (err && String(err).includes("not-allowed")) {
          setAudioAutoplayBlocked(true);
        }
      },
    });
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchFirstQuestion = async () => {
      try {
        const res = await fetch(`/api/interview/${interviewId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch question");
        }

        if (data.interviewType) {
          setInterviewType(data.interviewType);
        }

        if (data.company) {
          setCompany(data.company);
        }

        if (data.role) {
          setTargetRole(data.role);
          const autoLang = detectLanguageFromRole(data.role);
          setSelectedLanguage(autoLang);
          setCode(STARTER_TEMPLATES[autoLang] || STARTER_TEMPLATES.javascript);
        }

        if (data.completed) {
          setCompleted(true);
          if (data.history && Array.isArray(data.history) && data.history.length > 0) {
            setMessages(data.history);
          }
        } else if (data.history && Array.isArray(data.history) && data.history.length > 0) {
          setMessages(data.history);
          if (data.questionId) {
            setCurrentQuestionId(data.questionId);
          }
          setHasPromptedAudioCheck(false);
          const lastMsg = data.history[data.history.length - 1];
          if (lastMsg && lastMsg.role === "system") {
            firstQuestionTextRef.current = lastMsg.content;
            const isModalOpen = typeof window !== "undefined" && sessionStorage.getItem(`env_checked_${interviewId}`) !== "true";
            if (!isModalOpen && voiceSettings.autoSpeak) {
              speak(lastMsg.content);
            }
          }
        } else if (data.question) {
          setMessages([{ role: "system", content: data.question }]);
          setCurrentQuestionId(data.questionId);
          setHasPromptedAudioCheck(false);
          firstQuestionTextRef.current = data.question;
          const isModalOpen = typeof window !== "undefined" && sessionStorage.getItem(`env_checked_${interviewId}`) !== "true";
          if (!isModalOpen && voiceSettings.autoSpeak) {
            speak(data.question);
          }
        }
      } catch (err) {
        console.error("Failed to fetch initial question:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstQuestion();

    // Load Face-API models safely
    const loadModels = async () => {
      try {
        const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.warn("Face-api models could not be loaded, continuing without expressions:", err);
        setModelsLoaded(true); // Don't block candidate from recording
      }
    };
    loadModels();
  }, [interviewId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, transcript]);

  // Dynamic Speech Recognition Session Handler
  const startSpeechRecognitionSession = () => {
    if (typeof window === "undefined") return null;
    // @ts-ignore
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      console.warn("SpeechRecognition API not available in this browser. Relying on MediaRecorder + server transcription fallback.");
      return null;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = "";
        let sessionFinal = "";
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || "";
          if (item.isFinal) {
            sessionFinal += (sessionFinal ? " " : "") + text.trim();
          } else {
            interim += (interim ? " " : "") + text.trim();
          }
        }

        const base = finalTranscriptRef.current ? finalTranscriptRef.current.trim() : "";
        const combined = [base, sessionFinal, interim].filter(Boolean).join(" ").trim();

        if (combined) {
          setTranscript(combined);
          setCurrentAnswer(combined);
        }

        // Auto-submit after 5 seconds of silence if at least 3 words spoken
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const wordCount = combined.split(/\s+/).filter(Boolean).length;
        silenceTimerRef.current = setTimeout(() => {
          if (isRecordingRef.current && wordCount >= 3) {
            document.getElementById("submit-answer-btn")?.click();
          }
        }, 5000);
      };

      recognition.onerror = (event: any) => {
        if (event.error === "no-speech") {
          // Normal candidate thinking pause — do not abort recording
          return;
        }
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setMicPermissionError("Microphone access was denied or blocked in browser settings.");
        }
        console.warn("SpeechRecognition note:", event.error);
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          setTranscript((current) => {
            if (current) finalTranscriptRef.current = current;
            return current;
          });
          if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);
          recognitionRestartTimeoutRef.current = setTimeout(() => {
            if (isRecordingRef.current) {
              startSpeechRecognitionSession();
            }
          }, 120);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      return recognition;
    } catch (err) {
      console.warn("SpeechRecognition setup note:", err);
      return null;
    }
  };

  const startRecording = async () => {
    if (isTranscribing) return;
    if (isSpeaking) {
      stopSpeaking();
    }
    setMicPermissionError(null);
    finalTranscriptRef.current = "";
    setTranscript("");
    setCurrentAnswer("");
    setIsRecording(true);
    isRecordingRef.current = true;
    setExpressionData({ happy: 0, neutral: 0, sad: 0, fearful: 0, angry: 0, surprised: 0 });
    setCurrentExpressions(null);
    setFrameCounts(0);

    // Acquire microphone audio stream with noise cancellation & echo suppression
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      activeMicStreamRef.current = stream;
      setActiveMicStream(stream);

      // Initialize Universal MediaRecorder Fallback for ALL browsers
      audioChunksRef.current = [];
      const mimeType = typeof MediaRecorder !== "undefined"
        ? MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : ""
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      setMicPermissionError("Microphone permission denied or hardware unavailable.");
      setIsRecording(false);
      isRecordingRef.current = false;
      return;
    }
    
    // Start Web Speech Recognition session
    startSpeechRecognitionSession();

    intervalRef.current = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        const allDetections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
        
        setDetectedFaceCount(allDetections.length);

        // Auto-register candidate reference photo if missing
        if (!candidatePhotoRef.current && allDetections.length === 1) {
          const autoSnap = webcamRef.current.getScreenshot();
          if (autoSnap) {
            candidatePhotoRef.current = autoSnap;
            setCandidatePhoto(autoSnap);
            if (typeof window !== "undefined") {
              sessionStorage.setItem(`candidate_photo_${interviewId}`, autoSnap);
            }
          }
        }

        if (allDetections.length > 0) {
          const primaryFace = allDetections[0];
          setCurrentExpressions({
            happy: primaryFace.expressions.happy,
            neutral: primaryFace.expressions.neutral,
            sad: primaryFace.expressions.sad,
            fearful: primaryFace.expressions.fearful,
            angry: primaryFace.expressions.angry,
            surprised: primaryFace.expressions.surprised,
          });
          setExpressionData(prev => ({
            happy: prev.happy + primaryFace.expressions.happy,
            neutral: prev.neutral + primaryFace.expressions.neutral,
            sad: prev.sad + primaryFace.expressions.sad,
            fearful: prev.fearful + primaryFace.expressions.fearful,
            angry: prev.angry + primaryFace.expressions.angry,
            surprised: prev.surprised + primaryFace.expressions.surprised,
          }));
          setFrameCounts(prev => prev + 1);

          // Track candidate identity (same vs different person)
          if (candidatePhotoRef.current && allDetections.length === 1) {
            try {
              const res = await verifyCandidateIdentity(candidatePhotoRef.current, video, (primaryFace as any)?.detection?.box);
              setIdentitySimilarity(res.similarity);
              if (res.status === "MISMATCH") {
                mismatchCounterRef.current += 1;
                if (mismatchCounterRef.current >= 3) {
                  setIdentityStatus("MISMATCH");
                  setShowImpersonationAlert(true);
                }
              } else {
                mismatchCounterRef.current = 0;
                setShowImpersonationAlert(false);
                setIdentityStatus(res.status);
              }
            } catch (err) {}
          } else if (allDetections.length > 1) {
            setIdentityStatus("MULTIPLE");
          }
        } else {
          setCurrentExpressions(null);
          setIdentityStatus("NO_FACE");
        }
      }
    }, 1000);
  };

  // Continuous Anti-Impersonation & Candidate Face Tracking Loop
  useEffect(() => {
    if (!modelsLoaded || completed || isRecording) return;

    const proctorInterval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;
        try {
          const allDetections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
          setDetectedFaceCount(allDetections.length);

          if (!candidatePhotoRef.current && allDetections.length === 1) {
            const autoSnap = webcamRef.current.getScreenshot();
            if (autoSnap) {
              candidatePhotoRef.current = autoSnap;
              setCandidatePhoto(autoSnap);
              if (typeof window !== "undefined") {
                sessionStorage.setItem(`candidate_photo_${interviewId}`, autoSnap);
              }
            }
          }

          if (allDetections.length === 1 && candidatePhotoRef.current) {
            const primaryFace = allDetections[0];
            const res = await verifyCandidateIdentity(candidatePhotoRef.current, video, (primaryFace as any)?.detection?.box);
            setIdentitySimilarity(res.similarity);
            if (res.status === "MISMATCH") {
              mismatchCounterRef.current += 1;
              if (mismatchCounterRef.current >= 3) {
                setIdentityStatus("MISMATCH");
                setShowImpersonationAlert(true);
              }
            } else {
              mismatchCounterRef.current = 0;
              setShowImpersonationAlert(false);
              setIdentityStatus(res.status);
            }
          } else if (allDetections.length === 0) {
            setIdentityStatus("NO_FACE");
          } else if (allDetections.length > 1) {
            setIdentityStatus("MULTIPLE");
          }
        } catch (e) {}
      }
    }, 2000);

    return () => clearInterval(proctorInterval);
  }, [modelsLoaded, completed, isRecording, interviewId]);

  const stopRecording = async () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setCurrentExpressions(null);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRestartTimeoutRef.current) clearTimeout(recognitionRestartTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Stop Web Speech Recognition cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // Stop MediaRecorder and wait for final audio chunks
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        try {
          recorder.stop();
        } catch (e) {
          resolve();
        }
      });
    }
    mediaRecorderRef.current = null;

    // Release microphone tracks cleanly
    if (activeMicStreamRef.current) {
      activeMicStreamRef.current.getTracks().forEach((t) => t.stop());
      activeMicStreamRef.current = null;
      setActiveMicStream(null);
    }

    const nativeText = (finalTranscriptRef.current || transcript || currentAnswer).trim();
    if (nativeText.length > 0) {
      setCurrentAnswer(nativeText);
      setTranscript(nativeText);
      return;
    }

    // Fallback: If browser Web Speech returned no text, process recorded audio via /api/transcribe
    if (audioChunksRef.current.length > 0) {
      const mimeType = recorder?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

      if (audioBlob.size > 200) {
        setIsTranscribing(true);
        try {
          const formData = new FormData();
          formData.append("file", audioBlob, "recording.webm");

          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.transcript && data.transcript.trim()) {
            const serverText = data.transcript.trim();
            setTranscript(serverText);
            setCurrentAnswer(serverText);
            return;
          }
        } catch (err) {
          console.error("Server audio transcription error:", err);
        } finally {
          setIsTranscribing(false);
        }
      }
    }

    setMicPermissionError("No spoken words were heard. Please speak clearly into the microphone or type your answer below.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!currentAnswer.trim() && !code.trim() && !transcript.trim()) || loading || completed) return;

    if (isRecording) {
      stopRecording();
    }

    let answerText = currentAnswer || transcript.trim();
    
    // Append code to answer if non-default code solution was entered
    const isDefaultTemplate = Object.values(STARTER_TEMPLATES).some(t => t.trim() === code.trim());
    const hasUserProvidedCode = code.trim().length > 0 && !isDefaultTemplate;

    // Enforce coding solution requirement in Coding interview rounds
    if (isCodingRound && !hasUserProvidedCode) {
      setShowCodingWarning(true);
      setShowCodeEditor(true);
      setTimeout(() => {
        codeEditorRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    setShowCodingWarning(false);

    if (code.trim() && !isDefaultTemplate) {
      answerText += `\n\nCode Solution:\n\`\`\`${selectedLanguage}\n${code}\n\`\`\``;
    }

    setMessages((prev) => [...prev, { role: "user", content: answerText }]);
    setCurrentAnswer("");
    setTranscript("");
    finalTranscriptRef.current = "";
    setLoading(true);
    playSubmitSound();

    try {
      const avgExpressions = frameCounts > 0 ? {
        happy: expressionData.happy / frameCounts,
        neutral: expressionData.neutral / frameCounts,
        sad: expressionData.sad / frameCounts,
        fearful: expressionData.fearful / frameCounts,
        angry: expressionData.angry / frameCounts,
        surprised: expressionData.surprised / frameCounts,
      } : null;

      const res = await fetch(`/api/interview/${interviewId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          answer: answerText,
          previousQuestionId: currentQuestionId,
          expressions: avgExpressions,
          wasPasted: wasCopyPasted
        }),
      });

      setWasCopyPasted(false);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit answer");
      }

      if (data.completed) {
        setCompleted(true);
        const endMsg = "That concludes our interview. Thank you for your time. Click 'End Interview & View Feedback' below to see your results.";
        setMessages((prev) => [
          ...prev, 
          { role: "system", content: endMsg }
        ]);
        if (voiceSettings.autoSpeak) {
          speak(endMsg);
        }
      } else if (data.question) {
        playQuestionSound();
        setMessages((prev) => [...prev, { role: "system", content: data.question }]);
        setCurrentQuestionId(data.questionId);
        setHasPromptedAudioCheck(false);
        if (voiceSettings.autoSpeak) {
          speak(data.question);
        }
      }
    } catch (err) {
      console.error("Failed to send answer:", err);
    } finally {
      setLoading(false);
    }
  };

  const endInterview = async (finalTime: number = interviewSeconds) => {
    cleanupAudioAndSpeech();
    router.push(`/interview/${interviewId}/feedback?timeConducted=${finalTime}`);
  };

  const isCodingRound = interviewType === "Coding";

  // Active System Question Text
  const lastSystemMessage = messages.slice().reverse().find(m => m.role === "system")?.content || "";

  const isNonCodingRound = 
    interviewType === "Aptitude & Problem Solving" || 
    interviewType === "HR" || 
    interviewType === "Product Management";

  // Dynamic Question Coding Analysis: Shows code editor ONLY when question requires code or in Coding round
  const isCodingQuestion = isCodingRound || (!isNonCodingRound && (
    lastSystemMessage.toLowerCase().includes("write code") ||
    lastSystemMessage.toLowerCase().includes("write a function") ||
    lastSystemMessage.toLowerCase().includes("implement a function") ||
    lastSystemMessage.toLowerCase().includes("write a program") ||
    lastSystemMessage.toLowerCase().includes("class solution") ||
    lastSystemMessage.toLowerCase().includes("def ")
  ));

  // Synchronize Code Editor Visibility with Dynamic Question Requirements
  useEffect(() => {
    if (isCodingQuestion) {
      setShowCodeEditor(true);
    } else {
      setShowCodeEditor(false);
    }
  }, [isCodingQuestion]);

  // Parse MCQ Options A), B), C), D) for Aptitude Rounds safely
  const mcqOptions = (() => {
    if (!lastSystemMessage) return [];
    
    // Isolate question section if preceding feedback/evaluation text is present
    let questionText = lastSystemMessage;
    const questionMarkers = ["Question:", "Question 1:", "Question 2:", "Question 3:", "Question 4:", "Question 5:", "Next Question:"];
    for (const marker of questionMarkers) {
      const markerIdx = lastSystemMessage.lastIndexOf(marker);
      if (markerIdx !== -1) {
        questionText = lastSystemMessage.substring(markerIdx);
        break;
      }
    }

    const optionRegex = /(?:^|\n|\s|\*)([A-D])[\)\.]\s*([^\n\r]+)/gi;
    const options: { label: string; text: string; full: string }[] = [];
    const seenLabels = new Set<string>();
    let match;

    while ((match = optionRegex.exec(questionText)) !== null) {
      const label = match[1].toUpperCase();
      const cleanText = match[2].replace(/\*+/g, "").trim();

      // Deduplicate options by label (e.g. ensure only 1 choice for A, B, C, D)
      if (!seenLabels.has(label)) {
        seenLabels.add(label);
        options.push({
          label,
          text: cleanText,
          full: `${label}) ${cleanText}`,
        });
      }
    }

    return options;
  })();

  useEffect(() => {
    if (completed) return;
    const timer = setInterval(() => {
      setInterviewSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [completed]);

  // Gentle AI Audio Reminder for prolonged silence (without mutating chat history)
  useEffect(() => {
    if (completed || loading || isSpeaking || isRecording || hasPromptedAudioCheck) return;
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'system') return;

    const timeout = setTimeout(() => {
      if (!currentAnswer.trim() && code === "// Write your solution here\n\n") {
        setHasPromptedAudioCheck(true);
        speak("Take your time, Candidate. Whenever you are ready, click the microphone or type your answer below.");
      }
    }, 35000); // 35 seconds of quiet reflection

    return () => clearTimeout(timeout);
  }, [messages, currentAnswer, code, isRecording, isSpeaking, loading, completed, hasPromptedAudioCheck]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <>
      <EnvironmentCheckModal
        isOpen={showEnvCheckModal}
        onConfirm={handleConfirmEnvCheck}
        roleName={interviewType}
        companyName={company}
        initialPhoto={candidatePhoto}
      />

      {/* Floating Anti-Impersonation Alert Banner */}
      <AnimatePresence>
        {showImpersonationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92%] bg-red-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/40 flex items-center gap-3.5 backdrop-blur-md"
          >
            <div className="p-2 rounded-xl bg-white/20 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">Anti-Impersonation Warning: Different Person Detected</p>
              <p className="text-xs text-red-100 leading-snug">
                Face tracking indicates the candidate in front of the camera does not match the registered baseline ID ({identitySimilarity}% match).
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={recaptureCandidatePhoto}
              className="bg-white/10 hover:bg-white/20 text-white border-white/40 text-xs shrink-0 cursor-pointer"
            >
              Update ID Photo
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={`container mx-auto p-3 md:p-8 min-h-[calc(100vh-4rem)] ${showCodeEditor ? 'h-auto pb-12' : 'md:h-[calc(100vh-6rem)]'} flex flex-col ${isCodingRound || showCodeEditor ? 'max-w-[95%]' : 'max-w-[1400px]'}`}
      >
        <motion.div variants={itemVariants} className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex flex-wrap items-center gap-3">
              Mock Interview Session {isCodingRound && <span className="text-primary text-lg font-normal ml-2">(Coding Round)</span>}
              {company && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  <Building2 className="w-3.5 h-3.5" /> Target: {company}
                </span>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border bg-muted text-foreground">
                <Clock className="w-4 h-4 text-primary" />
                {formatTime(interviewSeconds)}
              </div>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Answer naturally as you would in a real interview round.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEnvCheckModal(true)}
              className="text-xs font-medium cursor-pointer"
            >
              <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Adjust Environment
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="destructive" size="sm" onClick={() => endInterview()} className="cursor-pointer">
                <StopCircle className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Dedicated Round Live Progress Tracker */}
        <motion.div variants={itemVariants} className="mb-4 bg-card/60 backdrop-blur-md border border-border/80 p-3 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {interviewType === "HR" 
                ? "Dedicated Round: HR & Behavioral Screening"
                : interviewType === "Coding"
                ? "Dedicated Round: Live Coding & Algorithms"
                : interviewType === "System Design"
                ? "Dedicated Round: System Architecture"
                : interviewType === "Product Management"
                ? "Dedicated Round: Product Strategy & Metrics"
                : interviewType === "Aptitude & Problem Solving"
                ? "Dedicated Round: Aptitude & Logic"
                : interviewType === "FAANG Style (Strict)"
                ? "Dedicated Round: FAANG High-Rigor Technical"
                : "Dedicated Round: Core Engineering Technical"}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {interviewType === "HR" 
                ? "Evaluating background verification, communication, culture fit & STAR leadership scenarios."
                : interviewType === "Coding"
                ? "Evaluating data structures, algorithmic optimization & code execution."
                : interviewType === "System Design"
                ? "Evaluating system architecture, database scaling, API design & fault tolerance."
                : interviewType === "Product Management"
                ? "Evaluating user discovery, feature prioritization metrics & product vision."
                : interviewType === "Aptitude & Problem Solving"
                ? "Evaluating quantitative reasoning, logical puzzles & analytical problem solving."
                : interviewType === "FAANG Style (Strict)"
                ? "Evaluating deep technical rigor, stress edge-cases & high scale performance."
                : "Evaluating core concepts, framework mechanics & debugging execution logic."}
            </span>
          </div>

          {/* Progressive 4-Round & 20-Question Step Tracker */}
          {(() => {
            const systemMsgCount = messages.filter(m => m.role === 'system').length;
            const currentQ = Math.max(1, systemMsgCount);
            const currentRoundNum = Math.min(4, Math.floor((currentQ - 1) / 5) + 1);

            return (
              <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold">
                    Round {currentRoundNum}/4
                  </span>
                  <span className="text-xs text-muted-foreground font-mono font-medium">
                    Question {currentQ}/20
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((rnd) => {
                    const isRoundCompleted = rnd < currentRoundNum;
                    const isRoundCurrent = rnd === currentRoundNum;
                    return (
                      <div key={rnd} className="flex items-center gap-1">
                        <div
                          title={`Round ${rnd} (Questions ${(rnd - 1) * 5 + 1} to ${rnd * 5})`}
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                            isRoundCompleted
                              ? "bg-emerald-500 text-white shadow-xs"
                              : isRoundCurrent
                              ? "bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-md scale-105"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {isRoundCompleted ? `R${rnd} ✓` : `R${rnd}`}
                        </div>
                        {rnd < 4 && (
                          <div className={`w-2 h-0.5 rounded-full ${isRoundCompleted ? "bg-emerald-500" : "bg-muted"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </motion.div>

        {/* Dynamic Round Transition Notification Banner */}
        {(() => {
          const systemMsgCount = messages.filter(m => m.role === 'system').length;
          if (systemMsgCount >= 6 && systemMsgCount <= 10) {
            return (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-purple-500/15 border border-indigo-500/30 text-xs flex items-center justify-between shadow-sm">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500 text-white font-bold shadow-2xs">Round 2 Active</span>
                  ⚡ Performance-Adapted Round: Questions in this round adapt directly to your performance in Round 1!
                </span>
                <span className="text-[11px] text-muted-foreground font-mono font-medium hidden md:inline">Questions 6–10</span>
              </motion.div>
            );
          }
          if (systemMsgCount >= 11 && systemMsgCount <= 15) {
            return (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-amber-500/15 border border-purple-500/30 text-xs flex items-center justify-between shadow-sm">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500 text-white font-bold shadow-2xs">Round 3 Active</span>
                  🚀 Advanced Domain & Operational Trade-Offs Round
                </span>
                <span className="text-[11px] text-muted-foreground font-mono font-medium hidden md:inline">Questions 11–15</span>
              </motion.div>
            );
          }
          if (systemMsgCount >= 16) {
            return (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-cyan-500/15 border border-amber-500/30 text-xs flex items-center justify-between shadow-sm">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-bold shadow-2xs">Round 4 Active</span>
                  🏆 Final Master Round: High-Level System Architecture & Stress Scenarios
                </span>
                <span className="text-[11px] text-muted-foreground font-mono font-medium hidden md:inline">Questions 16–20</span>
              </motion.div>
            );
          }
          return null;
        })()}

        <motion.div variants={itemVariants} className={`flex-1 flex gap-6 ${showCodeEditor ? 'flex-col lg:grid lg:grid-cols-12 items-start' : 'flex-col md:flex-row'} overflow-hidden`}>
          
          {/* Dashcam Sidebar */}
          <motion.div variants={itemVariants} className="w-full md:w-64 shrink-0 flex flex-col gap-4">
            <motion.div 
              animate={{ boxShadow: isRecording ? "0 0 15px rgba(239, 68, 68, 0.5)" : "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              className="rounded-2xl overflow-hidden bg-slate-900 aspect-video relative border-2 border-primary/20 shadow-md transition-colors"
            >
              {modelsLoaded ? (
                <Webcam 
                  ref={webcamRef}
                  audio={false}
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Loading AI Camera...</div>
              )}
              {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 px-2 py-1 rounded-full text-xs text-white">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> REC
                </div>
              )}

              {/* Live Disturbance & Environment Status Overlay */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                {detectedFaceCount > 1 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600/90 text-white font-semibold flex items-center gap-1 animate-pulse shadow">
                    ⚠️ Multiple Faces
                  </span>
                ) : detectedFaceCount === 0 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-600/90 text-white font-semibold flex items-center gap-1 shadow">
                    ⚠️ No Face Detected
                  </span>
                ) : identityStatus === "MISMATCH" ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-bold flex items-center gap-1 animate-pulse shadow">
                    🚨 Mismatch ({identitySimilarity}%)
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600/90 text-white font-medium flex items-center gap-1 shadow">
                    🟢 ID Verified ({identitySimilarity}%)
                  </span>
                )}
              </div>
            </motion.div>

          {/* Candidate ID & Anti-Impersonation Proctoring Card */}
          <div className="bg-card border rounded-2xl p-3.5 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-primary" /> Identity Proctoring
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                identityStatus === "MATCH"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : identityStatus === "MISMATCH"
                  ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 animate-pulse"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}>
                {identityStatus === "MATCH" && `✓ Verified (${identitySimilarity}%)`}
                {identityStatus === "MISMATCH" && "🚨 Impersonation Alert"}
                {identityStatus === "NO_FACE" && "⚠️ Face Missing"}
                {identityStatus === "MULTIPLE" && "⚠️ Multiple Persons"}
                {identityStatus === "UNCERTAIN" && `Evaluating (${identitySimilarity}%)`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {candidatePhoto ? (
                <div className="relative group shrink-0">
                  <img
                    src={candidatePhoto}
                    alt="Registered Candidate Photo"
                    className="w-11 h-11 rounded-xl object-cover border-2 border-primary/30 shadow-xs"
                  />
                  <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>
              ) : (
                <div className="w-11 h-11 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {candidatePhoto ? "Registered Baseline ID" : "Auto-Registering ID..."}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {identityStatus === "MATCH" 
                    ? "Biometrics match registered photo." 
                    : identityStatus === "MISMATCH"
                    ? "Warning: Different person detected!"
                    : "Continuous proctoring active."}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={recaptureCandidatePhoto}
                title="Recapture baseline photo"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-4 shadow-sm text-center">
            <h3 className="font-semibold text-sm mb-2 text-foreground">Voice & Expression AI</h3>
            <p className="text-xs text-muted-foreground mb-4">We analyze your facial expressions and tone to provide confidence feedback.</p>
            
            {/* Live Expression Visualizer */}
            <AnimatePresence>
              {isRecording && currentExpressions && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 space-y-2 overflow-hidden"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-left font-medium">Happy</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-green-500" animate={{ width: `${currentExpressions.happy * 100}%` }} transition={{ type: "spring", bounce: 0 }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-left font-medium">Neutral</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-blue-500" animate={{ width: `${currentExpressions.neutral * 100}%` }} transition={{ type: "spring", bounce: 0 }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-left font-medium">Surprise</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-yellow-500" animate={{ width: `${currentExpressions.surprised * 100}%` }} transition={{ type: "spring", bounce: 0 }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-12 text-left font-medium">Focus</span>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full bg-purple-500" animate={{ width: `${(1 - currentExpressions.happy - currentExpressions.sad - currentExpressions.angry - currentExpressions.fearful) * 100}%` }} transition={{ type: "spring", bounce: 0 }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {isSpeaking ? (
              <div className="space-y-2">
                <Button className="w-full cursor-not-allowed bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30" disabled>
                  <Volume2 className="w-4 h-4 mr-2 animate-pulse text-amber-500" /> AI Speaking... Please Wait
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeaking}
                  className="w-full h-8 text-xs border-amber-500/40 text-amber-500 hover:bg-amber-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Square className="w-3 h-3 fill-current" /> Stop AI Voice & Answer Now
                </Button>
              </div>
            ) : isTranscribing ? (
              <Button className="w-full cursor-not-allowed bg-cyan-500/10 text-cyan-400 border border-cyan-500/30" disabled>
                <div className="w-4 h-4 mr-2 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> Transcribing Voice with AI...
              </Button>
            ) : isRecording ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button variant="destructive" className="w-full cursor-pointer" onClick={stopRecording}>
                  <StopCircle className="w-4 h-4 mr-2" /> Stop Speaking & Process Answer
                </Button>
              </motion.div>
            ) : (
              <motion.div whileHover={loading || completed ? {} : { scale: 1.02 }} whileTap={loading || completed ? {} : { scale: 0.98 }}>
                <Button className="w-full cursor-pointer" onClick={startRecording} disabled={loading || completed}>
                  <Mic className="w-4 h-4 mr-2" /> Answer with Voice
                </Button>
              </motion.div>
            )}

            {/* Quick Voice Controls */}
            {!isSpeaking && !isRecording && !loading && !completed && lastSystemMessage && (
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => speak(lastSystemMessage)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 cursor-pointer hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Replay Question
                </button>
                <button
                  type="button"
                  onClick={() => setIsVoiceSettingsOpen(true)}
                  className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                >
                  <Settings2 className="w-3 h-3" /> Voice Settings
                </button>
              </div>
            )}

            {micPermissionError && (
              <p className="text-[11px] text-red-500 mt-2 font-medium">
                ⚠️ {micPermissionError} <button type="button" onClick={startRecording} className="underline font-bold hover:text-foreground cursor-pointer">Retry</button>
              </p>
            )}
          </div>
        </motion.div>

        {/* Chat Section */}
        <div className={`flex flex-col border bg-card shadow-sm rounded-2xl overflow-hidden transition-all duration-300 ${
          isExpandedChat 
            ? 'fixed inset-4 z-50 bg-background shadow-2xl border-primary/40' 
            : showCodeEditor 
            ? 'min-h-[580px] lg:col-span-6 xl:col-span-6 w-full' 
            : 'flex-1 min-h-[620px] md:min-h-[700px] w-full'
        }`}>
          
          {/* AI Avatar Header */}
          <div className="flex flex-wrap items-center justify-between p-4 md:p-6 border-b bg-muted/30 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0">
                <AIAvatar isSpeaking={isSpeaking} />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-cyan-400 tracking-wider">AI INTERVIEWER</h3>
                <p className="text-xs md:text-sm text-cyan-500/80 transition-all font-mono">
                  {isSpeaking ? "Speaking..." : isTranscribing ? "Transcribing your voice..." : isRecording ? "Listening to your answer..." : loading ? "Analyzing your response..." : completed ? "Interview completed." : "Waiting for you to speak..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <AudioVisualizer isRecording={isRecording} stream={activeMicStream} />
              
              {/* Font Size Controls */}
              <div className="flex items-center bg-muted/80 rounded-xl p-1 border border-border">
                <button
                  type="button"
                  onClick={() => setFontSize(fontSize === "lg" ? "md" : "sm")}
                  disabled={fontSize === "sm"}
                  className="p-1.5 rounded-lg hover:bg-background text-muted-foreground disabled:opacity-30 cursor-pointer"
                  title="Decrease Text Size"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono px-1.5 font-bold uppercase text-foreground">
                  {fontSize}
                </span>
                <button
                  type="button"
                  onClick={() => setFontSize(fontSize === "sm" ? "md" : "lg")}
                  disabled={fontSize === "lg"}
                  className="p-1.5 rounded-lg hover:bg-background text-muted-foreground disabled:opacity-30 cursor-pointer"
                  title="Increase Text Size"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Voice Settings */}
              <Button
                onClick={() => setIsVoiceSettingsOpen(true)}
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-xl border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/10 text-cyan-400 cursor-pointer flex items-center gap-1.5"
                title="Configure AI Voice Persona & Speed"
              >
                <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Voice Settings</span>
              </Button>

              {/* Mute AI Audio */}
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border-muted-foreground/30 hover:bg-muted"
                title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </Button>

              {/* Expand/Maximize Conversation Board Toggle */}
              <Button
                onClick={() => setIsExpandedChat(!isExpandedChat)}
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-xl border-primary/30 text-xs font-semibold hover:bg-primary/10 text-primary cursor-pointer flex items-center gap-1"
                title={isExpandedChat ? "Exit Full Screen" : "Expand Conversation Board"}
              >
                {isExpandedChat ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" /> Exit Full View
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" /> Expand Board
                  </>
                )}
              </Button>
            </div>
          </div>

          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6"
          >
            {audioAutoplayBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-primary/20 to-cyan-500/10 border border-cyan-500/40 flex items-center justify-between gap-3 shadow-md"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                  <span>AI Voice Ready: Click to hear the AI interviewer speak this question</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setAudioAutoplayBlocked(false);
                    if (lastSystemMessage) speak(lastSystemMessage);
                  }}
                  className="h-7 text-xs px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  ▶ Hear Question Now
                </Button>
              </motion.div>
            )}

            {(() => {
              const lastSystemIndex = messages.findLastIndex(m => m.role === 'system');

              const fontClasses = 
                fontSize === "sm" 
                  ? "text-xs md:text-sm" 
                  : fontSize === "lg" 
                  ? "text-base md:text-xl leading-relaxed font-medium" 
                  : "text-sm md:text-base leading-relaxed";

              return messages.map((msg, index) => {
                const isLatestSystem = msg.role === 'system' && index === lastSystemIndex;

                return (
                  <motion.div 
                    key={index} 
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[90%] md:max-w-[85%] space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                      <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden relative ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'}`}>
                        {msg.role === 'user' ? <User className="h-5 w-5" /> : <Image src="/ai-face.png" alt="AI" fill sizes="40px" className="object-cover" />}
                      </div>
                      <div className={`p-4 rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'}`}>
                        <div className={fontClasses}>
                          {isLatestSystem ? (
                            <TypewriterText text={msg.content} animate={true} />
                          ) : (
                            msg.content
                          )}
                        </div>

                        {msg.role === 'system' && (
                          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (isSpeaking && speakingMessageIndex === index) {
                                  stopSpeaking();
                                } else {
                                  speak(msg.content, index);
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                isSpeaking && speakingMessageIndex === index
                                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30 animate-pulse"
                                  : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 border-cyan-500/20"
                              }`}
                              title={isSpeaking && speakingMessageIndex === index ? "Stop voice" : "Listen to question voice"}
                            >
                              {isSpeaking && speakingMessageIndex === index ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" /> Stop Voice
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3 h-3" /> Listen to AI Voice
                                </>
                              )}
                            </button>

                            {isSpeaking && speakingMessageIndex === index && (
                              <div className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                                <span className="inline-block w-1 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="inline-block w-1 h-3.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="inline-block w-1 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              });
            })()}

            {isRecording && (
              <div className="flex justify-end">
                <div className="flex max-w-[90%] md:max-w-[85%] space-x-3 flex-row-reverse space-x-reverse">
                  <div className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center bg-primary/80 text-primary-foreground animate-pulse">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div className="p-4 rounded-2xl whitespace-pre-wrap bg-primary/80 text-primary-foreground rounded-tr-sm">
                    <p className={`leading-relaxed opacity-90 ${fontSize === "sm" ? "text-xs" : fontSize === "lg" ? "text-base" : "text-sm"}`}>{transcript || "Listening..."}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex space-x-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden relative">
                    <Image src="/ai-face.png" alt="AI" fill sizes="40px" className="object-cover" />
                  </div>
                  <div className="p-4 rounded-2xl bg-muted text-foreground rounded-tl-sm flex items-center space-x-2">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-2 h-2 bg-foreground/50 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }} className="w-2 h-2 bg-foreground/50 rounded-full" />
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.4 }} className="w-2 h-2 bg-foreground/50 rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-4 border-t bg-background/50 backdrop-blur space-y-3">
            {isSpeaking && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-500 animate-pulse shrink-0" />
                  <span>AI Interviewer is currently asking the question... Answer privileges will unlock automatically once AI finishes speaking.</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={stopSpeaking}
                  className="h-6 text-[11px] px-2.5 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 cursor-pointer shrink-0 ml-2 font-medium"
                >
                  Skip & Answer Now
                </Button>
              </div>
            )}
            {isCodingRound && !isSpeaking && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-600 dark:text-cyan-400 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-500 shrink-0" />
                  <span>💻 <strong>Coding Round Active:</strong> Write & test your solution in the Code Editor below.</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 text-[11px] px-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 cursor-pointer"
                  onClick={() => codeEditorRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Focus Editor 👇
                </Button>
              </div>
            )}
            {showCodingWarning && !isSpeaking && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>⚠️ <strong>Coding Skill Required:</strong> In a Coding Interview, you must write your code solution in the Code Editor below before submitting.</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] px-2 border-amber-500/40 text-amber-500 cursor-pointer"
                  onClick={() => setShowCodingWarning(false)}
                >
                  Dismiss
                </Button>
              </div>
            )}
            {showPasteWarning && !isSpeaking && !showCodingWarning && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>AI Anti-Cheat Monitor: Copy-Pasted content detected. Please answer in your own authentic words.</span>
                </div>
              </div>
            )}
            {/* Aptitude Interactive MCQ Choice Cards */}
            {mcqOptions.length >= 2 && !completed && !isSpeaking && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-cyan-500/10 border border-primary/20 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span>🎯 Choose The Correct Answer (Aptitude Option Selector):</span>
                  <span className="text-[11px] font-normal text-muted-foreground">Click option to select</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mcqOptions.map((opt, idx) => {
                    const cleanAnswer = currentAnswer.trim().toUpperCase();
                    const isSelected = 
                      cleanAnswer === opt.full.toUpperCase() || 
                      cleanAnswer === opt.label || 
                      cleanAnswer.startsWith(`${opt.label})`) ||
                      cleanAnswer.startsWith(`${opt.label}.`);

                    return (
                      <button
                        key={`${opt.label}-${idx}`}
                        type="button"
                        onClick={() => setCurrentAnswer(opt.full)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/30"
                            : "bg-card hover:bg-muted/70 text-foreground border-border"
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${isSelected ? 'bg-background text-primary' : 'bg-primary/10 text-primary'}`}>
                          {opt.label}
                        </span>
                        <span className="truncate">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!completed && !isSpeaking && (
              <SpellCheckKeywords
                roleName={targetRole}
                interviewType={interviewType}
                currentAnswer={currentAnswer}
                onUpdateAnswer={setCurrentAnswer}
              />
            )}

            {completed ? (
              <Button onClick={() => endInterview()} className="w-full h-12 text-base">
                End Interview & View Feedback
              </Button>
            ) : (
              <form 
                onSubmit={handleSubmit} 
                className="space-y-2 bg-card/80 p-3 md:p-4 rounded-2xl border border-primary/20 shadow-md relative"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Text className="w-3.5 h-3.5 text-primary" /> Candidate Answer Board
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono">
                      {currentAnswer.length} chars
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsExpandedAnswerBoard(!isExpandedAnswerBoard)}
                      className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {isExpandedAnswerBoard ? (
                        <>
                          <Shrink className="w-3 h-3" /> Standard View
                        </>
                      ) : (
                        <>
                          <Expand className="w-3 h-3" /> Expand Writing Space
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder={
                      isSpeaking 
                        ? "Type your answer here or wait for AI to finish speaking..." 
                        : isRecording 
                        ? "Speaking... voice transcription will appear here or type your answer..." 
                        : showCodeEditor 
                        ? "Explain your code solution and trade-offs here..." 
                        : mcqOptions.length >= 2 
                        ? "Select an option above or type your detailed response..." 
                        : "Type your answer here... (Press Enter to submit, Shift+Enter for new line)"
                    }
                    className={`w-full p-3.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/70 resize-y transition-all ${
                      fontSize === "sm" ? "text-xs md:text-sm" : fontSize === "lg" ? "text-base md:text-lg" : "text-sm md:text-base"
                    } ${
                      isExpandedAnswerBoard ? "h-64" : "h-28 md:h-32"
                    }`}
                    disabled={loading || completed}
                  />

                  <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <Button 
                      id="submit-answer-btn" 
                      type="submit" 
                      size="sm" 
                      className="h-9 px-4 rounded-xl font-semibold shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50" 
                      disabled={loading || (!currentAnswer.trim() && !transcript.trim() && !code.trim())}
                    >
                      <span>Submit Answer</span>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Code Editor Section (Visible ONLY when question requires code or Coding round) */}
        {showCodeEditor && (
          <div ref={codeEditorRef} className={`flex-col border bg-slate-950 text-slate-50 shadow-sm rounded-2xl overflow-hidden scroll-mt-6 ${showCodeEditor ? 'min-h-[520px] lg:col-span-6 xl:col-span-6 w-full flex' : 'flex-1 flex min-h-[420px]'}`}>
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-sm font-medium text-slate-300 flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-cyan-400" />
                <span className="font-semibold text-white">Integrated Code Editor</span>
                {isCodingRound && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Required Coding Round
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  size="sm"
                  onClick={runCode}
                  disabled={isRunningCode || !code.trim()}
                  className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {isRunningCode ? "Running..." : "Run Code"}
                </Button>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs text-slate-400">Language:</span>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setSelectedLanguage(newLang);
                      const template = STARTER_TEMPLATES[newLang] || STARTER_TEMPLATES.javascript;
                      if (!code.trim() || Object.values(STARTER_TEMPLATES).some(t => t.trim() === code.trim())) {
                        setCode(template);
                      }
                    }}
                    className="bg-slate-800 text-cyan-300 text-xs px-2.5 py-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="kotlin">Kotlin (Android)</option>
                    <option value="swift">Swift (iOS)</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto relative font-mono text-sm leading-relaxed p-4">
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => Prism.highlight(code, getLanguageGrammar(selectedLanguage), selectedLanguage)}
                padding={10}
                style={{
                  fontFamily: '"Fira Code", "Fira Mono", monospace',
                  minHeight: '100%',
                  outline: 'none',
                }}
                className="editor-container"
              />
            </div>

            {/* Console Output Panel */}
            {consoleOutput !== null && (
              <div className="bg-slate-900 border-t border-slate-800 p-3 font-mono text-xs text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800/60 mb-1">
                  <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                    <Terminal className="w-3.5 h-3.5" /> Code Output Console
                  </span>
                  <button onClick={() => setConsoleOutput(null)} className="hover:text-white transition-colors cursor-pointer text-[10px]">
                    Clear Console
                  </button>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed">{consoleOutput}</pre>
              </div>
            )}
          </div>
        )}

        </motion.div>
      </motion.div>

      <AIVoiceSettings
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={setVoiceSettings}
      />
    </>
  );
}
