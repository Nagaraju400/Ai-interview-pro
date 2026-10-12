import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCompanyProfile } from "@/lib/companies";
import { generateSmartAIContent, parseAIJson } from "@/lib/ai";
import { sendInterviewReportEmail } from "@/lib/email-service";
import { buildAugmentedRAGPrompt } from "@/lib/rag";
import { getCachedChatMemory, clearCachedChatMemory } from "@/lib/redis-chat-memory";


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: interviewId } = await params;

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email || "" },
        ],
      },
    }).catch(() => null);

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        },
      }).catch(async () => {
        return await prisma.user.findFirst({ where: { email: user.email || "" } });
      });
    }

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if feedback already exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: { interviewId },
    });

    if (existingFeedback) {
      // Trigger automated email in background if email is present
      if (dbUser.email) {
        sendInterviewReportEmail({ interviewId, userEmail: dbUser.email }).catch((err) => {
          console.error("Automated background email error:", err);
        });
      }
      return NextResponse.json(existingFeedback, { status: 200 });
    }

    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId: dbUser.id },
      include: { questions: { include: { answers: true } } },
    });

    if (!interview) {
      return NextResponse.json({ message: "Interview not found" }, { status: 404 });
    }

    const companyProfile = getCompanyProfile(interview.company);

    let feedbackData = {
      strengths: "- **Communication**: Great communication and structured answers.\n- **Clarity**: Spoke clearly and confidently.",
      weaknesses: "- **Technical Depth**: Needs more technical depth in responses.\n- **Examples**: Could provide more specific examples.",
      suggestions: "- **STAR Method**: Practice STAR method for behavioural questions.\n- **Resume Building Suggestions**: Add keywords related to communication and teamwork.",
    };

    const cachedMemory = await getCachedChatMemory(interviewId);
    let historyContext = "";

    if (cachedMemory && cachedMemory.length > 0) {
      historyContext = cachedMemory
        .map((m, i) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n\n");
    } else {
      historyContext = interview.questions.map((q, i) => 
        `Q${i+1}: ${q.question}\nA${i+1}: ${q.answers[0]?.answer || 'No answer'}`
      ).join("\n\n");
    }

    const ragContext = buildAugmentedRAGPrompt(
      interview.role,
      interview.company || "",
      interview.interviewType,
      historyContext
    );

    const prompt = `Review the following actual 20-question (4-Round) mock interview transcript for the role of "${interview.role}"${interview.company ? ` at target company "${interview.company}"` : ''}.
    STRICT REQUIREMENT: Base your evaluation ONLY on the actual questions asked and the candidate's actual answers provided below across all 4 rounds (Round 1: Baseline Q1-5, Round 2: Adapted Q6-10, Round 3: Trade-Offs Q11-15, Round 4: Master Architecture Q16-20). Do NOT hallucinate candidate experience or invent topics not discussed.

    Target Company Focus Areas for ${companyProfile.name}:
    ${companyProfile.focusAreas.map(f => `- ${f}`).join("\n")}

    ${ragContext}

    Provide a highly constructive, grounded evaluation in JSON format with three exact keys:
    "strengths" (string): Point-wise list of their best answers, strong problem-solving skills, and positive delivery traits observed across the 4 rounds. MUST use markdown bullet points (start each line with "- "). **Bold** the main topic of each point. Include a bullet evaluating how well they performed in Round 1 baseline vs adapted rounds.
    "weaknesses" (string): Point-wise list of specific areas where their actual answers can improve across the 4 rounds. MUST use markdown bullet points (start each line with "- "). **Bold** the main topic.
    "suggestions" (string): Point-wise list of actionable advice. MUST use markdown bullet points (start each line with "- "). **Bold** the main topic. *CRUCIAL*: Include a dedicated bullet point titled "**${companyProfile.name} Readiness Tip**" and a dedicated bullet point titled "**Resume Building Suggestions**".

    Transcript:
    ${historyContext}`;

    try {
      const text = await generateSmartAIContent({
        contents: prompt,
        systemInstruction: "You are a supportive interview coach that outputs ONLY raw JSON without markdown formatting.",
        responseMimeType: "application/json",
      });

      const parsed = parseAIJson(text);
      if (parsed.strengths) {
        feedbackData = parsed as any;
      }
    } catch (err) {
      console.warn("AI Feedback generation failed. Falling back to default feedback data.", err);
    }

    const feedback = await prisma.feedback.upsert({
      where: { interviewId },
      update: {
        strengths: feedbackData.strengths,
        weaknesses: feedbackData.weaknesses,
        suggestions: feedbackData.suggestions,
      },
      create: {
        interviewId,
        strengths: feedbackData.strengths,
        weaknesses: feedbackData.weaknesses,
        suggestions: feedbackData.suggestions,
      },
    });

    // Clean up Redis chat memory cache after feedback report generation
    clearCachedChatMemory(interviewId).catch(() => null);

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error generating feedback:", error);
    return NextResponse.json(
      { message: "An error occurred while generating feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: interviewId } = await params;

    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: user.id },
          { email: user.email || "" },
        ],
      },
    }).catch(() => null);

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const feedback = await prisma.feedback.findUnique({
      where: { interviewId },
      include: { interview: { include: { questions: { include: { answers: true } } } } }
    });

    if (!feedback || feedback.interview.userId !== dbUser.id) {
      return NextResponse.json({ message: "Feedback not found" }, { status: 404 });
    }

    return NextResponse.json(feedback, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Error fetching feedback" }, { status: 500 });
  }
}
