"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { createAdminSession, createOtpSession, getOtpSession, clearOtpSession } from "@/lib/admin-auth";

// Helper: Generate dynamic single-use Security Passkey
function generateDynamicPasskey(): string {
  const prefix = "PASS";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${randomPart}`;
}

// Method 1 (Step 1): Request Dynamic Security Passkey
export async function requestDynamicPasskey(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and Password are required." };
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return { error: "Invalid admin credentials." };
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return { error: "Invalid admin credentials." };
  }

  // Generate DYNAMIC single-use Passkey
  const dynamicPasskey = generateDynamicPasskey();
  console.log("\n=========================================");
  console.log(`🔐 DYNAMIC ADMIN PASSKEY FOR ${email}: ${dynamicPasskey}`);
  console.log("=========================================\n");

  const apiKey = process.env.RESEND_API_KEY;
  const targetRecipient = process.env.ADMIN_EMAIL || "nikhilcm83@gmail.com";

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "AI Interview Pro <onboarding@resend.dev>",
        to: [targetRecipient],
        subject: `Your Dynamic Admin Security Passkey: ${dynamicPasskey}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #1e2838; margin-top: 0;">Dynamic Admin Security Passkey</h2>
            <p style="color: #475569; font-size: 14px;">A dynamic security passkey was generated for your admin account (<strong>${email}</strong>):</p>
            <div style="background-color: #f1f5f9; padding: 18px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: 800; font-family: monospace; letter-spacing: 4px; color: #2563eb; margin: 20px 0; border: 1px solid #bfdbfe;">
              ${dynamicPasskey}
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5;">
              This passkey is dynamically generated, single-use, and valid for 10 minutes. Enter this code into your login screen to gain administrative access.
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send dynamic passkey email:", emailErr);
    }
  }

  const passkeyHash = await bcrypt.hash(dynamicPasskey.trim().toUpperCase(), 10);
  await createOtpSession(admin.id, passkeyHash);

  return { requirePasskeyInput: true, generatedKey: dynamicPasskey };
}

// Method 1 (Step 2): Verify Dynamic Security Passkey
export async function verifyDynamicPasskey(formData: FormData) {
  const enteredPasskey = formData.get("passkey") as string;

  if (!enteredPasskey) {
    return { error: "Please enter your dynamic security passkey." };
  }

  const session = await getOtpSession();
  if (!session || !session.adminId || !session.otpHash) {
    return { error: "Passkey session expired. Please request a new dynamic passkey." };
  }

  const isPasskeyValid = await bcrypt.compare(
    enteredPasskey.trim().toUpperCase(),
    session.otpHash as string
  );

  if (!isPasskeyValid) {
    return { error: "Invalid dynamic passkey. Please check your email or terminal code and try again." };
  }

  await clearOtpSession();
  await createAdminSession(session.adminId as string);

  return { success: true };
}

// Method 2 (Step 1): Send 6-Digit Email OTP
export async function sendAdminOtp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and Password are required." };
  }

  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return { error: "Invalid admin credentials." };
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return { error: "Invalid admin credentials." };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("\n=========================================");
  console.log(`🔐 ADMIN LOGIN OTP FOR ${email}: ${otp}`);
  console.log("=========================================\n");

  const apiKey = process.env.RESEND_API_KEY;
  const targetRecipient = process.env.ADMIN_EMAIL || "nikhilcm83@gmail.com";

  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      await resend.emails.send({
        from: "AI Interview Pro <onboarding@resend.dev>",
        to: [targetRecipient],
        subject: `Your Admin Login Verification OTP: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e2838; margin-top: 0;">Admin Portal Verification Code</h2>
            <p style="color: #475569; font-size: 14px;">Use the following 6-digit verification code to complete your sign-in to <strong>Ai Interview Pro Admin Portal</strong>:</p>
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #2563eb; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #94a3b8; font-size: 12px;">This security code is valid for 10 minutes.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send verification email:", emailErr);
    }
  }

  const otpHash = await bcrypt.hash(otp, 10);
  await createOtpSession(admin.id, otpHash);

  return { requireOtp: true };
}

// Method 2 (Step 2): Verify 6-Digit OTP Code
export async function verifyAdminOtp(formData: FormData) {
  const code = formData.get("code") as string;

  if (!code || code.length !== 6) {
    return { error: "Please enter a valid 6-digit OTP code." };
  }

  const otpSession = await getOtpSession();
  if (!otpSession || !otpSession.adminId || !otpSession.otpHash) {
    return { error: "OTP session expired. Please log in again." };
  }

  const isOtpValid = await bcrypt.compare(code, otpSession.otpHash as string);
  if (!isOtpValid) {
    return { error: "Incorrect OTP code. Please check your email and try again." };
  }

  await clearOtpSession();
  await createAdminSession(otpSession.adminId as string);

  return { success: true };
}
