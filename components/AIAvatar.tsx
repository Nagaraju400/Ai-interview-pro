"use client";

import React from "react";
import { motion } from "framer-motion";

export const AIAvatar = ({ isSpeaking, className }: { isSpeaking: boolean; className?: string }) => {
  return (
    <div className={`relative w-24 h-24 mx-auto flex items-center justify-center ${className || ''}`}>
      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md"
        animate={{
          scale: isSpeaking ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isSpeaking ? [0.5, 0.8, 0.5] : [0.3, 0.5, 0.3],
        }}
        transition={{ duration: isSpeaking ? 0.8 : 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* JARVIS SVG Core */}
      <motion.svg
        width="90"
        height="90"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Outer Ring Dashed */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          stroke="#06b6d4"
          strokeWidth="2"
          strokeDasharray="4 8"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: isSpeaking ? 4 : 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Inner Ring Solid */}
        <motion.circle
          cx="100"
          cy="100"
          r="75"
          stroke="#0891b2"
          strokeWidth="4"
          strokeDasharray="40 10 20 10"
          fill="none"
          animate={{ rotate: -360 }}
          transition={{ duration: isSpeaking ? 3 : 15, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Middle Ring Dashed Thick */}
        <motion.circle
          cx="100"
          cy="100"
          r="55"
          stroke="#22d3ee"
          strokeWidth="6"
          strokeDasharray="15 5"
          fill="none"
          animate={{ rotate: 360, scale: isSpeaking ? [1, 1.05, 1] : 1 }}
          transition={{ 
            rotate: { duration: isSpeaking ? 2 : 10, repeat: Infinity, ease: "linear" }, 
            scale: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } 
          }}
          style={{ transformOrigin: 'center' }}
        />
        
        {/* Core Solid Glow */}
        <motion.circle
          cx="100"
          cy="100"
          r="35"
          className="fill-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
          animate={{ scale: isSpeaking ? [1, 1.2, 0.9, 1.1, 1] : [1, 1.02, 1] }}
          transition={{ duration: isSpeaking ? 0.6 : 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Core Inner Dot */}
        <circle
          cx="100"
          cy="100"
          r="15"
          className="fill-cyan-100"
        />
      </motion.svg>
    </div>
  );
};
