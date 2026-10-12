export default function InterviewTipsPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <div className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium tracking-wide mb-8 text-primary">
        Resources
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">Top 5 Interview Tips for Junior Developers</h1>
      
      <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">1. Think Out Loud</h2>
          <p>
            During technical interviews, silence is your worst enemy. If you&apos;re stuck, talk through your thought process. Even if you don&apos;t arrive at the perfect solution, demonstrating how you break down problems is often more valuable to a hiring manager.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">2. Ask Clarifying Questions</h2>
          <p>
            Never start coding immediately. Spend the first 5 minutes asking questions about edge cases, input sizes, and expected outputs. It shows maturity and prevents you from solving the wrong problem.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">3. Master the STAR Method</h2>
          <p>
            For behavioral questions, always use the STAR method: <strong>Situation, Task, Action, Result</strong>. This keeps your answers structured and ensures you actually answer the question asked.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">4. Be Honest About What You Don&apos;t Know</h2>
          <p>
            If you don&apos;t know something, admit it, but follow up with how you would find out. &quot;I&apos;m not familiar with that specific API, but I would start by reading the official documentation and...&quot; is a perfectly acceptable answer for a junior role.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground">5. Practice, Practice, Practice</h2>
          <p>
            Interviewing is a skill entirely separate from coding. Use tools like our Ai Interview Pro to practice the mechanics of interviewing until you feel comfortable.
          </p>
        </div>
      </div>
    </div>
  );
}
