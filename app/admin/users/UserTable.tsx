"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, Loader2, Mail, Eye } from "lucide-react";
import { deleteUser } from "./actions";

type UserType = {
  id: string;
  name: string | null;
  email: string | null;
  subscriptionPlan: string;
  createdAt: Date;
};

export default function UserTable({ initialUsers }: { initialUsers: UserType[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [emailLoadingId, setEmailLoadingId] = useState<string | null>(null);


  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    
    setLoadingId(userId);
    const res = await deleteUser(userId);
    if (res.success) {
      setUsers(users.filter(u => u.id !== userId));
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  const handleEmailReport = async (userId: string) => {
    setEmailLoadingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/email-report`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");
      alert("Latest interview report sent successfully to the user!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setEmailLoadingId(null);
    }
  };

  return (
    <div className="rounded-2xl border overflow-hidden bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Plan</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium">
                  <Link href={`/admin/users/${u.id}`} className="hover:text-primary hover:underline flex items-center gap-2">
                    {u.name || "N/A"}
                  </Link>
                </td>
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
                <td className="px-6 py-4 text-muted-foreground">
                  {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {loadingId === u.id || emailLoadingId === u.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Link href={`/admin/users/${u.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => handleEmailReport(u.id)} className="h-8 w-8 text-muted-foreground hover:text-blue-500" title="Email Latest Report">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive" title="Delete User">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
