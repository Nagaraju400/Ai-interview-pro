import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/help" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Help Center
      </Link>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <User className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Account Management</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          Keep your profile up to date and manage your personal data securely.
        </p>
        
        <h3 className="text-2xl font-semibold mt-10 mb-4">Updating Your Profile</h3>
        <p className="text-muted-foreground mb-4">
          You can change your name, profile picture, and contact email from the "Settings" page in your Dashboard. Keeping your profile updated helps our AI personalize your experience better.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4">Password Resets</h3>
        <p className="text-muted-foreground mb-4">
          If you forget your password, click the "Forgot Password" link on the login page. We'll send you an email with a secure link to reset it. If you're already logged in, you can change your password securely from your Account Settings.
        </p>
        
        <h3 className="text-2xl font-semibold mt-10 mb-4">Data Privacy & Deletion</h3>
        <p className="text-muted-foreground mb-4">
          We take your privacy seriously. You have full control over your data. If you wish to delete your account entirely, navigate to the bottom of the Settings page and click "Delete Account". Please note that this action is irreversible and will permanently delete all your interview history and uploaded resumes.
        </p>
      </div>
    </div>
  );
}
