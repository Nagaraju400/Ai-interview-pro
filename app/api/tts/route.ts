import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "ElevenLabs API route has been deprecated. Application uses standard free male AI speech synthesis." },
    { status: 410 }
  );
}
