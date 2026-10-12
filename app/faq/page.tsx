import Link from "next/link";

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <Link href="/help" className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium tracking-wide mb-8 text-primary hover:bg-primary/10 hover:shadow-sm transition-all cursor-pointer">
        ← Back to Help Center
      </Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-12 text-foreground">Frequently Asked Questions</h1>
      
      <div className="w-full space-y-4">
        <details className="group border rounded-lg bg-card text-card-foreground shadow-sm [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-lg font-medium">
            Is Ai Interview Pro really free?
            <span className="transition duration-300 group-open:-rotate-180">
              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="px-6 pb-4 text-muted-foreground text-base">
            Yes! Our basic student plan is 100% free forever. It includes up to 3 mock interviews per month. If you are actively job hunting and need more practice, we offer a &quot;Grad Pro&quot; tier with unlimited interviews.
          </div>
        </details>
        
        <details className="group border rounded-lg bg-card text-card-foreground shadow-sm [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-lg font-medium">
            How does the AI evaluate my answers?
            <span className="transition duration-300 group-open:-rotate-180">
              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="px-6 pb-4 text-muted-foreground text-base">
            We use advanced Large Language Models (LLMs) tuned specifically on thousands of real technical and behavioral interviews. The AI evaluates you on technical accuracy, communication clarity, and problem-solving approach.
          </div>
        </details>
        
        <details className="group border rounded-lg bg-card text-card-foreground shadow-sm [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-lg font-medium">
            Can I practice system design questions?
            <span className="transition duration-300 group-open:-rotate-180">
              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="px-6 pb-4 text-muted-foreground text-base">
            Yes, our platform supports coding, behavioral, and system design questions. However, since we cater primarily to fresh graduates, our system design questions are tailored to an entry-level difficulty.
          </div>
        </details>
        
        <details className="group border rounded-lg bg-card text-card-foreground shadow-sm [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-lg font-medium">
            What happens to my uploaded resume?
            <span className="transition duration-300 group-open:-rotate-180">
              <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="px-6 pb-4 text-muted-foreground text-base">
            Your resume is parsed to generate personalized interview questions based on your stated experience. We do not share your resume with any third parties or recruiters. You can delete your data at any time.
          </div>
        </details>
      </div>
    </div>
  );
}
