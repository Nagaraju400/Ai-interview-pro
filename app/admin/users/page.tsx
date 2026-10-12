import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import UserTable from "./UserTable";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminUsersPage() {
  const session = await getAdminSession();

  if (!session?.adminId) {
    redirect("/admin-login");
  }

  const dbAdmin = await prisma.admin.findUnique({
    where: { id: session.adminId as string }
  });

  if (!dbAdmin) {
    redirect("/admin-login");
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionPlan: true,
      createdAt: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">User Management</h1>
        <p className="text-muted-foreground">View, edit, and manage all registered users.</p>
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
