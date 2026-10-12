"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  BrainCircuit, 
  ShieldCheck, 
  Briefcase, 
  Zap, 
  Layers,
  Camera,
  Mic,
  ArrowRight
} from "lucide-react";
import { TOP_COMPANIES, getCompanyProfile } from "@/lib/companies";

type ResumeParsedData = {
  name?: string;
  skills?: string[];
  experience_years?: number | string;
  experience_details?: string[];
  education?: string[];
};

type ResumeInfo = {
  id: string;
  fileUrl: string;
  createdAt: string;
  parsedData?: ResumeParsedData | null;
};

export default function InterviewSetupPage() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Mandatory Readiness Conditions State
  const [condSpontaneous, setCondSpontaneous] = useState(false);
  const [condEnvironment, setCondEnvironment] = useState(false);
  const [condVision, setCondVision] = useState(false);
  const [condSingleRound, setCondSingleRound] = useState(false);

  const allConditionsAccepted = condSpontaneous && condEnvironment && condVision && condSingleRound;

  const [isManualTypeSelection, setIsManualTypeSelection] = useState(false);

  // Resume profile state fetched from API
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
  const [loadingResume, setLoadingResume] = useState(true);

  // Fetch Candidate Resume Profile on mount
  useEffect(() => {
    async function fetchResumeProfile() {
      try {
        const res = await fetch("/api/resume");
        if (res.ok) {
          const data = await res.json();
          if (data.hasResume && data.resume) {
            setResumeInfo(data.resume);
          }
        }
      } catch (err) {
        console.warn("Could not fetch resume profile:", err);
      } finally {
        setLoadingResume(false);
      }
    }
    fetchResumeProfile();
  }, []);

  const activeCompanyProfile = getCompanyProfile(company);

  // AI Round Decision Engine: Recommends the first dedicated round based on role, company, and resume
  const aiDecidedRound = useMemo(() => {
    const roleLower = role.trim().toLowerCase();
    const companyLower = company.trim().toLowerCase();

    // FAANG / High-tier Companies default recommendation
    const isFaangCompany = ["google", "amazon", "microsoft", "meta", "uber", "flipkart"].includes(companyLower);

    if (roleLower.includes("hr") || roleLower.includes("recruiter") || roleLower.includes("human resources") || (roleLower.includes("manager") && !roleLower.includes("engineering"))) {
      return {
        type: "HR",
        title: "Round 1: HR & Behavioral Screening",
        reason: "For management and HR roles, assessing interpersonal communication, leadership STAR scenarios, and company culture fit is paramount.",
      };
    }

    if (roleLower.includes("product") || roleLower.includes("pm")) {
      return {
        type: "Product Management",
        title: "Round 1: Product Strategy & Metrics",
        reason: "For Product Management, evaluating user empathy, feature prioritization metrics, and strategic roadmap vision is the primary initial focus.",
      };
    }

    if (roleLower.includes("architect") || roleLower.includes("system") || roleLower.includes("devops") || roleLower.includes("cloud")) {
      return {
        type: "System Design",
        title: "Round 1: High-Level System Architecture",
        reason: "Architectural and infrastructure roles start with high-availability system design, database scaling, and fault tolerance evaluation.",
      };
    }

    if (roleLower.includes("coding") || roleLower.includes("algorithm") || roleLower.includes("dsa") || roleLower.includes("react") || roleLower.includes("android") || roleLower.includes("ios") || roleLower.includes("frontend") || roleLower.includes("full stack")) {
      if (isFaangCompany) {
        return {
          type: "FAANG Style (Strict)",
          title: "Round 1: FAANG Rigorous Technical & DSA",
          reason: `Targeting ${company.trim()} for software engineering requires high-rigor algorithmic execution and stress testing.`,
        };
      }
      return {
        type: "Coding",
        title: "Round 1: Live Coding & Data Structures",
        reason: "Hands-on engineering roles prioritize algorithm implementation, data structure efficiency, and code syntax accuracy in the initial round.",
      };
    }

    if (roleLower.includes("analyst") || roleLower.includes("finance") || roleLower.includes("aptitude")) {
      return {
        type: "Aptitude & Problem Solving",
        title: "Round 1: Aptitude & Quantitative Logic",
        reason: "Analytical positions begin with structured logical puzzles, quantitative estimation, and problem-solving reasoning.",
      };
    }

    if (isFaangCompany) {
      return {
        type: "Technical",
        title: "Round 1: Technical Core Fundamentals",
        reason: `AI recommends starting with core engineering fundamentals tailored to ${company.trim()}'s interview bar.`,
      };
    }

    return {
      type: "Technical",
      title: "Round 1: Core Technical & Domain Knowledge",
      reason: "Based on your target role, AI recommends beginning with core engineering principles and framework execution logic.",
    };
  }, [role, company, resumeInfo]);

  // Auto-set interview type when user types a role ONLY if candidate has NOT manually selected an option
  useEffect(() => {
    if (role.trim() && !isManualTypeSelection) {
      setInterviewType(aiDecidedRound.type);
    }
  }, [role, company, aiDecidedRound, isManualTypeSelection]);

  const handleCompanyChange = (newCompany: string) => {
    setCompany(newCompany);
    if (!isManualTypeSelection) {
      const profile = getCompanyProfile(newCompany);
      if (profile && profile.defaultInterviewType) {
        setInterviewType(profile.defaultInterviewType);
      }
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeInfo) {
      setError("Resume Required: You must upload and validate a genuine candidate resume before setting up or taking an AI mock interview.");
      return;
    }

    if (!role.trim()) {
      setError("Please enter a target role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role.trim(), interviewType, company: company.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to initialize interview");
      }

      // Time limit removed — direct navigation to interview session
      router.push(`/interview/${data.interviewId}`);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const popularQuickCompanies = [
    "Google", "Amazon", "Microsoft", "Meta", "TCS", "Infosys", "Wipro", "Flipkart", "Uber", "Razorpay", "Goldman Sachs"
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-[1400px] space-y-8">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-card/60 backdrop-blur-md p-6 rounded-3xl border shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Settings className="h-7 w-7 text-primary animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Interview Setup</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Configure your role, company, and round settings for a realistic AI mock interview
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" /> AI Engine Ready
        </div>
      </div>

      <form onSubmit={handleStart} className="space-y-8">
        
        {/* ==================================================================== */}
        {/* SECTION 1: CANDIDATE RESUME PROFILE & KNOWLEDGE LISTING             */}
        {/* ==================================================================== */}
        <div className="p-6 md:p-8 rounded-3xl bg-card border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Candidate Profile & Uploaded Resume</h2>
            </div>
            {resumeInfo ? (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Resume Synced
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-medium">
                Action Required: Resume Required
              </span>
            )}
          </div>

          {loadingResume ? (
            <div className="py-4 text-xs text-muted-foreground animate-pulse">
              Loading candidate resume profile data...
            </div>
          ) : resumeInfo && resumeInfo.parsedData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-xl bg-muted/40 border text-xs space-y-1">
                <span className="text-muted-foreground font-medium">Candidate Name:</span>
                <p className="font-semibold text-foreground text-sm">{resumeInfo.parsedData.name || "Candidate"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border text-xs space-y-1">
                <span className="text-muted-foreground font-medium">Experience Level:</span>
                <p className="font-semibold text-foreground text-sm">
                  {resumeInfo.parsedData.experience_years ? `${resumeInfo.parsedData.experience_years} Years Experience` : "Verified Background"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border text-xs space-y-1">
                <span className="text-muted-foreground font-medium">Resume File:</span>
                <p className="font-mono text-primary text-xs truncate">{resumeInfo.fileUrl}</p>
              </div>

              {Array.isArray(resumeInfo.parsedData.skills) && resumeInfo.parsedData.skills.length > 0 && (
                <div className="md:col-span-3 pt-2 space-y-2">
                  <span className="text-xs text-muted-foreground font-medium">Extracted Core Skills:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {resumeInfo.parsedData.skills.slice(0, 15).map((skill, idx) => (
                      <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-700 dark:text-red-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  ⚠️ Resume Verification Required Before Interview Setup
                </div>
                <p className="text-xs opacity-90">
                  Our AI mock interviewer analyzes your candidate resume skills, background, and experience to ask tailored, realistic questions. You must upload a valid candidate resume PDF to start an interview.
                </p>
              </div>
              <Button type="button" size="sm" onClick={() => router.push("/resume")} className="text-xs shrink-0 cursor-pointer shadow-md font-semibold bg-red-600 hover:bg-red-700 text-white border-none">
                Upload Resume Now
              </Button>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* SECTION 2: TARGET ROLE & COMPANY CONFIGURATION                     */}
        {/* ==================================================================== */}
        <div className="p-6 md:p-8 rounded-3xl bg-card border shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 border-b pb-4">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Target Position & Company</h2>
          </div>

          <div className="space-y-5">
            {/* Target Role Input */}
            <div className="space-y-2">
              <Label htmlFor="role" className="font-semibold text-sm">Target Role / Job Title</Label>
              <Input
                id="role"
                list="job-roles"
                placeholder="e.g., Software Engineer, Data Scientist, Frontend Developer..."
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                autoComplete="off"
                className="h-11"
              />
              <datalist id="job-roles">
                <option value="Accountant" />
                <option value="Android Developer" />
                <option value="Backend Developer" />
                <option value="Business Analyst" />
                <option value="Cloud Architect" />
                <option value="Customer Success Manager" />
                <option value="Data Analyst" />
                <option value="Data Scientist" />
                <option value="DevOps Engineer" />
                <option value="Engineering Manager" />
                <option value="Financial Analyst" />
                <option value="Frontend Developer" />
                <option value="Full Stack Developer" />
                <option value="Graphic Designer" />
                <option value="Human Resources Manager" />
                <option value="iOS Developer" />
                <option value="IT Support Specialist" />
                <option value="Java Developer" />
                <option value="Machine Learning Engineer" />
                <option value="Marketing Manager" />
                <option value="Network Engineer" />
                <option value="Operations Manager" />
                <option value="Product Manager" />
                <option value="Project Manager" />
                <option value="QA Engineer" />
                <option value="React Developer" />
                <option value="Sales Representative" />
                <option value="Scrum Master" />
                <option value="Software Engineer" />
                <option value="Systems Administrator" />
                <option value="Technical Writer" />
                <option value="UI/UX Designer" />
                <option value="Web Developer" />
              </datalist>
              <p className="text-xs text-muted-foreground">Select a role from the dropdown or type a custom title.</p>
            </div>

            {/* Target Company Input & Quick Selector */}
            <div className="space-y-3">
              <Label htmlFor="company" className="flex items-center gap-2 font-semibold text-sm">
                <Building2 className="w-4 h-4 text-primary" /> Target Company (Optional)
              </Label>
              <Input
                id="company"
                list="company-list"
                placeholder="e.g. Google, Amazon, TCS, Infosys, Flipkart..."
                value={company}
                onChange={(e) => handleCompanyChange(e.target.value)}
                autoComplete="off"
                className="h-11"
              />
              <datalist id="company-list">
                {TOP_COMPANIES.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>

              {/* Quick Select Chips */}
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-2">Popular Target Companies:</p>
                <div className="flex flex-wrap gap-1.5">
                  {popularQuickCompanies.map((cName) => {
                    const isSelected = company.toLowerCase() === cName.toLowerCase();
                    return (
                      <button
                        key={cName}
                        type="button"
                        onClick={() => handleCompanyChange(isSelected ? "" : cName)}
                        className={`text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary font-medium shadow-sm"
                            : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                        }`}
                      >
                        {cName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Company Focus Insights & Multi-Round Loop Roadmap */}
              {company.trim() && (
                <div className="space-y-4 pt-3">
                  <div className={`p-4 rounded-2xl border ${activeCompanyProfile.badgeColor} text-sm space-y-2.5 transition-all`}>
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> AI Tailored Focus for {activeCompanyProfile.name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-background/60 border border-current font-normal">
                        {activeCompanyProfile.category}
                      </span>
                    </div>
                    <p className="text-xs opacity-90">{activeCompanyProfile.tagline}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeCompanyProfile.focusAreas.map((area, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-background/70 font-medium flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Company Official Round Track */}
                  {activeCompanyProfile.interviewLoop && activeCompanyProfile.interviewLoop.length > 0 && (
                    <div className="p-4 rounded-2xl border bg-card/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                          <Building2 className="w-4 h-4 text-cyan-400" /> Official {activeCompanyProfile.name} Hiring Track
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-medium">
                          {activeCompanyProfile.interviewLoop.length} Dedicated Rounds
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {activeCompanyProfile.interviewLoop.map((rnd) => (
                          <div key={rnd.roundNumber} className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-foreground">Round {rnd.roundNumber}: {rnd.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary font-mono">{rnd.type}</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] leading-tight">{rnd.focus}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 3: AI ROUND DECISION & SEPARATE ROUND SELECTION              */}
        {/* ==================================================================== */}
        <div className="p-6 md:p-8 rounded-3xl bg-card border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">AI Round Decision & Dedicated Round Selection</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              Separate Dedicated Rounds
            </span>
          </div>

          {/* AI Decision Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-purple-500/10 border border-primary/25 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" /> AI Decided First Round
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInterviewType(aiDecidedRound.type);
                  setIsManualTypeSelection(false);
                }}
                className="text-xs h-7 text-primary hover:text-primary/80 hover:bg-primary/10 cursor-pointer font-medium"
              >
                Use AI Decided Round <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">{aiDecidedRound.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{aiDecidedRound.reason}</p>
            </div>
          </div>

          {/* Dedicated Interview Round Selector */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Select Dedicated Round To Conduct</Label>
              {isManualTypeSelection ? (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 font-medium">
                  ✓ Custom Choice Active
                </span>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                  ⚡ AI Recommended Active
                </span>
              )}
            </div>
            <Select 
              value={interviewType} 
              onValueChange={(val) => {
                if (val) {
                  setInterviewType(val);
                  setIsManualTypeSelection(true);
                }
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select interview round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">Round 1: HR & Behavioral Screening</SelectItem>
                <SelectItem value="Technical">Round 2: Core Engineering Technical</SelectItem>
                <SelectItem value="Coding">Round 3: Live Coding & Algorithms</SelectItem>
                <SelectItem value="System Design">Round 4: System Architecture & Scalability</SelectItem>
                <SelectItem value="Product Management">Dedicated Product Management & Strategy</SelectItem>
                <SelectItem value="Aptitude & Problem Solving">Dedicated Aptitude & Quantitative Logic</SelectItem>
                <SelectItem value="FAANG Style (Strict)">FAANG Style (High Rigor & Stress Test)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Each session is conducted as a <strong>standalone round</strong> focused entirely on the chosen domain.</span>
              {isManualTypeSelection && (
                <button
                  type="button"
                  onClick={() => setIsManualTypeSelection(false)}
                  className="text-primary hover:underline font-medium text-[11px] cursor-pointer"
                >
                  Reset to AI Default
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 4: INTERVIEW RULES & SYSTEM TRANSPARENCY                    */}
        {/* ==================================================================== */}
        <div className="p-6 md:p-8 rounded-3xl bg-card border shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b pb-4">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Interview Rules & Environment Guidelines</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Layers className="w-4 h-4 text-indigo-500" /> Dedicated Round Execution
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                No mixed rounds. The session focuses strictly on your chosen round domain from start to end.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Anti-Cheat & Copy Detection
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Monitors clipboard pastes and automated AI phrasing to ensure authentic candidate responses.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Camera className="w-4 h-4 text-amber-500" /> Facial Expression & Vision AI
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Analyzes live webcam expressions (Neutral, Happy, Focus, Stress) for confidence metrics.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/40 border space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Mic className="w-4 h-4 text-cyan-500" /> Voice Speech & Adaptive AI
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Speech recognition support with 3-tier difficulty scaling (Easy ➔ Medium ➔ Hard).
              </p>
            </div>
          </div>
        </div>

        {/* Mandatory Readiness Agreement Checkboxes */}
        <div className="p-6 md:p-8 rounded-3xl bg-card border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Mandatory Candidate Readiness Agreement</h2>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${allConditionsAccepted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
              {allConditionsAccepted ? "✓ All Conditions Accepted" : "Action Required: Check 4 Conditions Below"}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/30 border hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={condSpontaneous}
                onChange={(e) => setCondSpontaneous(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-foreground">1. Authentic Spontaneous Response Commitment</span>
                <p className="text-muted-foreground">I commit to answering spontaneously in my own words without copying text from external AI tools, documentation, or search engines.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/30 border hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={condEnvironment}
                onChange={(e) => setCondEnvironment(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-foreground">2. Audio-Visual Hardware & Environment Verification</span>
                <p className="text-muted-foreground">I confirm my microphone and camera hardware are connected and functional, and my physical surroundings are quiet.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/30 border hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={condVision}
                onChange={(e) => setCondVision(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-foreground">3. Facial Vision AI & Anti-Cheat Analytics</span>
                <p className="text-muted-foreground">I acknowledge that live webcam expression analysis (Happy, Focus, Neutral, Stress) and anti-cheat copy checks will process during the session.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-muted/30 border hover:bg-muted/50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={condSingleRound}
                onChange={(e) => setCondSingleRound(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-primary text-primary focus:ring-primary cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-foreground">4. 20-Question 4-Round Adaptive Interview Structure</span>
                <p className="text-muted-foreground">I acknowledge that this session comprises 20 total questions across 4 distinct 5-question rounds, where questions in Rounds 2–4 adapt dynamically based on my performance in Round 1 and preceding rounds.</p>
              </div>
            </label>
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 font-medium">{error}</div>}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-4">
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()} className="px-6 rounded-2xl cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !allConditionsAccepted || !resumeInfo} size="lg" className="px-10 rounded-2xl cursor-pointer shadow-md font-semibold disabled:opacity-50">
            {loading ? "Preparing AI Session..." : !resumeInfo ? "Upload Resume To Start Interview" : allConditionsAccepted ? "Start Interview" : "Accept Conditions To Start"}
          </Button>
        </div>
      </form>
    </div>
  );
}
