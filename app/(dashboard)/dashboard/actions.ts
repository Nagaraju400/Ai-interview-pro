"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteInterview(interviewId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
      return { success: false, message: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    });

    if (!dbUser) {
      return { success: false, message: "User not found" };
    }

    // Verify ownership
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId: dbUser.id }
    });

    if (!interview) {
      return { success: false, message: "Interview not found or unauthorized" };
    }

    // Delete the interview. Prisma's onDelete: Cascade will handle Questions, Answers, Feedback
    await prisma.interview.delete({
      where: { id: interviewId }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false, message: "Failed to delete interview" };
  }
}
