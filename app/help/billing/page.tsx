import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/help" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Help Center
      </Link>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <CreditCard className="w-6 h-6" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Billing & Subscriptions</h1>
      </div>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-lg text-muted-foreground">
          Manage your Ai Interview Pro subscription securely. We use industry-standard payment processors to handle all transactions.
        </p>
        
        <h3 className="text-2xl font-semibold mt-10 mb-4">Pricing Tiers</h3>
        <p className="text-muted-foreground mb-4">
          <br/>- <strong>Free Tier:</strong> Includes 3 mock interviews per month. Powered by Google Gemini AI.
          <br/>- <strong>Pro Tier:</strong> Unlimited interviews, Powered by Groq Llama 3.3 70B Ultra-Fast AI, advanced analytics, and priority support.
        </p>

        <h3 className="text-2xl font-semibold mt-10 mb-4">Upgrading or Canceling</h3>
        <p className="text-muted-foreground mb-4">
          You can manage your subscription at any time by navigating to your Dashboard and clicking on "Billing". From there, you can upgrade to Pro, update your payment method, or cancel your subscription. Cancellations take effect at the end of your current billing cycle.
        </p>
        
        <h3 className="text-2xl font-semibold mt-10 mb-4">Refund Policy</h3>
        <p className="text-muted-foreground mb-4">
          We offer a 7-day money-back guarantee for all new Pro subscriptions. If you're not satisfied with the platform within your first week, simply contact support for a full refund.
        </p>
      </div>
    </div>
  );
}
