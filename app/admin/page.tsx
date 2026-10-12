import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Users, Crown, Video, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session?.adminId) {
    redirect("/admin-login");
  }

  // Admin check
  const dbAdmin = await prisma.admin.findUnique({
    where: { id: session.adminId as string }
  });

  if (!dbAdmin) {
    redirect("/admin-login");
  }

  // Fetch metrics
  const totalUsers = await prisma.user.count();
  const proUsers = await prisma.user.count({
    where: {
      subscriptionPlan: {
        not: "FREE"
      }
    }
  });
  const totalInterviews = await prisma.interview.count();
  
  // Recent 10 users
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-lg">System metrics and recent user signups.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
          <p className="text-4xl font-bold">{totalUsers}</p>
        </div>
        
        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
            <Crown className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Pro Subscriptions</p>
          <p className="text-4xl font-bold">{proUsers}</p>
        </div>

        <div className="p-6 rounded-2xl border bg-card shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
            <Video className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Interviews</p>
          <p className="text-4xl font-bold">{totalInterviews}</p>
        </div>
      </div>

      {/* Recent Users Table */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Recent Signups</h2>
        <div className="rounded-2xl border overflow-hidden bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{u.name || "N/A"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.subscriptionPlan !== "FREE" ? (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-600">
                          {u.subscriptionPlan}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
                {recentUsers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
