import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, subject, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { message: "Email and message are required." },
        { status: 400 }
      );
    }

    const senderName = `${firstName || ""} ${lastName || ""}`.trim() || "User";

    // 1. Save to Database so Admin can read messages in Admin Portal (/admin/messages)
    try {
      await prisma.helpMessage.create({
        data: {
          name: senderName,
          email,
          subject: subject || "General Inquiry",
          message,
          status: "UNREAD",
        },
      });
    } catch (dbErr) {
      console.warn("Could not save help message to DB:", dbErr);
    }

    const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@ai-interview.com";
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      const resend = new Resend(apiKey);

      // 2. Send notification to Company Admin Support inbox
      await resend.emails.send({
        from: "AI Interview Pro <onboarding@resend.dev>",
        to: [adminEmail],
        replyTo: email,
        subject: `[Help Inquiry] ${subject || "Support Request"} from ${senderName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e2838;">New Support Inquiry</h2>
            <p><strong>From:</strong> ${senderName} (${email})</p>
            <p><strong>Subject:</strong> ${subject || "General Inquiry"}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 14px; line-height: 1.6; color: #334155;"><strong>Message:</strong></p>
            <blockquote style="background-color: #f8fafc; padding: 12px 16px; border-left: 4px solid #2563eb; margin: 0; color: #1e293b;">
              ${message.replace(/\n/g, "<br />")}
            </blockquote>
          </div>
        `,
      });

      // 3. Send confirmation auto-reply to the user
      await resend.emails.send({
        from: "AI Interview Pro <onboarding@resend.dev>",
        to: [email],
        subject: `We received your message - Ai Interview Pro Support`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e2838;">Thank you for contacting Ai Interview Pro</h2>
            <p>Hi ${firstName || "there"},</p>
            <p>We have received your message regarding <strong>${subject || "your inquiry"}</strong>. Our dedicated support team is reviewing your request and will get back to you shortly.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 12px; color: #64748b;">Ai Interview Pro Inc. • Corporate Support Division</p>
          </div>
        `,
      });
    }

    return NextResponse.json(
      { success: true, message: "Support inquiry sent successfully to company email and admin portal." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in contact API route:", error);
    return NextResponse.json(
      { message: error.message || "Failed to process support message." },
      { status: 500 }
    );
  }
}
