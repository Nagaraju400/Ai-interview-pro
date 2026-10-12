import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session?.adminId) {
      return NextResponse.json({ message: "Unauthorized admin" }, { status: 401 });
    }

    const { userId } = await params;
    const body = await req.json();
    const { email, name, subscriptionPlan } = body;

    // Validate email format if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return NextResponse.json(
          { message: "Please provide a valid email address (e.g. user@domain.com)" },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { message: "This email address is already in use by another account." },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (subscriptionPlan !== undefined) updateData.subscriptionPlan = subscriptionPlan;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while updating the user." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session?.adminId) {
      return NextResponse.json({ message: "Unauthorized admin" }, { status: 401 });
    }

    const { userId } = await params;

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred while deleting the user." },
      { status: 500 }
    );
  }
}
