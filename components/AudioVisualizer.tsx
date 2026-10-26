"use client";

import { useEffect, useState, useRef } from "react";

interface AudioVisualizerProps {
  isRecording: boolean;
  stream?: MediaStream | null;
}

export function AudioVisualizer({ isRecording, stream: customStream }: AudioVisualizerProps) {
  const [levels, setLevels] = useState<number[]>([15, 15, 15, 15, 15]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const ownStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isRecording) {
      setLevels([15, 15, 15, 15, 15]);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      if (ownStreamRef.current) {
        ownStreamRef.current.getTracks().forEach((t) => t.stop());
        ownStreamRef.current = null;
      }
      return;
    }

    let activeStream: MediaStream | null = customStream || null;

    const setupAudio = async () => {
      try {
        if (!activeStream) {
          // If no custom stream provided, show active animation without opening competing hardware mic streams
          return;
        }

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        if (ctx.state === "suspended") {
          await ctx.resume().catch(() => {});
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 32;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(activeStream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!analyserRef.current) return;

          // Resume audio context if suspended by browser autoplay policy
          if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume().catch(() => {});
          }

          analyserRef.current.getByteFrequencyData(dataArray);

          // Get average levels across 5 frequency bands
          const bandSize = Math.max(1, Math.floor(dataArray.length / 5));
          const newLevels = Array.from({ length: 5 }, (_, i) => {
            let sum = 0;
            for (let j = 0; j < bandSize; j++) {
              sum += dataArray[i * bandSize + j] || 0;
            }
            const avg = sum / bandSize;
            return Math.min(100, Math.max(15, Math.round((avg / 255) * 100)));
          });

          setLevels(newLevels);
          animFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      } catch (err) {
        console.warn("AudioVisualizer mic setup note:", err);
      }
    };

    setupAudio();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      if (ownStreamRef.current) {
        ownStreamRef.current.getTracks().forEach((t) => t.stop());
        ownStreamRef.current = null;
      }
    };
  }, [isRecording, customStream]);

  return (
    <div className="flex items-center gap-1.5 h-6 px-3 py-1 bg-muted/40 rounded-full border border-muted/60" title={isRecording ? "Microphone active & monitoring audio levels" : "Microphone idle"}>
      <span className={`text-[10px] uppercase tracking-wider font-mono mr-1 font-bold ${isRecording ? "text-cyan-400" : "text-muted-foreground"}`}>
        MIC
      </span>
      {levels.map((lvl, idx) => (
        <div
          key={idx}
          className={`w-1 rounded-full transition-all duration-75 ${isRecording ? "bg-cyan-400 shadow-xs" : "bg-muted-foreground/30"}`}
          style={{ height: `${lvl}%` }}
        />
      ))}
    </div>
  );
}

