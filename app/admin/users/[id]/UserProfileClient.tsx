"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Mail, Trash2, Calendar, FileText, 
  Video, CheckCircle2, Shield, User as UserIcon,
  Briefcase, Award, ExternalLink, Loader2
} from "lucide-react";
import { deleteUser, updateUserPlan } from "../actions";

type Props = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    subscriptionPlan: string;
    subscriptionStatus: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    razorpayCustomerId: string | null;
    razorpaySubscriptionId: string | null;
    resumes: Array<{
      id: string;
      fileUrl: string;
      parsedData: string | null;
      createdAt: Date;
    }>;
    interviews: Array<{
      id: string;
      role: string;
      company: string | null;
      interviewType: string;
      createdAt: Date;
      feedback: {
        id: string;
        strengths: string;
        weaknesses: string;
        suggestions: string;
      } | null;
      questions: Array<{
        id: string;
        question: string;
        difficulty: string;
        answers: Array<{
          id: string;
          score: number | null;
        }>;
      }>;
    }>;
  };
};

export default function UserProfileClient({ user }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(user.subscriptionPlan);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState(user.email || "");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);

  const handleUpdateEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      alert("Please enter a valid email address (e.g. name@domain.com)");
      return;
    }
    setEmailSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update email");
      alert("User email updated successfully to: " + userEmail);
      setIsEditingEmail(false);
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setEmailSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    setIsDeleting(true);
    const res = await deleteUser(user.id);
    if (res.success) {
      router.push("/admin/users");
      router.refresh();
    } else {
      alert(res.error || "Failed to delete user");
      setIsDeleting(false);
    }
  };

  const handleEmailReport = async () => {
    setEmailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/email-report`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");
      alert("Latest interview performance report emailed successfully!");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePlanChange = async (newPlan: string) => {
    setPlanLoading(true);
    const res = await updateUserPlan(user.id, newPlan);
    if (res.success) {
      setCurrentPlan(newPlan);
      router.refresh();
    } else {
      alert(res.error || "Failed to update plan");
    }
    setPlanLoading(false);
  };

  const selectedInterview = user.interviews.find((i) => i.id === selectedInterviewId);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <Link href="/admin/users" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-extrabold flex items-center justify-center text-xl shrink-0">
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                {user.name || "Unnamed User"}
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  currentPlan !== "FREE" 
                    ? "bg-green-500/10 text-green-600 border-green-500/20" 
                    : "bg-muted text-muted-foreground border-border"
                }`}>
                  {currentPlan}
                </span>
              </h1>
              {isEditingEmail ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="px-3 py-1 rounded-lg border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter valid email address..."
                  />
                  <Button size="sm" onClick={handleUpdateEmail} disabled={emailSaving} className="h-8 text-xs font-semibold">
                    {emailSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Email"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingEmail(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-muted-foreground">{userEmail || "No email set"}</p>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="text-xs font-semibold text-primary hover:underline ml-1"
                  >
                    Edit Email ID
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleEmailReport} 
            disabled={emailLoading || user.interviews.length === 0}
            className="h-10 bg-primary text-primary-foreground font-semibold shadow-sm"
          >
            {emailLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
            Send PDF Report
          </Button>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="h-10"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete User
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-card border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews Taken</span>
            <Video className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-extrabold">{user.interviews.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total sessions practiced</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resumes Uploaded</span>
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold">{user.resumes.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Documents on file</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Account Role</span>
            <Shield className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold capitalize">{user.role.toLowerCase()}</p>
          <p className="text-xs text-muted-foreground mt-1">Access privilege level</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Member Since</span>
            <Calendar className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-lg font-bold">
            {format(new Date(user.createdAt), "MMM d, yyyy")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Account & Subscription Settings Box */}
      <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-primary" /> Account & Subscription Management
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2">
              Subscription Plan
            </label>
            <div className="flex items-center gap-3">
              <select
                value={currentPlan}
                onChange={(e) => handlePlanChange(e.target.value)}
                disabled={planLoading}
                className="px-3 py-2 rounded-xl border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="FREE">FREE</option>
                <option value="PRO">PRO</option>
                <option value="PREMIUM">PREMIUM</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
              </select>
              {planLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-muted-foreground block mb-2">User ID</span>
            <code className="text-xs bg-muted px-3 py-2 rounded-xl block truncate font-mono text-muted-foreground">
              {user.id}
            </code>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase text-muted-foreground block mb-2">Payment Customer ID</span>
            <p className="text-sm font-medium text-foreground">
              {user.razorpayCustomerId || "None registered"}
            </p>
          </div>
        </div>
      </div>

      {/* Interviews Practice History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" /> Interview Practice History ({user.interviews.length})
        </h2>

        {user.interviews.length === 0 ? (
          <div className="p-8 rounded-2xl border bg-card text-center text-muted-foreground">
            No interview sessions completed by this user yet.
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Role / Position</th>
                    <th className="px-6 py-4 font-medium">Company</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Feedback Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {user.interviews.map((interview) => (
                    <tr key={interview.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">{interview.role}</td>
                      <td className="px-6 py-4 text-muted-foreground">{interview.company || "General"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          {interview.interviewType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(interview.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        {interview.feedback ? (
                          <span className="inline-flex items-center text-xs font-semibold text-green-600 gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Evaluated
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInterviewId(interview.id)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Resumes Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" /> Uploaded Resumes ({user.resumes.length})
        </h2>

        {user.resumes.length === 0 ? (
          <div className="p-8 rounded-2xl border bg-card text-center text-muted-foreground">
            No resume uploaded by this user yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.resumes.map((resume) => (
              <div key={resume.id} className="p-6 rounded-2xl bg-card border shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-500" />
                    <div>
                      <h4 className="font-semibold text-sm">Resume Document</h4>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {resume.fileUrl && (
                    <a
                      href={resume.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      View File <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {resume.parsedData && (
                  <div className="bg-muted/40 p-3 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground uppercase text-[10px] block">Extracted Summary</span>
                    <p className="line-clamp-3 text-foreground/80">{resume.parsedData}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-xl font-bold">{selectedInterview.role} Interview</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedInterview.company || "General"} • {selectedInterview.interviewType} • {format(new Date(selectedInterview.createdAt), "PPP")}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedInterviewId(null)}>
                Close
              </Button>
            </div>

            {selectedInterview.feedback ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">Key Strengths</h4>
                  <p className="text-sm text-foreground">{selectedInterview.feedback.strengths}</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">Areas for Improvement</h4>
                  <p className="text-sm text-foreground">{selectedInterview.feedback.weaknesses}</p>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">Actionable Suggestions</h4>
                  <p className="text-sm text-foreground">{selectedInterview.feedback.suggestions}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No feedback report recorded for this session yet.</p>
            )}

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold">Questions Asked ({selectedInterview.questions.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedInterview.questions.map((q, idx) => (
                  <div key={q.id} className="p-3 rounded-xl border bg-muted/30 text-xs space-y-1">
                    <span className="font-semibold text-primary">Q{idx + 1}: {q.question}</span>
                    <span className="block text-[10px] text-muted-foreground capitalize">Difficulty: {q.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
