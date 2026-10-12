import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl text-center">
      <div className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium tracking-wide mb-8 text-primary">
        About Us
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-8 text-foreground">
        Empowering talent, <br className="hidden sm:block" />
        <span className="text-gradient">redefining interviews.</span>
      </h1>
      <div className="prose prose-lg mx-auto dark:prose-invert text-muted-foreground text-left space-y-6">
        <p>
          Ai Interview Pro was founded to transform the technical and behavioral hiring landscape. Navigating modern engineering interviews can feel daunting, high-stakes, and opaque.
        </p>
        <p>
          We built an enterprise-grade AI simulation platform that bridges the gap between candidate preparation and real-world hiring standards. By delivering realistic, adaptive interview scenarios with instant multi-dimensional feedback, we empower candidates and hiring teams to benchmark performance with confidence.
        </p>
        <p>
          Designed by industry professionals, Ai Interview Pro powers interview readiness for thousands of job seekers and modern engineering organizations worldwide.
        </p>
      </div>
      <div className="mt-16">
        <Link href="/register">
          <Button size="lg" className="rounded-full">Start your journey today</Button>
        </Link>
      </div>
    </div>
  );
}
