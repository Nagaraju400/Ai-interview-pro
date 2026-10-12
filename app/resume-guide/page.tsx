export default function ResumeGuidePage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <div className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium tracking-wide mb-8 text-primary">
        Resources
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">The Ultimate Resume Guide for Fresh Graduates</h1>
      
      <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-6">
        <p>
          As a fresh graduate, your resume is your most important tool for getting your foot in the door. Here is how to structure it for maximum impact.
        </p>

        <h2>1. Keep it to One Page</h2>
        <p>
          Unless you have 10+ years of experience, your resume should not exceed one page. Recruiters spend an average of 6 seconds looking at a resume. Make it concise.
        </p>

        <h2>2. Highlight Projects Over Coursework</h2>
        <p>
          Every CS student has taken &quot;Data Structures and Algorithms.&quot; Instead of listing coursework, highlight 2-3 significant projects. What did you build? What technologies did you use? What problem did it solve?
        </p>

        <h2>3. Use the XYZ Formula for Bullet Points</h2>
        <p>
          Google recommends describing your experience using this formula: <strong>Accomplished [X] as measured by [Y], by doing [Z].</strong>
        </p>
        <div className="p-4 bg-muted/40 rounded-lg border text-sm">
          <strong>Bad:</strong> Built a website for a local business.<br/>
          <strong>Good:</strong> Increased local business online sales by 20% (Y) by building a responsive e-commerce website (X) using Next.js and Razorpay (Z).
        </div>

        <h2>4. Make it ATS Friendly</h2>
        <p>
          Avoid complex multi-column layouts, graphics, or weird fonts. Many companies use Applicant Tracking Systems (ATS) that struggle to parse complex PDFs. Stick to a clean, single-column text format.
        </p>
      </div>
    </div>
  );
}
