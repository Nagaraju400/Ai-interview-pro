import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { role, interviewType, company } = await req.json();

    if (!role || !interviewType) {
      return NextResponse.json(
        { message: "Role and Interview Type are required" },
        { status: 400 }
      );
    }

    // Ensure database user exists safely (Search by ID or Email first to avoid Unique Constraint collision)
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
      return NextResponse.json({ message: "User profile not found in DB" }, { status: 404 });
    }

    // Enforce Mandatory Resume Pre-requisite: Candidate must have an uploaded resume
    const existingResume = await prisma.resume.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    if (!existingResume) {
      return NextResponse.json(
        {
          error: "RESUME_REQUIRED",
          message: "Resume Required: You must upload and validate a genuine candidate resume before setting up or taking an AI mock interview.",
          hasResume: false,
        },
        { status: 400 }
      );
    }

    // Enforce Pricing Plan Limits
    if (dbUser.subscriptionPlan === "FREE") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const interviewCount = await prisma.interview.count({
        where: {
          userId: dbUser.id,
          createdAt: {
            gte: startOfMonth,
          },
        },
      });

      if (interviewCount >= 3) {
        return NextResponse.json(
          { message: "You have reached your limit of 3 mock interviews this month. Upgrade to Grad Pro for unlimited interviews!" },
          { status: 403 }
        );
      }
    }

    // Create a new interview session in the DB
    const interview = await prisma.interview.create({
      data: {
        userId: dbUser.id,
        role: String(role).trim(),
        interviewType: String(interviewType).trim(),
        company: company ? String(company).trim() : null,
      },
    });

    return NextResponse.json({ interviewId: interview.id }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      { message: "An error occurred while setting up the interview", error: error?.message },
      { status: 500 }
    );
  }
}
