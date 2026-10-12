export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-6">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Ai Interview Pro, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use the materials on Ai Interview Pro&apos;s website for personal, non-commercial transitory viewing only.
        </p>

        <h2>3. Disclaimer</h2>
        <p>
          The materials on Ai Interview Pro&apos;s website are provided on an &apos;as is&apos; basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>

        <h2>4. Limitations</h2>
        <p>
          In no event shall Ai Interview Pro or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our website.
        </p>
      </div>
    </div>
  );
}
