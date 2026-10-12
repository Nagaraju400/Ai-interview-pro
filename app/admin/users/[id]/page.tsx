import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import UserProfileClient from "./UserProfileClient";

export default async function AdminUserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();

  if (!session?.adminId) {
    redirect("/admin-login");
  }

  const dbAdmin = await prisma.admin.findUnique({
    where: { id: session.adminId as string },
  });

  if (!dbAdmin) {
    redirect("/admin-login");
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        include: {
          feedback: true,
          questions: {
            include: {
              answers: true,
            },
          },
        },
      },
      resumes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return <UserProfileClient user={user} />;
}
