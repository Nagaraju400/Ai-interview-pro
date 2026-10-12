import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl text-center">
      <div className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium tracking-wide mb-8 text-primary">
        Documentation
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-foreground">
        Learn how to use <span className="text-gradient">Ai Interview Pro</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
        Our documentation is currently being written. Soon you&apos;ll find comprehensive guides on how to optimize your resume parsing, set up custom interview parameters, and interpret your analytics dashboard.
      </p>
      <div className="p-8 rounded-2xl bg-card border border-border shadow-sm text-left">
        <h3 className="text-xl font-bold mb-4">Quick Start Guide</h3>
        <ol className="list-decimal list-inside space-y-4 text-muted-foreground marker:text-primary marker:font-bold">
          <li>Create an account and verify your email.</li>
          <li>Navigate to the Dashboard.</li>
          <li>Upload your latest PDF resume.</li>
          <li>Click &quot;Start New Interview&quot; and select your target role (e.g., Frontend Developer).</li>
          <li>Follow the AI&apos;s prompts!</li>
        </ol>
      </div>
      <div className="mt-12">
        <Link href="/dashboard">
          <Button size="lg" className="rounded-full">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
