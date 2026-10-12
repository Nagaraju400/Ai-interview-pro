

export default function MissionPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl text-center">
      <div className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium tracking-wide mb-8 text-primary">
        Our Mission
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-foreground">
        Democratizing <span className="text-gradient">tech interviews.</span>
      </h1>
      <div className="prose prose-lg mx-auto dark:prose-invert text-muted-foreground text-left space-y-6">
        <p>
          Our mission is simple: to make high-quality interview preparation accessible to everyone, regardless of their background, university pedigree, or financial situation.
        </p>
        <p>
          We believe that talent is distributed equally, but opportunity is not. By leveraging advanced AI, we can provide personalized, 1-on-1 coaching that was previously only available through expensive bootcamps or premium services.
        </p>
        <p>
          We are committed to constantly improving our AI models to provide realistic, empathetic, and highly actionable feedback that actually helps you improve.
        </p>
      </div>
    </div>
  );
}
