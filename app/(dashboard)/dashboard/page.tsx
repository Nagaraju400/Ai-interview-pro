import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { FileText, Play, History, TrendingUp, Calendar, CheckCircle2, Sparkles, GraduationCap, ArrowRight, Upload, Building2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/utils/supabase/server";
import { DeleteInterviewButton } from "./DeleteInterviewButton";

import { SuccessBanner } from "@/components/SuccessBanner";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id || !user?.email) {
    redirect("/login");
  }

  let dbUser: any = {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User",
  };
  let interviews: any[] = [];

  try {
    dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User",
      },
    });

    interviews = await prisma.interview.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: { feedback: true },
    });
  } catch (dbErr) {
    console.warn("Dashboard DB query warning:", dbErr);
  }

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.feedback !== null).length;
  
  // Get unique roles practiced
  const roles = new Set(interviews.map(i => i.role));
  const totalRoles = roles.size;

  const isNewUser = totalInterviews === 0;

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-[1400px]">
      {/* Dynamic Success Banner for Upgrades */}
      <SuccessBanner />

      {/* Vibrant Welcome Banner */}
      <div className="mb-10 relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-6 md:p-10 shadow-xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 blur-[40px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-24 h-24 bg-black/10 blur-[30px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-4 border border-white/20">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Student Dashboard
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Welcome, {dbUser.name?.split(' ')[0] || "User"}! 👋
            </h1>
            <p className="text-primary-foreground/80 text-lg max-w-xl">
              {isNewUser 
                ? "You're one step closer to your dream job. Let's get your profile set up and practice your first interview!" 
                : "Great to see you again! Keep practicing, every mock interview builds your confidence."}
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-inner shrink-0">
            <GraduationCap className="w-10 h-10 text-white/90" />
          </div>
        </div>
      </div>

      {isNewUser ? (
        /* Getting Started Guide for Freshers */
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            Getting Started Checklist
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold">1</div>
              <h3 className="text-lg font-semibold mb-2">Upload Resume</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Give our AI context about your school projects so it can ask you relevant questions.
              </p>
              <Link href="/resume">
                <Button variant="outline" className="w-full justify-between group-hover:border-blue-500 transition-colors">
                  Upload PDF <Upload className="w-4 h-4 ml-2 text-muted-foreground" />
                </Button>
              </Link>
            </div>
            
            <div className="p-6 rounded-2xl bg-card border shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary font-bold">2</div>
              <h3 className="text-lg font-semibold mb-2">Try a Mock Interview</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Start a low-pressure 5-minute session for a Junior Developer role.
              </p>
              <Link href="/interview/setup">
                <Button className="w-full justify-between">
                  Start Practice <Play className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-muted/40 border border-dashed shadow-sm relative overflow-hidden opacity-70">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground font-bold">3</div>
              <h3 className="text-lg font-semibold mb-2">Review Feedback</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Complete an interview first to unlock your personalized improvement plan.
              </p>
              <Button variant="secondary" className="w-full" disabled>
                Locked
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Progress & Stats for active users */
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl border bg-card flex flex-col justify-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-1">Interviews Taken</p>
              <p className="text-3xl font-bold">{totalInterviews}</p>
            </div>
            <div className="p-5 rounded-2xl border bg-card flex flex-col justify-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600 flex items-center">
                {completedInterviews} <CheckCircle2 className="w-5 h-5 ml-2" />
              </p>
            </div>
            <div className="p-5 rounded-2xl border bg-card flex flex-col justify-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-1">Roles Practiced</p>
              <p className="text-3xl font-bold">{totalRoles}</p>
            </div>
            <div className="p-5 rounded-2xl border bg-card flex flex-col justify-center shadow-sm">
              <p className="text-sm font-medium text-muted-foreground mb-1">Avg Score</p>
              <p className="text-3xl font-bold text-primary">N/A</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Quick Start Card */}
            <div className="p-6 rounded-2xl bg-card border shadow-sm col-span-1 md:col-span-2 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Ready for another round?</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Practice makes perfect. Jump back in and try a different interview type or target role.
                </p>
              </div>
              <Link href="/interview/setup">
                <Button size="lg" className="w-fit text-base px-8 h-12 rounded-full shadow-md shadow-primary/20">
                  Start New Interview <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Upload Resume Card */}
            <div className="p-6 rounded-2xl bg-muted/30 border shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-muted-foreground/10 flex items-center justify-center mb-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold mb-2">Update Resume</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Got a new project? Keep your resume updated for the best questions.
                </p>
              </div>
              <Link href="/resume">
                <Button variant="outline" className="w-full rounded-full">
                  Update CV
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center">
            <History className="mr-2 h-6 w-6 text-primary" />
            Recent Activity
          </h2>
          {!isNewUser && (
            <Button variant="ghost" className="text-primary hover:text-primary/80">View All</Button>
          )}
        </div>
        
        {interviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <Play className="h-8 w-8 text-primary/40 ml-1" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Your recent mock interviews and feedback will appear here. Start practicing to fill this up!
            </p>
            <Link href="/interview/setup">
              <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
                Start Your First Interview
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {interviews.map((interview) => (
              <div key={interview.id} className="p-5 rounded-2xl border bg-card hover:border-primary/50 transition-colors shadow-sm flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {interview.interviewType}
                    </span>
                    {interview.company && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Building2 className="w-3 h-3 mr-1" />
                        {interview.company}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground flex items-center bg-muted px-2 py-1 rounded-full">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true })}
                    </span>
                    <DeleteInterviewButton interviewId={interview.id} />
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-1 truncate">{interview.role}</h3>
                <p className="text-sm text-muted-foreground mb-4">Practice Session</p>
                
                <div className="mt-auto pt-4 border-t">
                  {interview.feedback ? (
                    <Link href={`/interview/${interview.id}/feedback`}>
                      <Button variant="ghost" className="w-full justify-between text-primary hover:text-primary hover:bg-primary/5" size="sm">
                        View Feedback <TrendingUp className="w-4 h-4 text-green-500" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/interview/${interview.id}`}>
                      <Button variant="outline" className="w-full justify-between group-hover:border-primary/50" size="sm">
                        Continue Session <Play className="w-4 h-4 text-primary" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
