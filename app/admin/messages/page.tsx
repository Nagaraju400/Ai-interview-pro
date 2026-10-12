import { prisma } from "@/lib/prisma";
import { MessageSquare, Mail, Calendar, CheckCircle, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminHelpMessagesPage() {
  const helpMessageDelegate = (prisma as any).helpMessage;
  const messages = helpMessageDelegate
    ? await helpMessageDelegate.findMany({ orderBy: { createdAt: "desc" } })
    : [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" /> Help & Support Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Review user inquiries, support tickets, and feedback sent via the Help form.
          </p>
        </div>
        <div className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-semibold">
          {messages.length} Total Messages
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="p-12 text-center border rounded-2xl bg-card">
          <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No Help Messages Received Yet</h3>
          <p className="text-sm text-muted-foreground">
            Messages submitted by users via the Help navbar link will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg: { id: string; name: string | null; email: string; subject: string | null; message: string; status: string; createdAt: Date }) => (
            <div key={msg.id} className="p-6 rounded-2xl border bg-card shadow-sm space-y-3 transition-all hover:border-primary/40">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {(msg.name || msg.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{msg.name || "Anonymous User"}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <a href={`mailto:${msg.email}`} className="text-primary hover:underline font-medium">
                        {msg.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-md font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(msg.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full font-semibold border ${
                    msg.status === "UNREAD"
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : "bg-green-500/10 text-green-600 border-green-500/20"
                  }`}>
                    {msg.status}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                  Subject: {msg.subject || "General Support Request"}
                </div>
                <p className="text-sm text-foreground/90 bg-muted/30 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Ai Interview Pro Support")}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-lg transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" /> Reply to Candidate Email
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
