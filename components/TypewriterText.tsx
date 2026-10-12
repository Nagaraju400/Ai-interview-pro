"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // delay per tick in ms
  animate?: boolean;
  onComplete?: () => void;
  className?: string;
}

export function TypewriterText({
  text,
  speed = 16,
  animate = true,
  onComplete,
  className = "",
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState(animate ? "" : text);
  const [isTyping, setIsTyping] = useState(animate);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!animate || !text) {
      setDisplayedText(text || "");
      setIsTyping(false);
      return;
    }

    setDisplayedText("");
    setIsTyping(true);
    indexRef.current = 0;

    // Calculate dynamic step size for continuous streaming feel
    const stepSize = text.length > 250 ? 3 : text.length > 100 ? 2 : 1;

    const interval = setInterval(() => {
      indexRef.current += stepSize;
      if (indexRef.current <= text.length) {
        setDisplayedText(text.slice(0, indexRef.current));
      } else {
        setDisplayedText(text);
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, animate, speed, onComplete]);

  return (
    <span className={className}>
      {displayedText}
      {isTyping && (
        <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse rounded-xs align-middle" />
      )}
    </span>
  );
}
