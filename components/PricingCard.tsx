"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function PricingCard({ 
  title, 
  price, 
  originalPrice,
  badge,
  description, 
  features, 
  buttonText, 
  highlighted = false,
  priceId
}: { 
  title: string, 
  price: string, 
  originalPrice?: string,
  badge?: string,
  description: string, 
  features: string[], 
  buttonText: string, 
  highlighted?: boolean,
  priceId?: string
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (price === "Free" || price === "Custom") {
      router.push("/register");
      return;
    }

    try {
      setIsLoading(true);
      
      // Dynamically load Razorpay script
      const res = await new Promise((resolve) => {
        if (document.getElementById('razorpay-checkout-js')) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-js';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setIsLoading(false);
        return;
      }

      if (!priceId) {
        alert("Plan ID is missing for this subscription tier.");
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceId,
          planName: title
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        const errData = await response.json().catch(() => null);
        const errorMsg = errData?.error || errData?.message || 'Payment service error. Please try again.';
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const subscriptionId = data.subscriptionId;
      const orderId = data.orderId;
      const keyId = data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TOrk5o8curMN2h';
      
      if (subscriptionId || orderId) {
        const options: any = {
          key: keyId,
          name: "Ai Interview Pro",
          description: `Subscription for ${title}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async function (response: any) {
            try {
              await fetch('/api/checkout/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...response,
                  planName: title
                })
              });
            } catch (err) {
              console.error("Payment verification failed", err);
            }
            router.push('/dashboard?success=true');
          },
          theme: {
            color: "#6366f1",
          },
        };

        if (subscriptionId) {
          options.subscription_id = subscriptionId;
        } else if (orderId) {
          options.order_id = orderId;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rzp = new (window as unknown as { Razorpay: any }).Razorpay(options);
        rzp.on('payment.failed', function (response: { error: { description: string } }) {
          console.error(response.error);
          alert(response.error.description);
        });
        rzp.open();
      }
    } catch (error: any) {
      console.error("Error redirecting to checkout", error);
      alert(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`relative p-8 rounded-[1.25rem] h-full flex flex-col transition-all duration-300 ${highlighted ? 'border-primary ring-1 ring-primary shadow-2xl shadow-primary/10 bg-primary text-primary-foreground' : 'glass border border-border bg-card text-card-foreground hover:border-foreground/20'}`}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background text-xs font-bold uppercase tracking-wider rounded-full shadow-md z-10 whitespace-nowrap">
          {badge}
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-end gap-2 mb-2">
          <div className="text-4xl font-extrabold tracking-tight">{price}</div>
          {originalPrice && (
            <div className={`text-lg line-through mb-1 opacity-70 ${highlighted ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              {originalPrice}
            </div>
          )}
        </div>
        <p className={`text-sm ${highlighted ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{description}</p>
      </div>
      
      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start text-sm font-medium">
            <Check className={`h-5 w-5 mr-3 shrink-0 ${highlighted ? 'text-primary-foreground' : 'text-primary'}`} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={highlighted ? "secondary" : "default"} 
        onClick={handleCheckout}
        disabled={isLoading}
        className={`w-full h-12 text-base font-semibold rounded-full ${highlighted ? 'text-primary hover:bg-white/90' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20'}`}
      >
        {isLoading ? "Loading..." : buttonText}
      </Button>
    </div>
  );
}
