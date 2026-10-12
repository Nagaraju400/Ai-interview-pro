import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature || !webhookSecret) {
      return new NextResponse('Webhook secret or signature missing', { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === 'subscription.charged' || event.event === 'subscription.activated') {
      const subscription = event.payload.subscription.entity;
      // payment entity might not be present on all events but we can get customer_id from subscription
      const customerId = subscription.customer_id || event.payload.payment?.entity?.customer_id;

      const userId = subscription.notes?.userId;
      const planName = subscription.notes?.planName;

      if (!userId) {
        return new NextResponse('User ID missing from notes', { status: 400 });
      }

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          razorpaySubscriptionId: subscription.id,
          razorpayCustomerId: customerId,
          subscriptionPlan: planName || "PRO",
          subscriptionStatus: subscription.status,
        },
      });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error handling Razorpay webhook:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
