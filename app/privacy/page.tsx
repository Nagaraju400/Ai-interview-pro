export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-3xl">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-foreground">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="prose prose-lg dark:prose-invert text-muted-foreground space-y-6">
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect to operate and improve our platform, including to process your mock interviews and provide personalized feedback. We do not sell your personal data.
        </p>

        <h2>3. Resume Data</h2>
        <p>
          When you upload your resume, we extract text to generate contextual interview questions. Your resume files are stored securely and are never shared with third-party employers without your explicit consent.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          We retain your interview transcripts and scores to provide you with historical progress tracking. You may request deletion of your account and all associated data at any time by contacting support.
        </p>
      </div>
    </div>
  );
}
