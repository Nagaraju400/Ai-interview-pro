"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSidebarLinks() {
  const pathname = usePathname();

  const isOverviewActive = pathname === "/admin";
  const isUsersActive = pathname.startsWith("/admin/users");
  const isMessagesActive = pathname.startsWith("/admin/messages");

  return (
    <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
      <Link href="/admin">
        <Button
          variant={isOverviewActive ? "secondary" : "ghost"}
          className={`w-full justify-start font-medium transition-all ${
            isOverviewActive
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 mr-3 ${isOverviewActive ? "text-primary" : ""}`} />
          Overview
        </Button>
      </Link>

      <Link href="/admin/users">
        <Button
          variant={isUsersActive ? "secondary" : "ghost"}
          className={`w-full justify-start font-medium transition-all ${
            isUsersActive
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className={`w-4 h-4 mr-3 ${isUsersActive ? "text-primary" : ""}`} />
          Users
        </Button>
      </Link>

      <Link href="/admin/messages">
        <Button
          variant={isMessagesActive ? "secondary" : "ghost"}
          className={`w-full justify-start font-medium transition-all ${
            isMessagesActive
              ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className={`w-4 h-4 mr-3 ${isMessagesActive ? "text-primary" : ""}`} />
          Help Messages
        </Button>
      </Link>
    </nav>
  );
}
