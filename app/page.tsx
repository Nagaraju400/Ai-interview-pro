import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Code2, LineChart, Mic, FileText, Check, Sparkles, GraduationCap } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary/20 selection:text-primary">
      
      {/* Promotional Banner - Limited Time */}
      <div className="bg-primary text-primary-foreground py-2 text-center text-sm font-medium tracking-wide">
        🎉 Limited Time Offer: Get Grad Pro at <span className="font-bold underline decoration-wavy decoration-accent">50% OFF</span>. Start practicing today!
      </div>
      
      {/* 1. Hero Section (Vibrant & Welcoming) */}
      <section className="relative pt-28 pb-32 overflow-hidden bg-grid-pattern">
        {/* Subtle Minimalist Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container relative mx-auto px-4 md:px-8 max-w-5xl text-center">
          <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium tracking-wide mb-8 text-primary backdrop-blur-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Sparkles className="w-4 h-4 mr-2" />
              The #1 Ai Interview Pro Platform for Ambitious Professionals
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground leading-[1.1]">
              Master the interview. <br className="hidden md:block" />
              <span className="text-gradient">Secure the offer.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Stop letting interview anxiety steal your opportunities. Train with an elite AI recruiter that exposes your weak spots, refines your pitch, and makes you absolutely bulletproof before the real thing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all scale-100 hover:scale-[1.02]">
                  Transform Your Career Today <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Glass Mockup */}
            <div className="glass rounded-2xl mx-auto max-w-4xl p-2 relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <div className="rounded-xl border bg-card/80 overflow-hidden flex flex-col backdrop-blur-sm">
                <div className="h-12 border-b bg-muted/40 flex items-center px-4 space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  <div className="flex-1 text-center text-xs text-muted-foreground font-medium">Practice Session - Entry Level Frontend</div>
                </div>
                <div className="p-6 md:p-10 flex-1 flex flex-col space-y-6 text-left">
                  <div className="flex space-x-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="bg-muted/40 p-5 rounded-2xl rounded-tl-sm text-sm border font-medium text-foreground max-w-lg shadow-sm">
                      Hi there! Don&apos;t worry if this is your first time. Let&apos;s start easy. Can you explain what the Virtual DOM is in React and why it&apos;s useful?
                    </div>
                  </div>
                  <div className="flex space-x-4 items-start flex-row-reverse space-x-reverse">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                      <span className="text-primary-foreground text-xs font-bold">YOU</span>
                    </div>
                    <div className="bg-primary text-primary-foreground p-5 rounded-2xl rounded-tr-sm text-sm font-medium max-w-lg shadow-sm">
                      Sure! The Virtual DOM is a lightweight copy of the actual DOM. React uses it to figure out what changed, so it only updates the necessary parts of the real screen instead of everything.
                    </div>
                  </div>
                  <div className="flex space-x-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="bg-green-500/10 border-green-500/20 p-5 rounded-2xl rounded-tl-sm text-sm border font-medium text-green-700 dark:text-green-400 max-w-lg shadow-sm">
                      That&apos;s a perfect answer! Spot on. Now let&apos;s try writing a quick React component together.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Features Section (Friendly Grid) */}
      <section id="features" className="py-24 px-4 md:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground mb-6">
              An unfair advantage over <span className="text-gradient">the competition.</span>
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We don&apos;t just ask generic questions. Our engine uses state-of-the-art AI to simulate the exact grueling conditions of top-tier company interviews, forcing you to level up fast.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileText className="h-6 w-6 text-violet-500" />}
              title="Hyper-Personalized to Your DNA"
              description="Upload your resume and watch our AI instantly generate a hyper-realistic interview tailored exactly to your unique experience and target role."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-primary" />}
              title="Elite AI Recruiter"
              description="Experience the pressure of a real interview without the stakes. Our AI dynamically adapts to your answers, pushing your limits just like a FAANG recruiter."
            />
            <FeatureCard
              icon={<Code2 className="h-6 w-6 text-pink-500" />}
              title="Real-Time Code Execution"
              description="Crush technical rounds. Write, run, and debug code in our integrated IDE while the AI evaluates your logic, optimization, and edge cases in real-time."
            />
            <FeatureCard
              icon={<Mic className="h-6 w-6 text-orange-500" />}
              title="Flawless Speech Analysis"
              description="Speak your answers out loud. Our proprietary engine analyzes your tone, pacing, and filler words to transform you into a captivating communicator."
            />
            <FeatureCard
              icon={<LineChart className="h-6 w-6 text-green-500" />}
              title="Actionable Analytics"
              description="Stop guessing. Get a brutal, objective breakdown of your performance with actionable insights that guarantee improvement after every single session."
            />
            <FeatureCard
              icon={<GraduationCap className="h-6 w-6 text-primary" />}
              title="Dominate Any Industry"
              description="Whether you're aiming for Tech, Finance, Healthcare, or Consulting, our specialized question banks ensure you're ready for any curveball."
            />
          </div>
        </div>
      </section>

      {/* 3. How It Works (Simple Steps) */}
      <section id="how-it-works" className="py-24 px-4 md:px-8 bg-background relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[300px] bg-primary/5 blur-[100px] -skew-y-6 pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              How it works
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TimelineStep 
              step="01" 
              title="Upload Your Arsenal" 
              description="Drop in your resume and target job description. We instantly analyze the data to construct your ultimate battle plan." 
            />
            <TimelineStep 
              step="02" 
              title="Enter the Simulator" 
              description="Face off against our AI in high-fidelity mock interviews. Sweat in practice so you don't bleed in battle." 
            />
            <TimelineStep 
              step="03" 
              title="Demand What You're Worth" 
              description="Armed with elite feedback and unshakable confidence, walk into the real interview and secure a top-tier compensation package." 
            />
          </div>
          
          <div className="mt-20 text-center">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-base bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-100 hover:scale-[1.03] transition-transform">
                Claim Your Competitive Edge
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Pricing (Student Friendly) */}
      <section id="pricing" className="py-24 px-4 md:px-8 bg-muted/20 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground mb-4">
              Invest in your <span className="text-gradient">Future</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              A single negotiation backed by confidence can increase your starting salary by thousands. This is the highest ROI investment you will ever make.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard 
              title="Student Basic" 
              price="Free" 
              description="Essential tools to get your feet wet."
              features={[
                "3 Mock Interviews / mo",
                "Standard Resume Parsing",
                "Text-based Chat",
                "Basic Feedback"
              ]}
              buttonText="Get Started"
              highlighted={false}
            />
            <PricingCard 
              title="Grad Pro" 
              originalPrice="₹599/mo"
              price="₹299/mo" 
              priceId="plan_TOsLeYzr23MJGv"
              badge="50% Off Limited Time"
              description="Complete access for the active job hunt."
              features={[
                "Unlimited Interviews",
                "Powered by Groq Ultra-Fast Llama 3.3 70B AI",
                "Real-Time Low Latency (~300ms) Responses",
                "Integrated Code Editor",
                "Deep Analytics Dashboard",
                "Targeted Junior Question Packs",
                "Priority Support"
              ]}
              buttonText="Start Trial"
              highlighted={true}
            />
            <PricingCard 
              title="Grad Pro Yearly" 
              originalPrice="₹5999/yr"
              price="₹2999/yr" 
              priceId="plan_TOsOBlImc27Kd5"
              badge="50% Off Early Bird Offer"
              description="Save big by committing to your career growth for a full year."
              features={[
                "Everything in Grad Pro",
                "Powered by Groq Ultra-Fast Llama 3.3 70B AI",
                "2 Months Free (Save ₹589)",
                "Exclusive Discord Access",
                "1-on-1 Resume Review",
                "Priority Support"
              ]}
              buttonText="Start Trial"
              highlighted={false}
            />
          </div>
        </div>
      </section>

    </div>
  );
}

// --- Subcomponents ---

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div 
      className="p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TimelineStep({ step, title, description }: { step: string, title: string, description: string }) {
  return (
    <div 
      className="flex flex-col items-center text-center p-6 relative"
    >
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black mb-6 shadow-lg shadow-primary/20">
        {step}
      </div>
      <h3 className="text-xl font-bold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

