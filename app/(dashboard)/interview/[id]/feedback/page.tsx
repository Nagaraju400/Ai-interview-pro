"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, AlertTriangle, Lightbulb, Building2, ShieldCheck, Mail } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

type FeedbackData = {
  strengths: string;
  weaknesses: string;
  suggestions: string;
  interview: {
    role: string;
    interviewType: string;
    company?: string | null;
    questions: { id: string; question: string; answers: { answer: string }[] }[];
  };
};

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const timeConducted = searchParams.get("timeConducted");
  const interviewId = params.id as string;
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState("");

  const formatTimeStr = (totalSecondsStr: string) => {
    const totalSeconds = parseInt(totalSecondsStr, 10) || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const ensureMarkdownList = (text: string) => {
    if (!text) return "";
    // If it already contains markdown bullets (- or *), return as is
    if (/^[\-\*]\s/m.test(text)) {
      return text;
    }
    // Otherwise, split by newlines (or full stops if it's a single paragraph) and map to bullets
    let parts = text.split('\n').filter(p => p.trim().length > 0);
    if (parts.length === 1 && text.includes('. ')) {
      parts = text.split('. ').filter(p => p.trim().length > 0).map(p => p.endsWith('.') ? p : p + '.');
    }
    return parts.map(p => `- ${p.trim()}`).join('\n');
  };

  useEffect(() => {
    const fetchOrGenerateFeedback = async () => {
      try {
        // Try to generate (or get existing if already generated)
        const genRes = await fetch(`/api/interview/${interviewId}/feedback`, {
          method: "POST",
        });

        if (!genRes.ok) {
          throw new Error("Failed to generate feedback");
        }
        setGenerating(false);

        // Fetch full feedback with transcript
        const getRes = await fetch(`/api/interview/${interviewId}/feedback`);
        if (!getRes.ok) throw new Error("Failed to fetch feedback data");
        
        const feedbackData = await getRes.json();
        setData(feedbackData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateFeedback();
  }, [interviewId]);

  if (loading || generating) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            {generating ? "AI is analyzing your performance..." : "Loading results..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center mt-20">
        <h2 className="text-2xl font-bold text-destructive">Oops, something went wrong</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">Return to Dashboard</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-5xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Interview Feedback
            {data.interview.company && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <Building2 className="w-3.5 h-3.5" /> Target: {data.interview.company}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-2">
            Role: <span className="font-medium text-foreground">{data.interview.role}</span> &bull; 
            Type: <span className="font-medium text-foreground">{data.interview.interviewType}</span>
            {timeConducted && (
              <>
                {" "}&bull; Conducted Time: <span className="font-medium text-foreground">{formatTimeStr(timeConducted)}</span>
              </>
            )}
          </p>
        </div>

        <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shadow-sm">
          <ShieldCheck className="w-4 h-4 text-primary" /> Verified Evaluation &bull; PDF Report Dispatched by Admin
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl border bg-card shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 shrink-0">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-4">Strengths</h3>
          <div className="text-sm text-muted-foreground text-left w-full">
            <ReactMarkdown
              components={{
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
              }}
            >
              {ensureMarkdownList(data.strengths)}
            </ReactMarkdown>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-card shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 shrink-0">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-semibold mb-4">Areas for Improvement</h3>
          <div className="text-sm text-muted-foreground text-left w-full">
            <ReactMarkdown
              components={{
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
              }}
            >
              {ensureMarkdownList(data.weaknesses)}
            </ReactMarkdown>
          </div>
        </div>
        
        <div className="p-6 rounded-2xl border bg-card shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 shrink-0">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-4">Suggestions</h3>
          <div className="text-sm text-muted-foreground text-left w-full">
            <ReactMarkdown
              components={{
                ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />
              }}
            >
              {ensureMarkdownList(data.suggestions)}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4">Transcript</h2>
        {data.interview.questions.map((q, i: number) => (
          <div key={q.id} className="p-6 rounded-2xl border bg-muted/20">
            <div className="flex items-start space-x-4 mb-4">
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                Q{i+1}
              </div>
              <p className="font-medium pt-1">{q.question}</p>
            </div>
            <div className="flex items-start space-x-4 ml-12">
              <div className="shrink-0 h-8 w-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm">
                A
              </div>
              <p className="text-muted-foreground pt-1 bg-background p-4 rounded-xl border w-full">
                {q.answers[0]?.answer || <span className="italic text-muted-foreground/60">No answer provided</span>}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
