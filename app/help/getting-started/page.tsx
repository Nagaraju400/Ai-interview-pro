import Link from "next/link";
import { ArrowLeft, Book } from "lucide-react";

export default function GettingStartedPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/help" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Help Center
      </Link>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <Book className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Getting Started</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          Welcome to Ai Interview Pro! We're excited to help you land your dream job. This guide will walk you through the basics of setting up your account and taking your first mock interview.
        </p>
        
        <h3 className="text-2xl font-semibold mt-10 mb-4">1. Setting up your profile</h3>
        <p className="text-muted-foreground mb-4">
          After creating an account, head over to your Dashboard. Here you can upload your latest resume. Our AI uses this resume to tailor the interview questions specifically to your stated experience and skills.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4">2. Taking a mock interview</h3>
        <p className="text-muted-foreground mb-4">
          Navigate to the "Interviews" tab and click "Start New Interview". You'll be asked to select the type of interview (e.g., HR, Technical, Behavioral). Once started, the AI will ask you questions one by one. Take your time, think out loud, and type or speak your answer clearly.
        </p>
        
        <h3 className="text-2xl font-semibold mt-10 mb-4">3. Reviewing feedback</h3>
        <p className="text-muted-foreground mb-4">
          Once your interview is complete, the AI will generate a detailed feedback report. It will highlight your strengths, point out weaknesses, and give actionable suggestions on how to improve. You can review all past feedback in your Dashboard.
        </p>
      </div>
    </div>
  );
}
