import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.ADMIN_JWT_SECRET || "fallback-secret-for-development-only";
const key = new TextEncoder().encode(secretKey);

export async function createAdminSession(adminId: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function verifyToken(session: string) {
  try {
    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

// --- OTP Session Management ---

export async function createOtpSession(adminId: string, otpHash: string) {
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes valid
  const session = await new SignJWT({ adminId, otpHash })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set("admin_otp_pending", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function getOtpSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_otp_pending")?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function clearOtpSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_otp_pending");
}
