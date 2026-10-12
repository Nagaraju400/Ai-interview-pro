"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";

interface ResumeScannerAnimationProps {
  fileName?: string;
}

export function ResumeScannerAnimation({ fileName }: ResumeScannerAnimationProps) {
  const [stage, setStage] = useState(0);

  const stages = [
    "Reading PDF content...",
    "Extracting skills & experience...",
    "Analyzing context for Terminator...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card border rounded-2xl shadow-sm text-center min-h-[320px] relative overflow-hidden">
      {/* Simple Document Icon with Scanning Line */}
      <div className="relative mb-6">
        <div className="w-20 h-24 bg-muted border rounded-xl flex items-center justify-center relative overflow-hidden shadow-inner">
          <FileText className="w-10 h-10 text-primary/60" />
          
          {/* Subtle Scanning Beam */}
          <motion.div
            animate={{ top: ["-10%", "110%", "-10%"] }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }}
            className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]"
          />
        </div>
      </div>

      {/* File Name & Status */}
      <div className="space-y-2 max-w-xs w-full">
        <p className="text-sm font-semibold truncate text-foreground">
          {fileName || "Resume.pdf"}
        </p>

        <div className="h-6 flex items-center justify-center text-xs text-muted-foreground font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-2 text-primary" />
          <AnimatePresence mode="wait">
            <motion.span
              key={stage}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
            >
              {stages[stage]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Minimal Progress Bar */}
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-3">
          <motion.div
            animate={{ width: ["10%", "50%", "85%", "98%"] }}
            transition={{ duration: 5, ease: "easeInOut" }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
