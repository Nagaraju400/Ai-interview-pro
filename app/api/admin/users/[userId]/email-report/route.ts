import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import { sendInterviewReportEmail } from "@/lib/email-service";

export async function POST(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session?.adminId) {
      return NextResponse.json({ message: "Unauthorized admin" }, { status: 401 });
    }

    const { userId } = await params;

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser || !dbUser.email) {
      return NextResponse.json({ message: "User or user email not found" }, { status: 404 });
    }

    // Find the latest completed interview for this user
    const latestInterview = await prisma.interview.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
      include: { feedback: true }
    });

    if (!latestInterview || !latestInterview.feedback) {
      return NextResponse.json({ message: "No completed interview with feedback found for this user" }, { status: 404 });
    }

    const result = await sendInterviewReportEmail({
      interviewId: latestInterview.id,
      userEmail: dbUser.email,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: result.reason || (result.error ? String(result.error) : "Failed to dispatch email") },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, id: result.emailId }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while sending the email" },
      { status: 500 }
    );
  }
}
