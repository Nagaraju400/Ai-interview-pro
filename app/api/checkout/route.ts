import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TOrk5o8curMN2h';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '4Ij41I6BfISOdmZ3sFrkDJMj';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { priceId, planName } = await req.json();

    const dbUser = await prisma.user.findUnique({ where: { email: user.email || '' } }).catch(() => null);
    const userId = dbUser?.id || user.id;

    let subscriptionId: string | null = null;
    let orderId: string | null = null;

    if (priceId && typeof priceId === 'string' && priceId.startsWith("plan_")) {
      try {
        const subscription = await razorpay.subscriptions.create({
          plan_id: priceId,
          customer_notify: 1,
          total_count: 12,
          notes: {
            userId: userId,
            planName: planName || "Grad Pro"
          }
        });
        subscriptionId = subscription.id;
      } catch (subErr: any) {
        console.warn("Razorpay Subscription API note: Fallback to Orders API.", subErr?.message || subErr);
      }
    }

    if (!subscriptionId) {
      // Fallback to Razorpay Orders API (amount in paise: ₹299 = 29900, ₹2999 = 299900)
      const isYearly = planName?.toLowerCase().includes("yearly");
      const amountInPaise = isYearly ? 299900 : 29900;

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: {
          userId: userId,
          planName: planName || "Grad Pro"
        }
      });
      orderId = order.id;
    }

    return NextResponse.json({ subscriptionId, orderId, keyId });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error?.message || 'Internal Error' }, { status: 500 });
  }
}
