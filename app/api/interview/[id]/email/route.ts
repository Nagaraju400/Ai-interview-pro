import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendInterviewReportEmail } from "@/lib/email-service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ message: "Unauthorized or missing email" }, { status: 401 });
    }

    const { id: interviewId } = await params;

    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const result = await sendInterviewReportEmail({
      interviewId,
      userEmail: user.email,
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
