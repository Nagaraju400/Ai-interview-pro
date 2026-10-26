"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Camera, ShieldAlert, Volume2, Users, Sparkles, X, Mic, MicOff, Play, Square } from "lucide-react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { speakAIText, stopAIVoice } from "@/lib/ai-voice";

interface EnvironmentCheckModalProps {
  isOpen: boolean;
  onConfirm: (photo?: string) => void;
  roleName: string;
  companyName?: string | null;
  initialPhoto?: string | null;
}

export function EnvironmentCheckModal({ isOpen, onConfirm, roleName, companyName, initialPhoto }: EnvironmentCheckModalProps) {
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(() => {
    if (initialPhoto) return initialPhoto;
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("candidate_reference_photo");
    }
    return null;
  });

  const [checkedItems, setCheckedItems] = useState({
    quietSpace: false,
    cleanBackground: false,
    singlePerson: false,
    hardwareWorking: false,
  });

  // Interactive Live Microphone Testing State
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [micTestedOk, setMicTestedOk] = useState<boolean>(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Interactive AI Speaker Testing State
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [speakerTestedOk, setSpeakerTestedOk] = useState(false);

  const testSpeakerLive = async () => {
    if (isTestingSpeaker) {
      stopAIVoice();
      setIsTestingSpeaker(false);
      return;
    }
    setIsTestingSpeaker(true);
    await speakAIText({
      text: "Speaker check passed. Your AI interviewer voice is configured and ready.",
      onStart: () => setIsTestingSpeaker(true),
      onEnd: () => {
        setIsTestingSpeaker(false);
        setSpeakerTestedOk(true);
        setCheckedItems((prev) => ({ ...prev, hardwareWorking: true }));
      },
      onError: () => setIsTestingSpeaker(false),
    });
  };

  const webcamRef = useRef<Webcam>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const testMicrophoneLive = async () => {
    setIsTestingMic(true);
    setMicError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setMicVolume(normalized);

        if (normalized > 5) {
          setMicTestedOk(true);
          setCheckedItems((prev) => ({ ...prev, hardwareWorking: true }));
        }

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err: any) {
      console.warn("Microphone test error:", err);
      setMicError(err?.message?.includes("Permission") ? "Microphone permission denied" : "Could not access microphone hardware");
      setIsTestingMic(false);
    }
  };

  const stopMicTest = () => {
    setIsTestingMic(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopMicTest();
      stopAIVoice();
    };
  }, []);

  const allChecked =
    checkedItems.quietSpace &&
    checkedItems.cleanBackground &&
    checkedItems.singlePerson &&
    checkedItems.hardwareWorking;

  const toggleCheck = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectAll = () => {
    setCheckedItems({
      quietSpace: true,
      cleanBackground: true,
      singlePerson: true,
      hardwareWorking: true,
    });
  };

  const captureCandidatePhoto = () => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        setCapturedPhoto(screenshot);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("candidate_reference_photo", screenshot);
        }
        setCheckedItems(prev => ({
          ...prev,
          singlePerson: true,
          hardwareWorking: true,
        }));
      }
    }
  };

  const handleConfirm = () => {
    let photo = capturedPhoto;
    if (!photo && webcamRef.current) {
      photo = webcamRef.current.getScreenshot() || null;
      if (photo && typeof window !== "undefined") {
        sessionStorage.setItem("candidate_reference_photo", photo);
      }
    }
    onConfirm(photo || undefined);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border shadow-2xl rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 relative overflow-hidden"
        >
          {/* Top Decorative Banner */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Pre-Interview Environment Check
                </h2>
                <p className="text-xs text-muted-foreground">
                  Target Role: <span className="font-semibold text-foreground">{roleName}</span>
                  {companyName && (
                    <> &bull; Target Company: <span className="font-semibold text-primary">{companyName}</span></>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Mandated Protocol
              </span>
              <button
                onClick={handleConfirm}
                className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Preview & Guidelines */}
          <div className="grid md:grid-cols-2 gap-6 items-center">
            {/* Live Camera Preview */}
            <div className="space-y-2">
              <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video relative border-2 border-primary/20 shadow-md">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl text-xs text-white flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Camera className="w-3.5 h-3.5 text-green-400" /> Live Feed Check
                  </span>
                  <span className="text-[10px] text-gray-300">Clean Background Check</span>
                </div>
              </div>

              {/* Photo Registration Card */}
              <div className="pt-1">
                {capturedPhoto ? (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-foreground">
                    <img
                      src={capturedPhoto}
                      alt="Candidate ID"
                      className="w-10 h-10 rounded-lg object-cover border border-emerald-500/40 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> ID Photo Registered
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Used for live anti-impersonation tracking
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={captureCandidatePhoto}
                      className="h-7 text-[10px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Retake
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={captureCandidatePhoto}
                    className="w-full h-9 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    Register Candidate Identity Photo
                  </Button>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground text-center">
                Face the camera directly. Your photo registers your identity for the interview session.
              </p>
            </div>

            {/* Interactive Checklist */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Readiness Checklist (Confirm All 4):
              </p>

              {/* Item 1 */}
              <button
                type="button"
                onClick={() => toggleCheck("quietSpace")}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  checkedItems.quietSpace
                    ? "bg-green-500/10 border-green-500/30 text-foreground"
                    : "bg-muted/30 border-border hover:bg-muted/60"
                }`}
              >
                <div className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                  checkedItems.quietSpace ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/40"
                }`}>
                  {checkedItems.quietSpace && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-primary" /> Quiet Environment
                  </h4>
                  <p className="text-[11px] text-muted-foreground">No TV, music, or background noise to disturb AI audio analysis.</p>
                </div>
              </button>

              {/* Item 2 */}
              <button
                type="button"
                onClick={() => toggleCheck("cleanBackground")}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  checkedItems.cleanBackground
                    ? "bg-green-500/10 border-green-500/30 text-foreground"
                    : "bg-muted/30 border-border hover:bg-muted/60"
                }`}
              >
                <div className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                  checkedItems.cleanBackground ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/40"
                }`}>
                  {checkedItems.cleanBackground && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-primary" /> Clean Background
                  </h4>
                  <p className="text-[11px] text-muted-foreground">Well-lit, clutter-free workspace facing the camera directly.</p>
                </div>
              </button>

              {/* Item 3 */}
              <button
                type="button"
                onClick={() => toggleCheck("singlePerson")}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  checkedItems.singlePerson
                    ? "bg-green-500/10 border-green-500/30 text-foreground"
                    : "bg-muted/30 border-border hover:bg-muted/60"
                }`}
              >
                <div className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                  checkedItems.singlePerson ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/40"
                }`}>
                  {checkedItems.singlePerson && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-semibold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" /> Single Candidate
                  </h4>
                  <p className="text-[11px] text-muted-foreground">You are alone; no secondary faces or external interruptions.</p>
                </div>
              </button>

              {/* Item 4 - Hardware & Interactive Mic Test */}
              <div
                className={`w-full p-3 rounded-xl border transition-all space-y-2 ${
                  checkedItems.hardwareWorking
                    ? "bg-green-500/10 border-green-500/30 text-foreground"
                    : "bg-muted/30 border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div 
                    onClick={() => toggleCheck("hardwareWorking")}
                    className="flex items-start gap-3 cursor-pointer flex-1"
                  >
                    <div className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                      checkedItems.hardwareWorking ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground/40"
                    }`}>
                      {checkedItems.hardwareWorking && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold flex items-center gap-1.5">
                        <Mic className="w-3.5 h-3.5 text-primary" /> Audio & Camera Tested
                      </h4>
                      <p className="text-[11px] text-muted-foreground">Webcam and microphone permissions granted.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Interactive AI Speaker Test Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={testSpeakerLive}
                      className={`h-7 text-[11px] px-2.5 border cursor-pointer ${
                        isTestingSpeaker
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                          : speakerTestedOk
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30"
                      }`}
                    >
                      {isTestingSpeaker ? (
                        <>
                          <Square className="w-3 h-3 mr-1 fill-current" /> Stop Voice
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 mr-1" /> {speakerTestedOk ? "✓ Voice Verified" : "Test AI Voice"}
                        </>
                      )}
                    </Button>

                    {/* Interactive Live Mic Test Button */}
                    {isTestingMic ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={stopMicTest}
                        className="h-7 text-[11px] px-2.5 bg-red-500/10 text-red-500 border-red-500/30 cursor-pointer"
                      >
                        <MicOff className="w-3 h-3 mr-1" /> Stop Mic
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={testMicrophoneLive}
                        className={`h-7 text-[11px] px-2.5 border cursor-pointer ${
                          micTestedOk
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30"
                        }`}
                      >
                        <Mic className="w-3 h-3 mr-1" /> {micTestedOk ? "✓ Mic Verified" : "Test Mic Live"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Live Mic Volume Level Meter Bar */}
                {isTestingMic && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span>Speak into mic to test volume:</span>
                      <span className={micTestedOk ? "text-emerald-500 font-bold" : "text-cyan-400 font-bold"}>
                        {micTestedOk ? "✓ Audio Detected!" : `${micVolume}%`}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-green-500 transition-all duration-75"
                        style={{ width: `${Math.max(5, micVolume)}%` }}
                      />
                    </div>
                  </div>
                )}

                {micError && (
                  <p className="text-[11px] text-red-500 font-medium pt-1 flex items-center gap-1">
                    ⚠️ {micError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs text-muted-foreground hover:text-foreground">
              Select All Rules
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!allChecked}
              className="w-full sm:w-auto px-8 h-11 text-sm font-semibold rounded-full shadow-lg shadow-primary/20 cursor-pointer"
            >
              {allChecked ? "Environment Confirmed — Begin Interview" : "Please Confirm All 4 Guidelines"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

