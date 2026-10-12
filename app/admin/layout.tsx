import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut, ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAdminSession, clearAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import AdminSidebarLinks from "./AdminSidebarLinks";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/admin" className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground p-1 rounded">
              <LayoutDashboard className="w-4 h-4" />
            </span>
            Admin Portal
          </Link>
        </div>
        
        <AdminSidebarLinks />

        <div className="px-4 pb-4">
          <form action={async () => {
            "use server";
            await clearAdminSession();
            redirect("/admin-login");
          }}>
            <Button variant="ghost" type="submit" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </form>
        </div>

        <div className="p-4 border-t space-y-2">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full justify-start">
              <ArrowLeft className="w-4 h-4 mr-3" />
              Back to App
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="h-16 border-b bg-card flex items-center px-8 justify-between sticky top-0 z-10">
          <h2 className="font-semibold text-lg text-foreground">Dashboard</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">{dbAdmin.email}</span>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
              {dbAdmin.email?.[0].toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
