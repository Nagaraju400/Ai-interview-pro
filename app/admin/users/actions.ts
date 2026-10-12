"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";

// Helper to check admin status securely in server actions
async function requireAdmin() {
  const session = await getAdminSession();
  
  if (!session?.adminId) {
    throw new Error("Unauthorized");
  }

  const dbAdmin = await prisma.admin.findUnique({
    where: { id: session.adminId as string }
  });

  if (!dbAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function updateUserPlan(userId: string, newPlan: string) {
  try {
    await requireAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionPlan: newPlan }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return { error: error.message || "Failed to update user" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await requireAdmin();
    // This will cascade delete their interviews and resumes if configured in Prisma
    await prisma.user.delete({
      where: { id: userId }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { error: error.message || "Failed to delete user" };
  }
}
