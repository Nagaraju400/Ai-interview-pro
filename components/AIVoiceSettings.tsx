"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Sparkles, Check, Play, Square, Settings2, User, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  VoiceSettings,
  VoicePersona,
  saveVoiceSettings,
  testAIVoicePreview,
  stopAIVoice,
} from "@/lib/ai-voice";

interface AIVoiceSettingsProps {
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function AIVoiceSettings({
  settings,
  onUpdateSettings,
  isOpen,
  onClose,
}: AIVoiceSettingsProps) {
  const [testing, setTesting] = useState(false);

  const handlePersonaChange = (persona: VoicePersona) => {
    const updated: VoiceSettings = { ...settings, persona };
    onUpdateSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleRateChange = (rate: number) => {
    const updated: VoiceSettings = { ...settings, rate };
    onUpdateSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleToggleAutoSpeak = () => {
    const updated: VoiceSettings = { ...settings, autoSpeak: !settings.autoSpeak };
    onUpdateSettings(updated);
    saveVoiceSettings(updated);
  };

  const handleTestVoice = async () => {
    if (testing) {
      stopAIVoice();
      setTesting(false);
      return;
    }

    setTesting(true);
    await testAIVoicePreview(
      settings,
      () => setTesting(true),
      () => setTesting(false)
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-card border border-border shadow-2xl rounded-3xl max-w-md w-full p-6 space-y-5 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  AI Interviewer Voice
                </h3>
                <p className="text-xs text-muted-foreground">Customize voice persona, speed & audio behavior</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-muted cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Voice Persona Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Interviewer Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePersonaChange("male")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  settings.persona === "male"
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-sm ring-1 ring-cyan-500/30"
                    : "bg-muted/40 border-border hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <User className="w-4 h-4 text-cyan-400" />
                  {settings.persona === "male" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Male Voice</div>
                  <div className="text-[10px] text-muted-foreground">Professional & Deep</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaChange("female")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  settings.persona === "female"
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-sm ring-1 ring-cyan-500/30"
                    : "bg-muted/40 border-border hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <User className="w-4 h-4 text-pink-400" />
                  {settings.persona === "female" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Female Voice</div>
                  <div className="text-[10px] text-muted-foreground">Clear & Articulate</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaChange("natural")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  settings.persona === "natural"
                    ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-sm ring-1 ring-cyan-500/30"
                    : "bg-muted/40 border-border hover:bg-muted text-foreground"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Bot className="w-4 h-4 text-purple-400" />
                  {settings.persona === "natural" && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <div>
                  <div className="font-bold text-xs">Neural AI</div>
                  <div className="text-[10px] text-muted-foreground">System Natural</div>
                </div>
              </button>
            </div>
          </div>

          {/* Speech Rate Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Speech Speed
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">{settings.rate}x</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "0.85x", val: 0.85, sub: "Deliberate" },
                { label: "1.0x", val: 1.0, sub: "Normal" },
                { label: "1.15x", val: 1.15, sub: "Brisk" },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleRateChange(item.val)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    settings.rate === item.val
                      ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                      : "bg-muted/30 border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[10px] text-muted-foreground">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Speak Toggle */}
          <div className="p-3.5 rounded-2xl bg-muted/40 border flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Auto-Read Questions Aloud
              </div>
              <p className="text-[11px] text-muted-foreground">
                AI speaks every new interview question as soon as it appears
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleAutoSpeak}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.autoSpeak ? "bg-cyan-500" : "bg-muted-foreground/30"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.autoSpeak ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Test Voice Button */}
          <div className="pt-1 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestVoice}
              className={`flex-1 h-10 rounded-xl cursor-pointer text-xs font-semibold border ${
                testing
                  ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20"
              }`}
            >
              {testing ? (
                <>
                  <Square className="w-3.5 h-3.5 mr-1.5 fill-current" /> Stop Voice Test
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Test Voice Sample
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={onClose}
              className="px-6 h-10 rounded-xl cursor-pointer text-xs font-semibold"
            >
              Apply Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
