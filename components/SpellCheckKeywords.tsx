"use client";

import { useState, useMemo } from "react";
import { Sparkles, CheckCircle2, Wand2, SpellCheck, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SpellCheckKeywordsProps {
  roleName: string;
  interviewType: string;
  currentAnswer: string;
  onUpdateAnswer: (newText: string) => void;
}

// Role-Specific Technical & Behavioral Keywords Dictionary
const ROLE_KEYWORDS: Record<string, string[]> = {
  java: [
    "Spring Boot",
    "Microservices",
    "JVM Memory",
    "Multithreading",
    "Hibernate JPA",
    "REST API",
    "Kafka",
    "Docker",
    "React",
    "SQL Indexing",
  ],
  python: [
    "FastAPI",
    "Django",
    "Pandas",
    "NumPy",
    "PyTorch",
    "Docker",
    "PostgreSQL",
    "Asyncio",
    "REST API",
    "CI/CD",
  ],
  frontend: [
    "React Hooks",
    "TypeScript",
    "Virtual DOM",
    "State Management",
    "Next.js",
    "CSS Grid",
    "Performance Optimization",
    "REST API",
  ],
  backend: [
    "Async/Await",
    "Database Indexing",
    "Redis Caching",
    "Concurrency",
    "Microservices",
    "Unit Testing",
    "REST API",
    "Docker",
  ],
  system: [
    "Load Balancer",
    "Redis Caching",
    "Database Sharding",
    "Horizontal Scaling",
    "Message Queue (Kafka)",
    "API Gateway",
    "Fault Tolerance",
  ],
  hr: [
    "STAR Method",
    "Situation & Task",
    "Action Taken",
    "Measurable Result",
    "Conflict Resolution",
    "Leadership",
    "Teamwork",
    "Prioritization",
  ],
  product: [
    "User Discovery",
    "Metrics & KPIs",
    "Prioritization",
    "A/B Testing",
    "User Churn",
    "Product Vision",
    "Feature Trade-offs",
  ],
  aptitude: [
    "Percentage",
    "Probability",
    "Ratio & Proportion",
    "Time & Distance",
    "Logical Reasoning",
    "Structured Estimation",
  ],
  default: [
    "STAR Method",
    "Problem Solving",
    "Core Concepts",
    "Practical Trade-offs",
    "System Scalability",
    "Code Quality",
    "Edge Cases",
  ],
};

// Common Tech & General Misspellings Dictionary for Instant Correction
const TECH_SPELL_CORRECTIONS: Record<string, string> = {
  springboot: "Spring Boot",
  springbot: "Spring Boot",
  springbto: "Spring Boot",
  microsrvice: "Microservices",
  microservic: "Microservices",
  microserviceses: "Microservices",
  multithread: "Multithreading",
  multithreding: "Multithreading",
  multithreadingg: "Multithreading",
  hibernat: "Hibernate",
  hibenate: "Hibernate",
  reactjs: "React",
  recat: "React",
  typescriptt: "TypeScript",
  typescrip: "TypeScript",
  postgress: "PostgreSQL",
  postgre: "PostgreSQL",
  dockr: "Docker",
  kubernets: "Kubernetes",
  k8s: "Kubernetes",
  redus: "Redis",
  rediz: "Redis",
  starmethod: "STAR Method",
  concurrensy: "Concurrency",
  apigateway: "API Gateway",
  lodbouncer: "Load Balancer",
  fastapi: "FastAPI",
};

export function SpellCheckKeywords({
  roleName,
  interviewType,
  currentAnswer,
  onUpdateAnswer,
}: SpellCheckKeywordsProps) {
  // Determine relevant keyword list based on role and interview type
  const targetKeywords = useMemo(() => {
    const combinedStr = `${roleName} ${interviewType}`.toLowerCase();

    if (combinedStr.includes("java")) return ROLE_KEYWORDS.java;
    if (combinedStr.includes("python") || combinedStr.includes("data scientist") || combinedStr.includes("machine learning")) return ROLE_KEYWORDS.python;
    if (combinedStr.includes("frontend") || combinedStr.includes("react") || combinedStr.includes("ui")) return ROLE_KEYWORDS.frontend;
    if (combinedStr.includes("backend") || combinedStr.includes("node") || combinedStr.includes("go")) return ROLE_KEYWORDS.backend;
    if (combinedStr.includes("system") || combinedStr.includes("architect") || combinedStr.includes("cloud") || combinedStr.includes("devops")) return ROLE_KEYWORDS.system;
    if (combinedStr.includes("hr") || combinedStr.includes("behavioral")) return ROLE_KEYWORDS.hr;
    if (combinedStr.includes("product") || combinedStr.includes("pm")) return ROLE_KEYWORDS.product;
    if (combinedStr.includes("aptitude")) return ROLE_KEYWORDS.aptitude;

    return ROLE_KEYWORDS.default;
  }, [roleName, interviewType]);

  // Check which keywords are mentioned in the active typed answer
  const keywordStatus = useMemo(() => {
    const textLower = currentAnswer.toLowerCase();
    return targetKeywords.map((kw) => {
      // Check full string or key terms (e.g. "Spring Boot" -> matches "spring boot" or "springboot")
      const kwLower = kw.toLowerCase();
      const isUsed = textLower.includes(kwLower) || textLower.includes(kwLower.replace(/\s+/g, ""));
      return { keyword: kw, isUsed };
    });
  }, [targetKeywords, currentAnswer]);

  // Detect potential tech typos in current answer
  const detectedTypos = useMemo(() => {
    if (!currentAnswer.trim()) return [];
    const words = currentAnswer.toLowerCase().split(/[\s,.\(\)\[\]"';:?!]+/);
    const typos: { wrong: string; right: string }[] = [];
    const seen = new Set<string>();

    for (const w of words) {
      if (w && TECH_SPELL_CORRECTIONS[w] && !seen.has(w)) {
        seen.add(w);
        typos.push({ wrong: w, right: TECH_SPELL_CORRECTIONS[w] });
      }
    }
    return typos;
  }, [currentAnswer]);

  // Handle clicking a keyword to insert into the input text
  const handleInsertKeyword = (kw: string) => {
    const trimmed = currentAnswer.trim();
    if (!trimmed) {
      onUpdateAnswer(kw);
      return;
    }
    if (trimmed.toLowerCase().includes(kw.toLowerCase())) return; // Already present
    onUpdateAnswer(`${trimmed} ${kw}`);
  };

  // Handle auto-correcting a detected typo
  const handleFixTypo = (wrong: string, right: string) => {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    const updated = currentAnswer.replace(regex, right);
    onUpdateAnswer(updated);
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-2 mb-3">
      {/* Dynamic Spell Check Alert Bar if misspellings detected */}
      <AnimatePresence>
        {detectedTypos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-400 flex items-center justify-between flex-wrap gap-2"
          >
            <div className="flex items-center gap-2 font-medium">
              <SpellCheck className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
              <span>
                Spell Assistant: Found <strong>{detectedTypos.length}</strong> technical typo{detectedTypos.length > 1 ? "s" : ""}:
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {detectedTypos.map(({ wrong, right }) => (
                <button
                  key={wrong}
                  type="button"
                  onClick={() => handleFixTypo(wrong, right)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Wand2 className="w-3 h-3 text-amber-500" />
                  Fix "{wrong}" ➔ <strong>{right}</strong>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested Keywords Bar (Non-Interruptive & Collapsible) */}
      <div className="p-2.5 rounded-2xl bg-muted/40 border space-y-2">
        <div 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-between text-xs font-semibold cursor-pointer select-none hover:opacity-80 transition-opacity"
        >
          <span className="flex items-center gap-1.5 text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> Recommended Key Terms for {roleName || "this role"}
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-[11px] font-normal hidden sm:inline">
              {isCollapsed ? "Show suggestions" : "Click term to insert into answer"}
            </span>
            <button 
              type="button" 
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 pt-1 border-t border-border/50"
          >
            {keywordStatus.map(({ keyword, isUsed }) => (
              <button
                key={keyword}
                type="button"
                onClick={() => handleInsertKeyword(keyword)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isUsed
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold shadow-2xs"
                    : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {isUsed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                )}
                {keyword}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
